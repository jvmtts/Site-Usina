import { createContext, useContext } from 'react'
import { produtos, type Produto } from '../data/produtos'

type CatalogState = { products: Produto[]; pending: boolean }

export const CatalogContext = createContext<CatalogState>({ products: produtos, pending: false })

export function useCatalog() {
  return useContext(CatalogContext)
}
