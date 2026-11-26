const hydroId = 'ca-5e5a5bf4b4c28257d1cabece'
const hydroModel = /^colete (?:salva vidas )?(?:homologado )?(?:prolife )?hydro citrus(?: prolife)?(?: (.+))?$/
const sizePattern = 'pp|p|m|g|gg|xg|xgg|eg[123]?|g[1234]'
const firstSize = new RegExp('^(' + sizePattern + ') (.+)$')
const lastSize = new RegExp('^(.+) (' + sizePattern + ')$')

function dimensions(label, normalize) {
  const value = normalize(label)
  const first = value.match(firstSize)
  if (first) return { size: first[1].toUpperCase(), color: first[2] }
  const last = value.match(lastSize)
  return last ? { size: last[2].toUpperCase(), color: last[1] } : null
}

function displayColor(value) {
  if (value === 'rally bussola') return 'Rally Bússola'
  return value.replace(/\b\w/g, letter => letter.toUpperCase())
}

function memberOptions(product, suffix, normalize) {
  if (product.opcoesEstoque?.length) {
    const options = product.opcoesEstoque.flatMap(option => {
      const pair = option.color && option.size
        ? { color: normalize(option.color), size: option.size.toUpperCase() }
        : dimensions(option.label, normalize)
      return pair ? [{ ...option, ...pair }] : []
    })
    return options.length === product.opcoesEstoque.length ? options : []
  }

  const pair = suffix && dimensions(suffix, normalize)
  return pair ? [{ id: product.id, price: product.preco, images: product.imagens, ...pair }] : []
}

export function groupHydroCitrus(catalog, legacy, normalize) {
  const members = []
  const outside = []
  for (const product of catalog) {
    const match = normalize(product.nome).match(hydroModel)
    const options = match ? memberOptions(product, match[1], normalize) : []
    if (options.length) members.push({ product, options })
    else outside.push(product)
  }
  if (!members.length) return catalog

  members.sort((left, right) => Number(Boolean(right.product.opcoesEstoque)) - Number(Boolean(left.product.opcoesEstoque)))
  const parent = members.find(({ product }) => product.id === hydroId)?.product ?? members[0].product
  const fallback = new Map()
  for (const id of [11, 35]) {
    for (const [color, images] of Object.entries(legacy.get(id)?.imagensPorCor ?? {})) {
      fallback.set(normalize(color), images)
    }
  }
  const pairs = new Map()
  const photos = new Map()
  for (const { product, options } of members) {
    for (const option of options) {
      const { id, size, price } = option
      const color = displayColor(option.color)
      const key = option.color + '/' + size
      if (!pairs.has(key)) pairs.set(key, { id, label: color + ' / ' + size, color, size, price })
      const images = option.images?.length ? option.images
        : Object.entries(product.imagensPorCor ?? {}).find(([name]) => normalize(name) === option.color)?.[1]
      if (images?.length && (!photos.has(color) || images[0].startsWith('/api/catalogo-imagem'))) {
        photos.set(color, images)
      } else if (!photos.has(color) && fallback.has(option.color)) {
        photos.set(color, fallback.get(option.color))
      }
    }
  }
  const opcoesEstoque = [...pairs.values()]
  const prices = opcoesEstoque.flatMap(option => option.price === null ? [] : [option.price])
  const aliases = [...new Set(members.flatMap(({ product }) => [String(product.id), ...(product.aliases ?? [])]))]
    .filter(id => id !== hydroId)
  outside.push({
    ...parent,
    id: hydroId,
    aliases,
    nome: 'Colete Hydro Citrus Prolife',
    categoria: 'Coletes',
    preco: prices.length ? Math.min(...prices) : null,
    variacoes: undefined,
    tamanhosPorCor: undefined,
    lentesPorCor: undefined,
    imagens: parent.opcoesEstoque?.length ? parent.imagens : [],
    imagensPorCor: Object.fromEntries(photos),
    opcoesEstoque,
  })
  return outside
}
