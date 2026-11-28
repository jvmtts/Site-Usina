import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { cartStorageKey, lineKey, readCart, updateCart } from './cart'
import type { CartLine, ShopAccount } from './types'

type ActionResult = { ok: true; needsConfirmation?: boolean; redirectTo?: string }
type Action = Record<string, unknown>

type ShopState = ShopAccount & {
  ready: boolean
  lines: CartLine[]
  count: number
  syncingCart: boolean
  accountError: string
  retryAccount(): Promise<void>
  action(data: Action): Promise<ActionResult>
  setLine(line: CartLine): Promise<void>
  addLine(productId: string, optionId: string | null): Promise<void>
  toggleFavorite(productId: string): Promise<void>
}

const emptyAccount: ShopAccount = { enabled: false, user: null, cart: [], favorites: [], addresses: [], orders: [] }
const ShopContext = createContext<ShopState | null>(null)
const accountEventKey = 'usina.conta.atualizada'
const accountChanges = new Set(['saveAddress', 'removeAddress'])

function guestCart() {
  try { return readCart(window.localStorage.getItem(cartStorageKey)) } catch { return [] }
}

async function api<T>(data?: Action): Promise<T> {
  const response = await fetch('/api/loja', {
    method: data ? 'POST' : 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(12_000),
  }).catch(() => { throw new Error('A conexão falhou. Tente novamente.') })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload) throw new Error(typeof payload?.error === 'string' ? payload.error : 'A loja está temporariamente indisponível.')
  return payload as T
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState(emptyAccount)
  const [guest, setGuest] = useState(guestCart)
  const [ready, setReady] = useState(false)
  const [syncingCart, setSyncingCart] = useState(false)
  const [accountError, setAccountError] = useState('')
  const current = useRef({ account: emptyAccount, guest, ready: false, syncingCart: false })
  const queue = useRef<Promise<unknown>>(Promise.resolve())
  const sessionVersion = useRef(0)

  const updateGuest = useCallback((lines: CartLine[]) => {
    current.current.guest = lines
    setGuest(lines)
    try { window.localStorage.setItem(cartStorageKey, JSON.stringify(lines)) } catch {}
  }, [])

  const refresh = useCallback(async () => {
    const version = sessionVersion.current
    const next = await api<ShopAccount>()
    if (version !== sessionVersion.current) return
    const pendingGuest = current.current.guest
    if (next.user && pendingGuest.length) {
      current.current.syncingCart = true
      setSyncingCart(true)
      try {
        await api<ActionResult>({ action: 'mergeCart', accountId: next.user.id, lines: pendingGuest })
        const merged = await api<ShopAccount>()
        if (version !== sessionVersion.current) return
        if (merged.user?.id !== next.user.id) throw new Error('A sessão mudou. Entre na sua conta novamente.')
        if (JSON.stringify(current.current.guest) !== JSON.stringify(pendingGuest)) {
          throw new Error('O carrinho foi alterado em outra aba. Sincronize os itens novamente.')
        }
        updateGuest([])
        Object.assign(next, merged)
        current.current.syncingCart = false
        setSyncingCart(false)
      } catch (error) {
        if (version !== sessionVersion.current) return
        current.current.account = next
        setAccount(next)
        throw error
      }
    } else {
      current.current.syncingCart = false
      setSyncingCart(false)
    }
    current.current.account = next
    setAccount(next)
    setAccountError('')
  }, [updateGuest])

  const enqueue = useCallback(<T,>(task: () => Promise<T>) => {
    const pending = queue.current.then(task)
    queue.current = pending.catch(() => undefined)
    return pending
  }, [])

  const retryAccount = useCallback(() => enqueue(async () => {
    try {
      await refresh()
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Tente acessar a conta novamente.')
    } finally {
      current.current.ready = true
      setReady(true)
    }
  }), [enqueue, refresh])

  useEffect(() => {
    void retryAccount()
    const onStorage = (event: StorageEvent) => {
      if (event.key === accountEventKey) {
        sessionVersion.current += 1
        current.current.account = emptyAccount
        current.current.ready = false
        setAccount(emptyAccount)
        setReady(false)
        void retryAccount()
        return
      }
      if (event.key !== cartStorageKey) return
      const lines = readCart(event.newValue)
      current.current.guest = lines
      setGuest(lines)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [retryAccount])

  const action = (data: Action) => enqueue(async () => {
    const result = await api<ActionResult>(accountChanges.has(String(data.action))
      ? { ...data, accountId: current.current.account.user?.id } : data)
    if (data.action === 'google') return result
    if (data.action === 'login' || data.action === 'logout' || data.action === 'confirm' ||
      (data.action === 'signup' && !result.needsConfirmation)) {
      try { window.localStorage.setItem(accountEventKey, window.crypto.randomUUID()) } catch {}
    }
    if (data.action === 'logout') {
      current.current.account = emptyAccount
      setAccount(emptyAccount)
    }
    if (data.action !== 'recover' && !(data.action === 'signup' && result.needsConfirmation)) {
      try {
        await refresh()
      } catch (error) {
        setAccountError(error instanceof Error ? error.message : 'Abra a conta novamente para atualizar os dados.')
      }
    }
    return result
  })

  async function changeLine(line: CartLine) {
    const state = current.current
    if (!state.ready) throw new Error('O carrinho está carregando.')
    if (state.account.user) {
      if (state.syncingCart) throw new Error('Sincronize seu carrinho antes de alterar os itens.')
      updateCart(state.account.cart, line)
      await api<ActionResult>({ action: 'cart', accountId: state.account.user.id, line })
      await refresh()
    } else {
      updateGuest(updateCart(state.guest, line))
    }
  }

  const setLine = (line: CartLine) => enqueue(() => changeLine(line))
  const addLine = (productId: string, optionId: string | null) => enqueue(async () => {
    const state = current.current
    const lines = state.account.user ? state.account.cart : state.guest
    const key = lineKey({ productId, optionId })
    const quantity = (lines.find(line => lineKey(line) === key)?.quantity ?? 0) + 1
    await changeLine({ productId, optionId, quantity })
  })

  const toggleFavorite = (productId: string) => enqueue(async () => {
    const { account: latest } = current.current
    if (!latest.user) throw new Error('Entre na sua conta para salvar favoritos.')
    await api<ActionResult>({ action: 'favorite', accountId: latest.user.id, productId, value: !latest.favorites.includes(productId) })
    await refresh()
  })

  const lines = account.user && !syncingCart ? account.cart : guest
  return (
    <ShopContext.Provider value={{
      ...account, ready, syncingCart, accountError, lines, count: lines.reduce((total, line) => total + line.quantity, 0),
      retryAccount, action, setLine, addLine, toggleFavorite,
    }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const state = useContext(ShopContext)
  if (!state) throw new Error('A página da loja precisa estar no ShopProvider.')
  return state
}
