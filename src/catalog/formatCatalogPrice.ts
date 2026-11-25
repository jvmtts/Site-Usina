import type { Produto } from '../data/produtos'

export function formatCatalogPrice(price: Produto['preco']) {
  return typeof price === 'number'
    ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : price?.trim() || 'Preço sob consulta'
}
