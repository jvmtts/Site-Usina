import { createHash } from 'node:crypto'
import { identifier } from './conta-azul.mjs'
import { productContent } from './product-content.mjs'

const sellableType = new Set(['MERCADORIA_PARA_REVENDA', 'PRODUTO_ACABADO'])
const shortText = (value, size = 180) => typeof value === 'string' ? value.trim().slice(0, size) : ''
const normalized = value => shortText(value, 240).normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const stock = product => Number.isFinite(product.estoque?.quantidade_disponivel)
  ? product.estoque.quantidade_disponivel : null
const sellingPrice = (product, fallback) => {
  const value = product.estoque?.valor_venda ?? fallback
  return Number.isFinite(value) && value >= 0.005 && value <= 100_000_000 ? Math.round(value * 100) / 100 : null
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

const technicalFields = [
  ['peso_liquido', 'Peso líquido', 'kg'],
  ['altura', 'Altura', 'cm'],
  ['largura', 'Largura', 'cm'],
  ['profundidade', 'Profundidade', 'cm'],
]

function specifications(detail) {
  const brand = shortText(detail.ecommerce?.marca?.descricao || detail.ecommerce?.marca?.nome)
  const specs = brand ? { Marca: brand } : {}
  for (const [field, label, unit] of technicalFields) {
    const value = detail.pesos_dimensoes?.[field]
    if (Number.isFinite(value) && value > 0) specs[label] = value.toLocaleString('pt-BR') + ' ' + unit
  }
  return specs
}

function variantIdsFrom(item, detail) {
  const summary = detail.formato !== 'SIMPLES' && Array.isArray(item.produtos_variacao)
    ? item.produtos_variacao.filter(child => !child?.id_produto_pai_variacao || child.id_produto_pai_variacao === item.id)
    : []
  const detailed = Array.isArray(detail.variacao?.produtos) ? detail.variacao.produtos : []
  const unique = new Map()
  for (const child of [...summary, ...detailed]) {
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
  const legacyById = new Map(manual.map(product => [product.id, product]))
  for (const id of Object.keys(bindings)) if (!manualIDs.has(id)) delete bindings[id]
  const claimed = parseBindings(bindings, manual)
  const items = await client.list()
  const itemsById = new Map(items.map(item => [item.id, item]))

  const detailCache = new Map()
  const detailFor = id => {
    if (!detailCache.has(id)) detailCache.set(id, client.detail(id))
    return detailCache.get(id)
  }
  const reviewed = await loadInBatches(items, 6, async item => {
    const detail = await detailFor(item.id)
    return { item, detail, variants: variantIdsFrom(item, detail) }
  })
  const childIds = new Set(reviewed.flatMap(record => record.variants.map(child => child.id)))
  const details = reviewed.filter(record => !childIds.has(record.item.id))
  if (items.length && !details.length) throw new Error('Inventário sem produtos principais identificados na API.')
  const found = new Map(details.map(record => [record.item.id, record]))
  const suggestions = new Map()
  const withheld = new Set()
  const report = {
    received: items.length, examined: details.length, published: 0, linked: 0,
    review: [], withoutPrice: [], withoutPhoto: [], withoutDescription: [], unmatchedLocal: [],
  }
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
  const imported = await loadInBatches(records, 4, async ({ item, detail, variants }) => {
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
    const sku = shortText(detail.codigo_sku ?? item.codigo)
    const isGroup = variants.length > 0 || detail.formato === 'VARIACAO'
    const children = await loadInBatches(variants, 4, async child => ({
      child, detail: await detailFor(child.id),
    }))
    const options = []
    const missingPrices = []
    for (const { child, detail: option } of children) {
      if (!active(option) || child.status === 'INATIVO' || !(stock(option) > 0)) continue
      const label = variantLabel(child, option)
      if (!label) continue
      const price = sellingPrice(option, child.valor_venda)
      options.push({ id: publicId(child.id), label, price })
      if (price === null) missingPrices.push({
        id: child.id, name: name + ' · ' + label,
        sku: shortText(option.codigo_sku ?? child.codigo_sku ?? child.codigo ?? itemsById.get(child.id)?.codigo),
      })
    }
    const available = stock(detail)
    if (!name || (isGroup ? !options.length : !(available > 0))) {
      note(item, !name ? 'nome ausente' :
        isGroup ? 'sem variação com saldo confirmado' :
          available === null ? 'saldo disponível ausente na API' : 'sem saldo disponível')
      return { hidden: id }
    }
    const optionPrices = options.flatMap(option => option.price === null ? [] : [option.price])
    const price = isGroup
      ? (optionPrices.length ? Math.min(...optionPrices) : null)
      : sellingPrice(detail, item.valor_venda)
    if (!isGroup && price === null) missingPrices.push({ id: item.id, name, sku })
    report.withoutPrice.push(...missingPrices)
    const supplemental = productContent(id, normalized(detail.nome || item.nome), legacyById, normalized, options)
    const localImages = (local?.imagens ?? supplemental.images ?? [])
      .filter(src => typeof src === 'string' && !src.includes('via.placeholder.com'))
    let images = localImages
    if (!images.length && !Object.keys(local?.imagensPorCor ?? {}).length) {
      const candidates = imagesFrom(detail).slice(0, 3)
      const cached = []
      for (const photo of candidates) {
        const path = await imageFor(photo)
        if (path && !cached.includes(path)) cached.push(path)
      }
      images = cached
      if (!images.length) report.withoutPhoto.push({ id: item.id, name, sku })
    }
    const category = shortText(detail.categoria?.descricao) || 'Equipamentos'
    const resolvedCategory = ['outras', 'equipamentos'].includes(normalized(category)) ? supplemental.category || category : category
    const description = shortText(local?.descricao || detail.ecommerce?.descricao_adicional || detail.descricao, 6000)
      || supplemental.description
    if (!description) report.withoutDescription.push({ id: item.id, name, sku })
    const specs = { ...supplemental.specs, ...specifications(detail), ...local?.fichaTecnica }
    return {
      product: {
        ...(local && {
          variacoes: local.variacoes,
          tamanhosPorCor: local.tamanhosPorCor, lentesPorCor: local.lentesPorCor,
          imagensPorCor: local.imagensPorCor, linkwhatsapp: local.linkwhatsapp,
          linkWhatsapp: local.linkWhatsapp, linkMercadoLivre: local.linkMercadoLivre,
        }),
        id, nome: name,
        categoria: local?.categoria ?? preferredCatalogCategory.get(normalized(resolvedCategory)) ?? resolvedCategory,
        preco: price, descricao: description || undefined, imagens: images, disponivel: true,
        fichaTecnica: Object.keys(specs).length ? specs : undefined,
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
  report.withoutPrice.sort((a,b) => a.name.localeCompare(b.name,'pt-BR'))
  return { updatedAt: now.toISOString(), catalog, hiddenIds, bindings, report }
}
