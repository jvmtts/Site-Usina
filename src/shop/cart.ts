import type { Produto } from '../data/produtos'
import type { CartLine } from './types'

const validId = /^[a-zA-Z0-9_-]{1,96}$/
export const cartStorageKey = 'usina.carrinho.v1'
export const cartLimit = 40
export const quantityLimit = 99

export function lineKey(line: Pick<CartLine, 'productId' | 'optionId'>) {
  return line.productId + '/' + (line.optionId ?? '')
}

export function readCart(raw: string | null): CartLine[] {
  if (!raw) return []
  try {
    const items: unknown = JSON.parse(raw)
    if (!Array.isArray(items)) return []
    const lines = new Map<string, CartLine>()
    for (const line of items.slice(0, cartLimit)) {
      if (!line || typeof line.productId !== 'string' || !validId.test(line.productId) ||
        (line.optionId !== null && (typeof line.optionId !== 'string' || !validId.test(line.optionId))) ||
        !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > quantityLimit) continue
      const { productId, optionId, quantity } = line
      const clean = { productId, optionId, quantity }
      lines.set(lineKey(clean), clean)
    }
    return [...lines.values()]
  } catch {
    return []
  }
}

export function updateCart(cart: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line)
  if (line.quantity <= 0) return cart.filter(item => lineKey(item) !== key)
  if (line.quantity > quantityLimit) throw new Error('O limite por item é de 99 unidades.')
  if (cart.some(item => lineKey(item) === key)) {
    return cart.map(item => lineKey(item) === key ? line : item)
  }
  if (cart.length >= cartLimit) throw new Error('Seu carrinho já tem 40 itens diferentes.')
  return [...cart, line]
}

export function catalogPriceCents(price: Produto['preco']): number | null {
  if (typeof price === 'number' && Number.isFinite(price) && price > 0) return Math.round(price * 100)
  if (typeof price !== 'string') return null
  const amount = price.trim().replace(/^R\$\s*/, '')
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{2}$/.test(amount)) return null
  const cents = Number(amount.replace(/\D/g, ''))
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null
}

export function findCartProduct(products: Produto[], id: string) {
  return products.find(product => String(product.id) === id) ?? products.find(product => product.aliases?.includes(id))
}

export function describeCartLine(products: Produto[], line: CartLine) {
  const product = findCartProduct(products, line.productId)
  const option = product?.opcoesEstoque?.find(item => item.id === line.optionId)
  const validOption = line.optionId !== null ? Boolean(option) : !product?.opcoesEstoque?.length
  const cents = product?.disponivel && validOption ? catalogPriceCents(option ? option.price : product.preco) : null
  const images = option?.images?.length ? option.images
    : option?.color && product?.imagensPorCor?.[option.color]?.length ? product.imagensPorCor[option.color]
      : product?.imagens.length ? product.imagens : Object.values(product?.imagensPorCor ?? {}).flat()
  const image = images.find(url => url && !url.includes('via.placeholder.com'))
  return { ...line, key: lineKey(line), product, option, cents, image }
}
