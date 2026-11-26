import { createHash } from 'node:crypto'

const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const titleCase = value => value.toLowerCase().replace(/(^|[\s/-])\p{L}/gu, letter => letter.toUpperCase())
const apparel = /^(?:cal[cç]a|bermuda|bota|sapatilha|t[eê]nis|camisa|camiseta|blusa|lycra|luva|sunga|capacete|colete)\b/i
const letterSize = '(?:pp|p|m|g|gg|ggg|xg|xgg|eg[123]?|g[1234]|xs|s|l|xl|xxl|xxxl)'
const sizeSuffix = new RegExp('^(.*?)[\\s-]+(?:(tam(?:anho)?\\.?)\\s+)?(' + letterSize + '|\\d{1,2})$', 'i')
const colorSuffix = /^(.*?)\s+((?:preto|preta|branco|branca|cinza|grafite|azul|vermelho|vermelha|rosa|pink|verde|amarelo|amarela|laranja|roxo|roxa)(?:[/\s]+(?:marinho|neon|fl[uú]or|claro|escuro|preto|branco|cinza|azul|vermelho|rosa|verde|amarelo|laranja))*)$/i
const familyId = key => 'ca-' + createHash('sha256').update('family/' + key).digest('hex').slice(0, 24)

function dimensions(suffix, allowSize = true) {
  if (!suffix) return { label: 'Padrão' }
  const match = allowSize ? (' ' + suffix).match(sizeSuffix) : null
  const colorName = match ? match[1].trim() : suffix
  const size = match?.[3].toUpperCase()
  const color = colorName && titleCase(colorName.replace(/^(\w+)\s+\1$/i, '$1'))
  return {
    label: [color, size].filter(Boolean).join(' / '),
    ...(color && { color }), ...(size && { size }),
  }
}

function variantFamily(product) {
  const source = product.nome.trim()
  const name = normalize(source)
  const mattos = name.match(/^calca mattos racing spirit(?: (.+))?$/)
  if (mattos) {
    const plus = /^plus size /.test(mattos[1] ?? '')
    const suffix = source.replace(/^cal[cç]a mattos racing spirit(?:\s*[-–]\s*|\s+)?/i, '')
      .replace(/^plus size\s+/i, '').replace(/fluor/gi, 'flúor')
    const option = dimensions(suffix)
    if (plus && option.size) {
      option.size += ' (Plus Size)'
      option.label += ' (Plus Size)'
    }
    return { name: 'Calça Mattos Racing Spirit', category: 'Roupas', option }
  }

  const infant = name.match(/^colete (?:salva vidas )?(?:infantil pro ?life|pro ?life infantil)(?: homologado)?(?: (.+))?$/)
  if (infant) return {
    name: 'Colete Salva-Vidas Prolife Infantil', category: 'Coletes',
    option: { label: infant[1] ? infantStyle(infant[1]) : 'Padrão' }, renameOption: infantStyle,
  }

  const helmet = source.match(/^capacete\s+(airoh\s+(?:wraaap|twist\s+3)|mattos\s+racing\s+vivid)(?:(?:\s*[-–]\s*|\s+)(.+))?$/i)
  if (helmet) return {
    name: 'Capacete ' + titleCase(helmet[1]).replace(/\bWraaap\b/, 'WRAAAP'),
    option: dimensions(helmet[2]),
  }

  const eyewear = source.match(/^(?:(?:[oó]culos\s+)?100%\s+|[oó]culos\s+)?(strata\s+2|accuri\s+2|erba|hakan|renshaw|slent|speedcraft)(?:(?:\s*[-–]\s*|\s+)(.+))?$/i)
  if (eyewear && (/strata\s+2/i.test(eyewear[1]) || /100%/i.test(source))) {
    const suffix = eyewear[2] ?? ''
    const youth = /\b(?:juvenil|infantil|mini)\b/i.test(suffix)
    const variant = suffix.replace(/\b(?:juvenil|infantil|mini)\b/i, '').replace(/\s+/g, ' ').trim()
    return {
      name: 'Óculos 100% ' + titleCase(eyewear[1]) + (youth ? ' Juvenil' : ''),
      category: 'Óculos', option: dimensions(variant, false),
    }
  }

  const shoe = source.match(/^sapatilha water pro\s+(.+?)\s+furadinho(?:\s+(\d{2}))?$/i)
  if (shoe) return {
    name: 'Sapatilha Water Pro Furadinho', category: 'Roupas',
    option: dimensions(shoe.slice(1).filter(Boolean).join(' '), Boolean(shoe[2])),
  }
  const track = source.match(/^track (grafite|pink|preto)$/i)
  if (track) return { name: 'Track', option: dimensions(track[1], false) }
  const cable = source.match(/^(kit cabo rebocador\s*\/\s*atracador)(?:\s+(\d+\s+metros?))?$/i)
  if (cable) return {
    name: 'Kit Cabo Rebocador / Atracador',
    option: { label: cable[2] ? titleCase(cable[2]) : 'Padrão' },
  }

  if (!apparel.test(source)) return
  const sized = source.match(sizeSuffix)
  const size = sized?.[3].toUpperCase()
  const numericSize = /^\d+$/.test(size ?? '')
  const namedNumericSize = /^(?:cal[cç]a|bermuda|bota|sapatilha|t[eê]nis|capacete)\b/i.test(source)
    && Number(size) >= 24 && Number(size) <= 72
  const hasSize = sized && (!numericSize || sized[2] || namedNumericSize)
  const item = hasSize ? sized[1] : source
  const color = item.match(colorSuffix)
  if (!hasSize && !color) return
  const base = color?.[1] ?? item
  if (normalize(base).split(' ').length < 2) return
  return {
    name: source === source.toUpperCase() ? titleCase(base) : base,
    option: dimensions([color?.[2], hasSize && size].filter(Boolean).join(' ')),
  }
}

