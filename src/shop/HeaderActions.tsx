import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, CircleUserRound, Heart, LogOut, MapPin, Package, ShoppingBag } from 'lucide-react'
import { useShop } from './ShopProvider'
import CartDrawer from './CartDrawer'
import './shop.css'

const profileLinks = [
  { label: 'Meus pedidos', to: '/conta/pedidos', Icon: Package },
  { label: 'Favoritos', to: '/conta/favoritos', Icon: Heart },
  { label: 'Endereços', to: '/conta/enderecos', Icon: MapPin },
]

export default function HeaderActions({ transparent }: { transparent: boolean }) {
  const { user, count, action } = useShop()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const profile = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const expanded = Boolean(user && (hover || pinned))

  function close() {
    setHover(false)
    setPinned(false)
  }

  useEffect(() => { close() }, [pathname, user?.id])
  useEffect(() => { setCartOpen(false) }, [pathname])
  useEffect(() => {
    if (!expanded) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !profile.current?.contains(event.target)) close()
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        toggle.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [expanded])

  async function logout() {
    setLeaving(true)
    setError('')
    try {
      await action({ action: 'logout' })
      close()
      if (pathname.startsWith('/conta')) navigate('/conta/entrar', { replace: true })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível sair agora.')
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="shop-header-actions" data-transparent={transparent}>
      {user ? (
        <div ref={profile} className="shop-profile"
          onPointerEnter={event => { if (event.pointerType === 'mouse') setHover(true) }}
          onPointerLeave={event => { if (event.pointerType === 'mouse') setHover(false) }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close() }}>
          <button ref={toggle} type="button" className="shop-header-control shop-profile-toggle"
            aria-label="Perfil" aria-expanded={expanded} aria-controls="shop-profile-links"
            onClick={() => { if (pinned) close(); else setPinned(true) }}>
            <CircleUserRound aria-hidden="true" size={19} strokeWidth={1.65} />
            <span>Perfil</span>
            <ChevronDown className="shop-profile-chevron" aria-hidden="true" size={13} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div className="shop-profile-anchor" id="shop-profile-links"
                initial={reduced ? false : { opacity: 0, y: -7, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduced ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}>
                <nav className="shop-profile-panel" aria-label="Opções do perfil">
                  {profileLinks.map(({ label, to, Icon }) => (
                    <Link to={to} key={to} onClick={close}>
                      <Icon size={17} aria-hidden="true" />
                      <span>{label}</span>
                      <ArrowUpRight className="shop-profile-arrow" size={14} aria-hidden="true" />
                    </Link>
                  ))}
                  <button type="button" className="shop-profile-logout" onClick={() => void logout()} disabled={leaving}>
                    <LogOut size={17} aria-hidden="true" /> Sair
                  </button>
                  {error && <p className="shop-profile-error" role="alert">{error}</p>}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link to="/conta/entrar" className="shop-header-control shop-profile-toggle" aria-label="Entrar">
          <CircleUserRound aria-hidden="true" size={19} strokeWidth={1.65} />
          <span>Entrar</span>
        </Link>
      )}
      <button type="button" className="shop-header-control shop-cart-toggle"
        aria-haspopup="dialog" aria-expanded={cartOpen}
        aria-controls={cartOpen ? 'shop-cart-drawer' : undefined}
        onClick={() => { close(); setCartOpen(true) }}
        aria-label={count ? 'Carrinho, ' + count + (count === 1 ? ' item' : ' itens') : 'Carrinho'}>
        <ShoppingBag size={20} strokeWidth={1.65} aria-hidden="true" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span key={count} className="shop-cart-count" aria-hidden="true"
              initial={reduced ? false : { scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 410, damping: 24 }}>
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
