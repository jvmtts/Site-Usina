import { createHash } from 'node:crypto'
import { identifier } from './conta-azul.mjs'

const sellableType = new Set(['MERCADORIA_PARA_REVENDA', 'PRODUTO_ACABADO'])
const acceptedKinds = new Set(['PRODUTO', 'KIT_PRODUTO', 'VARIACAO_PRODUTO'])
const shortText = (value, size = 180) => typeof value === 'string' ? value.trim().slice(0, size) : ''
const normalized = value => shortText(value, 240).normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const stock = product => Number.isFinite(product.estoque?.quantidade_disponivel)
  ? product.estoque.quantidade_disponivel : null
const sellingPrice = (product, fallback) => {
  const value = product.estoque?.valor_venda ?? fallback
  return Number.isFinite(value) && value > 0 && value <= 100_000_000 ? Math.round(value * 100) / 100 : null
}
const publicId = id => 'ca-' + createHash('sha256').update(id).digest('hex').slice(0, 24)
const active = product => product.ativo !== false && product.status !== 'INATIVO'

async function loadInBatches(items, size, operation) {
  const results = []
  for (let index = 0; index < items.length; index += size) {
    results.push(...await Promise.all(items.slice(index, index + size).map(operation)))
  }
  return results
}

const keysOf = record => new Set(normalized(record).split(' ').filter(term => term.length >= 3))
function likelySame(name, candidate) {
  const a = keysOf(name)
  const b = keysOf(candidate)
  if (a.size < 3 || b.size < 3) return false
  const joint = [...a].filter(term => b.has(term)).length
  return joint >= 3 && joint / Math.max(a.size, b.size) >= 0.72
}

const preferredCatalogCategory = new Map([
  ['ancoras', 'Âncoras'], ['ancora', 'Âncoras'], ['acessorios', 'Acessórios'],
  ['coletes', 'Coletes'], ['coletes salva vidas', 'Coletes'], ['roupas', 'Roupas'],
])

function imagesFrom(product) {
  return Array.isArray(product.imagens) ? product.imagens : []
}

function variantIdsFrom(item, detail) {
  const list = [item.produtos_variacao, detail.variacao?.produtos].flatMap(rows => Array.isArray(rows) ? rows : [])
  const unique = new Map()
  for (const child of list) {
    if (!identifier.test(child?.id ?? '') || child.id === item.id) continue
    unique.set(child.id, { ...unique.get(child.id), ...child })
  }
  return [...unique.values()]
}

function variantLabel(child, detail) {
  const options = Array.isArray(child.opcoes) ? child.opcoes.map(option =>
    shortText(option.descricao ?? option.descricao_opcao ?? option.nome, 60)).filter(Boolean) : []
  return shortText(options.join(' / ') || detail.nome || child.nome, 130)
}

function parseBindings(bindings, manual) {
  if (typeof bindings !== 'object' || !bindings || Array.isArray(bindings)) throw new Error('Vínculos do catálogo inválidos.')
  const existing = new Set(manual.map(product => String(product.id)))
  const used = new Set()
  for (const [id, uuid] of Object.entries(bindings)) {
    if (!existing.has(id) || !identifier.test(uuid) || used.has(uuid)) throw new Error('Vínculo de produto inválido ou repetido.')
    used.add(uuid)
  }
  return used
}

