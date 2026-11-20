import { useEffect, useState, type ReactNode } from 'react'
import { produtos, type Produto } from '../data/produtos'
import { CatalogContext, type CatalogState } from './catalogContext'

type Inventory = { products: Produto[]; updatedAt: string }

const inventoryRefresh = 30_000

function validInventory(value: unknown): value is Inventory {
  if (!value || typeof value !== 'object' || !('products' in value) || !('updatedAt' in value) ||
      !Array.isArray(value.products) || typeof value.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(value.updatedAt))) return false
  const known = new Set<string>()
  return value.products.every((product: Produto) => {
    if (!product || (typeof product.id !== 'number' && typeof product.id !== 'string') ||
        known.has(String(product.id)) || typeof product.nome !== 'string' ||
        typeof product.disponivel !== 'boolean' || !Array.isArray(product.imagens) ||
        !product.imagens.every(src => typeof src === 'string') ||
        (typeof product.categoria !== 'string' && !Array.isArray(product.categoria)) ||
        (typeof product.preco !== 'string' && !Number.isFinite(product.preco))) return false
    known.add(String(product.id))
    return true
  })
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogState>({ products: [], status: 'loading' })

  useEffect(() => {
    const lifetime = new AbortController()
    let inProgress = false

    async function refresh() {
      if (inProgress || document.visibilityState === 'hidden') return
      inProgress = true
      const request = new AbortController()
      const cancel = () => request.abort()
      lifetime.signal.addEventListener('abort', cancel, { once: true })
      const timeout = window.setTimeout(cancel, 7500)
      try {
        const response = await fetch('/api/catalogo', {
          headers: { Accept: 'application/json' },
          signal: request.signal,
          cache: 'no-store',
        })
        const isJson = response.headers.get('Content-Type')?.includes('application/json')
        const next: unknown = isJson ? await response.json() : null
        if (lifetime.signal.aborted) return
        if (response.ok && validInventory(next)) {
          setCatalog({ products: next.products, status: 'ready' })
        } else {
          const devWithoutInventory = import.meta.env.DEV && response.status === 404 &&
            next && typeof next === 'object' && 'status' in next && next.status === 'previsualizacao_desativada'
          setCatalog(devWithoutInventory ? { products: produtos, status: 'ready' } : { products: [], status: 'unavailable' })
        }
      } catch {
        if (!lifetime.signal.aborted) setCatalog({ products: [], status: 'unavailable' })
      } finally {
        window.clearTimeout(timeout)
        lifetime.signal.removeEventListener('abort', cancel)
        inProgress = false
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, inventoryRefresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      lifetime.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return (
    <CatalogContext.Provider value={catalog}>
      {children}
    </CatalogContext.Provider>
  )
}
