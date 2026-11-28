import { createContext, useContext } from 'react'
import { produtos, type Produto } from '../data/produtos'

export type CatalogState = { products: Produto[]; status: 'loading' | 'ready' | 'unavailable' }

export const CatalogContext = createContext<CatalogState>({ products: produtos, status: 'ready' })

export function useCatalog() {
  return useContext(CatalogContext)
}