export async function buildSnapshot({ client, manual, previousBindings = {}, configuredBindings = {}, imageFor = async () => null, now = new Date() }) {
  const bindings = { ...previousBindings, ...configuredBindings }
  parseBindings(configuredBindings, manual)
  const manualIDs = new Set(manual.map(product => String(product.id)))
  for (const id of Object.keys(bindings)) if (!manualIDs.has(id)) delete bindings[id]
  const claimed = parseBindings(bindings, manual)
  const items = await client.list()
  const variantIds = new Set(items.flatMap(item => Array.isArray(item.produtos_variacao)
    ? item.produtos_variacao.map(child => child.id) : []))
  const parents = items.filter(item => !variantIds.has(item.id) &&
    (item.tipo !== 'VARIACAO_PRODUTO' || item.produtos_variacao?.length) &&
    (acceptedKinds.has(item.tipo) || !item.tipo))
  const detailCache = new Map()
  const detailFor = id => {
    if (!detailCache.has(id)) detailCache.set(id, client.detail(id))
    return detailCache.get(id)
  }
  const details = await loadInBatches(parents, 6, async item => ({ item, detail: await detailFor(item.id) }))
  const found = new Map(details.map(record => [record.item.id, record]))
  const suggestions = new Map()
  const withheld = new Set()
  const report = { received: items.length, published: 0, linked: 0, review: [], withoutPhoto: [], unmatchedLocal: [] }
  const note = (item, reason) => report.review.push({
    id: item.id, sku: shortText(item.codigo), name: shortText(item.nome), reason,
  })

  for (const product of manual) {
    if (bindings[product.id]) continue
    const available = details.filter(({ item, detail }) => !claimed.has(item.id) && active(detail))
    const sku = shortText(product.sku).toUpperCase()
    const bySku = sku ? available.filter(({ item, detail }) =>
      shortText(detail.codigo_sku ?? item.codigo).toUpperCase() === sku) : []
    const exact = available.filter(({ item, detail }) =>
      normalized(detail.nome || item.nome) === normalized(product.nome))
    const matches = sku ? bySku : exact
    if (matches.length === 1) {
      const id = matches[0].item.id
      suggestions.set(id, [...(suggestions.get(id) ?? []), product])
    } else if (matches.length > 1) {
      for (const { item } of matches) withheld.add(item.id)
    } else {
      for (const { item, detail } of available) {
        if (likelySame(product.nome, detail.nome || item.nome)) withheld.add(item.id)
      }
    }
  }

  for (const [uuid, matches] of suggestions) {
    if (matches.length !== 1) withheld.add(uuid)
    if (!withheld.has(uuid)) {
      bindings[matches[0].id] = uuid
      claimed.add(uuid)
    }
  }

  const linkedSource = new Map(Object.entries(bindings).map(([id, uuid]) => [uuid, id]))
  const hiddenIds = []
  const catalog = []
  for (const product of manual) {
    if (!bindings[product.id]) report.unmatchedLocal.push({ id: product.id, name: product.nome })
    if (!found.has(bindings[product.id])) hiddenIds.push(String(product.id))
  }

  for (const id of withheld) {
    const record = found.get(id)
    if (record && !claimed.has(id)) note(record.item, 'possível duplicata no catálogo do site')
  }

  const records = details.filter(({ item }) => claimed.has(item.id) || !withheld.has(item.id))
  const imported = await loadInBatches(records, 4, async ({ item, detail }) => {
    const linkedId = linkedSource.get(item.id)
    const local = linkedId ? manual.find(product => String(product.id) === linkedId) : undefined
    const id = local?.id ?? publicId(item.id)
    if (local?.disponivel === false) return { hidden: id }
    const kind = detail.fiscal?.tipo_produto
    if (!active(detail) || (kind && !sellableType.has(kind))) {
      note(item, 'cadastro inativo ou material de uso interno')
      return { hidden: id }
    }
    const name = shortText(local?.nome || detail.nome || item.nome)
    const variants = variantIdsFrom(item, detail)
    const isGroup = variants.length > 0 || detail.formato === 'VARIACAO'
    const children = await loadInBatches(variants, 4, async child => ({
      child, detail: await detailFor(child.id),
    }))
    const options = []
    for (const { child, detail: option } of children) {
      const quantity = stock(option)
      const price = sellingPrice(option, child.valor_venda)
      if (!active(option) || child.status === 'INATIVO' || !(quantity > 0) || price === null) continue
      const label = variantLabel(child, option)
      if (label) options.push({ id: publicId(child.id), label, price })
    }
    const available = stock(detail)
    const price = isGroup
      ? (options.length ? Math.min(...options.map(option => option.price)) : null)
      : sellingPrice(detail, item.valor_venda)
    if (!name || price === null || (isGroup ? !options.length : !(available > 0))) {
      note(item, !name ? 'nome ausente' :
        isGroup ? 'sem variação confirmada com preço e saldo' :
          available === null ? 'saldo disponível ausente na API' :
            available <= 0 ? 'sem saldo disponível' : 'preço inválido')
      return { hidden: id }
    }
    const localImages = (local?.imagens ?? []).filter(src => typeof src === 'string' && !src.includes('via.placeholder.com'))
    let images = localImages
    if (!images.length && !Object.keys(local?.imagensPorCor ?? {}).length) {
      const candidates = imagesFrom(detail).slice(0, 3)
      const cached = []
      for (const photo of candidates) {
        const path = await imageFor(photo)
        if (path && !cached.includes(path)) cached.push(path)
      }
      images = cached
      if (!images.length) report.withoutPhoto.push({ id: item.id, name, sku: shortText(item.codigo) })
    }
    const category = shortText(detail.categoria?.descricao) || 'Equipamentos'
    const brand = shortText(detail.ecommerce?.marca?.descricao || detail.ecommerce?.marca?.nome)
    const description = shortText(local?.descricao || detail.ecommerce?.descricao_adicional || detail.descricao, 6000)
    return {
      product: {
        ...(local && {
          categoria: local.categoria, fichaTecnica: local.fichaTecnica, variacoes: local.variacoes,
          tamanhosPorCor: local.tamanhosPorCor, lentesPorCor: local.lentesPorCor,
          imagensPorCor: local.imagensPorCor, linkwhatsapp: local.linkwhatsapp,
          linkWhatsapp: local.linkWhatsapp, linkMercadoLivre: local.linkMercadoLivre,
        }),
        id, nome: name,
        categoria: local?.categoria ?? preferredCatalogCategory.get(normalized(category)) ?? category,
        preco: price, descricao: description || undefined, imagens: images, disponivel: true,
        fichaTecnica: local?.fichaTecnica ?? (brand ? { Marca: brand } : undefined),
        opcoesEstoque: options.length ? options : undefined,
      },
    }
  })

  for (const record of imported) {
    if (record.product) catalog.push(record.product)
    else hiddenIds.push(String(record.hidden))
  }
  const manualOrder = new Map(manual.map((product, order) => [product.id, order]))
  catalog.sort((left, right) =>
    (manualOrder.get(left.id) ?? Infinity) - (manualOrder.get(right.id) ?? Infinity) ||
    left.nome.localeCompare(right.nome, 'pt-BR'))
  report.published = imported.filter(record => record.product).length
  report.linked = Object.keys(bindings).length
  report.review.sort((a,b) => a.name.localeCompare(b.name,'pt-BR'))
  return { updatedAt: now.toISOString(), catalog, hiddenIds, bindings, report }
}