function infantStyle(label) {
  const name = normalize(label)
  if (name === 'dinos' || name === 'dino') return 'Dino'
  if (name === 'unicornio') return 'Unicórnio'
  return titleCase(label)
}

function optionsFor({ product, family }) {
  if (!product.opcoesEstoque?.length) {
    return [{
      id: String(product.id), ...(family?.option ?? { label: 'Padrão' }),
      price: product.preco, ...(product.imagens?.length && { images: product.imagens }),
    }]
  }
  return product.opcoesEstoque.map(option => {
    const label = family?.renameOption ? family.renameOption(option.label) : option.label
    const images = option.images?.length ? option.images
      : (option.color && product.imagensPorCor?.[option.color]) ||
        (product.opcoesEstoque.length === 1 ? product.imagens : undefined)
    return { ...option, label, ...(images?.length && { images }) }
  })
}

function combine(members, key) {
  const parent = members.find(({ product }) => product.opcoesEstoque?.length) ?? members[0]
  const family = parent.family ?? members.find(member => member.family)?.family
  const options = new Map()
  for (const member of members) {
    for (const option of optionsFor(member)) {
      const code = option.color && option.size ? normalize(option.color) + '/' + normalize(option.size) : normalize(option.label)
      const previous = options.get(code)
      const best = !previous || (option.price ?? Infinity) < (previous.price ?? Infinity) ? option : previous
      const other = best === option ? previous : option
      const images = [...new Set([...(best.images ?? []), ...(other?.images ?? [])])]
      options.set(code, { ...best, ...(images.length && { images }) })
    }
  }

  const opcoesEstoque = [...options.values()]
  const priced = opcoesEstoque.filter(option => option.price !== null)
  const preco = priced.length ? Math.min(...priced.map(option => option.price)) : null
  const galleries = new Map()
  for (const { color, images } of opcoesEstoque) {
    if (color && images?.length && !galleries.has(color)) galleries.set(color, images)
  }
  const aliases = [...new Set(members.flatMap(({ product }) => [String(product.id), ...(product.aliases ?? [])]))]
  const id = familyId(key)
  const representative = opcoesEstoque.find(option => option.price === preco && option.images?.length)?.images
    ?? opcoesEstoque.find(option => option.images?.length)?.images ?? []
  const genericImages = parent.product.opcoesEstoque?.length ? parent.product.imagens : []
  return {
    ...parent.product,
    id, aliases: aliases.filter(alias => alias !== id),
    nome: family?.name ?? parent.product.nome,
    categoria: family?.category ?? parent.product.categoria,
    preco,
    variacoes: undefined, tamanhosPorCor: undefined, lentesPorCor: undefined,
    imagens: [...new Set([...representative, ...(genericImages ?? [])])],
    imagensPorCor: { ...parent.product.imagensPorCor, ...Object.fromEntries(galleries) },
    opcoesEstoque,
  }
}

export function groupCatalogVariants(catalog) {
  const groups = new Map()
  for (const product of catalog) {
    const family = variantFamily(product)
    const key = normalize(family?.name ?? product.nome)
    const members = groups.get(key) ?? []
    members.push({ product, family })
    groups.set(key, members)
  }
  return [...groups].map(([key, members]) => {
    if (members.length > 1) return combine(members, key)
    const [{ product, family }] = members
    const alias = familyId(key)
    if (!family || product.id === alias || product.aliases?.includes(alias)) return product
    return { ...product, aliases: [...(product.aliases ?? []), alias] }
  })
}
