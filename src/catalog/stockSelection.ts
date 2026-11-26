import type { Produto } from '../data/produtos'

type StockOption = NonNullable<Produto['opcoesEstoque']>[number]

export type StockChoice = { color: string; size: string }

function isStructuredStockOption(option: StockOption): option is StockOption & StockChoice {
  return Boolean(option.color?.trim() && option.size?.trim())
}

export function resolveStockSelection(options: StockOption[], price: Produto['preco'], choice?: StockChoice) {
  if (!options.length || !options.every(isStructuredStockOption)) return

  const firstOption = options.find(option => option.price === price) ?? options[0]
  const colors = [...new Set(options.map(option => option.color))]
  const color = choice && colors.includes(choice.color) ? choice.color : firstOption.color
  const optionsByColor = options.filter(option => option.color === color)
  const sizes = [...new Set(optionsByColor.map(option => option.size))]
  let requestedSize = firstOption.size
  if (choice) requestedSize = choice.color === color ? choice.size : ''
  const fallbackSize = sizes.length === 1 ? sizes[0] : ''
  const size = sizes.find(value => value === requestedSize) ?? fallbackSize

  return { colors, color, sizes, size, option: optionsByColor.find(option => option.size === size) }
}

const normalizeColor = (color: string) =>
  color.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ').trim()

const hasPhoto = (src: string) => src && !src.includes('via.placeholder.com')

export function resolveStockGallery(product: Pick<Produto, 'imagens' | 'imagensPorCor'>, color: string) {
  const colorKey = normalizeColor(color)
  const galleries = Object.entries(product.imagensPorCor ?? {})
  const variantPhotos = galleries
    .flatMap(([name, images]) => normalizeColor(name) === colorKey ? images : [])
    .filter(hasPhoto)

  if (variantPhotos.length) return [...new Set(variantPhotos)]

  const knownVariantPhotos = new Set(galleries.flatMap(([, images]) => images))
  return product.imagens.filter(src => hasPhoto(src) && !knownVariantPhotos.has(src))
}
