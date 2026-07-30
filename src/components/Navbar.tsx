import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const links = [
  { label: 'Início', path: '/' },
  { label: 'Expedições', path: '/expedicoes' },
  { label: 'Catálogo', path: '/catalogo' },
  { label: 'Contato', path: '/contato' },
]

interface NavCtaProps {
  transparent?: boolean
  compact?: boolean
  mobile?: boolean
}

function NavCta({ transparent = false, compact = false, mobile = false }: NavCtaProps) {
  const [active, setActive] = useState(false)

  return (
    <Link
      to="/expedicoes"
      className={mobile ? undefined : 'hidden md:inline-flex'}
      aria-label="Ver expedições com vagas abertas"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      style={{
        position: 'relative',
        display: mobile ? 'inline-flex' : undefined,
        width: mobile ? 'min(15rem, 76vw)' : 'auto',
        minWidth: mobile ? undefined : compact ? '9.2rem' : '9.8rem',
        height: mobile ? '3.25rem' : compact ? '2.7rem' : '2.9rem',
        padding: mobile ? '0 1.35rem' : '0 1.15rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.9rem',
        overflow: 'hidden',
        border: transparent
          ? '1px solid rgba(255,255,255,0.3)'
          : '1px solid #0A0A0A',
        background: transparent ? 'rgba(10,10,10,0.2)' : '#0A0A0A',
        color: '#fff',
        textDecoration: 'none',
        backdropFilter: transparent ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: transparent ? 'blur(14px)' : 'none',
        boxShadow: transparent ? '0 8px 28px rgba(0,0,0,0.08)' : 'none',
        transition:
          'height 0.35s ease, min-width 0.35s ease, border-color 0.25s ease, background 0.25s ease',
      }}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: '#FF7B00',
          transformOrigin: 'left center',
        }}
      />

      <span
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            scale: active ? 1.12 : 1,
            backgroundColor: active ? '#0A0A0A' : '#FF7B00',
            boxShadow: active
              ? '0 0 0 0 rgba(255,123,0,0)'
              : '0 0 0 4px rgba(255,123,0,0.13)',
          }}
          transition={{ duration: 0.25 }}
          style={{
            width: '0.42rem',
            height: '0.42rem',
            flexShrink: 0,
            borderRadius: '50%',
          }}
        />

        <motion.span
          className="mono"
          initial={false}
          animate={{ color: active ? '#0A0A0A' : '#FFFFFF' }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: mobile ? '0.7rem' : '0.63rem',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Garantir vaga
        </motion.span>
      </span>

      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ x: active ? 3 : 0, color: active ? '#0A0A0A' : '#FFFFFF' }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          flexShrink: 0,
        }}
      >
        <ArrowUpRight size={mobile ? 18 : 16} strokeWidth={1.8} />
      </motion.span>
    </Link>
  )
}

interface NavbarProps {
  revealed?: boolean
}

export default function Navbar({ revealed = true }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHero = location.pathname === '/' || location.pathname === '/expedicoes'
  const transparent = isHero && !scrolled

  useEffect(() => {
    const updateNavbar = () => setScrolled(window.scrollY > 60)

    updateNavbar()
    window.addEventListener('scroll', updateNavbar, { passive: true })

    return () => window.removeEventListener('scroll', updateNavbar)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!revealed) setOpen(false)
  }, [revealed])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          opacity: revealed ? 1 : 0,
          y: revealed ? 0 : -18,
        }}
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden={!revealed}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: scrolled ? '0.85rem 0' : '1.6rem 0',
          background: transparent ? 'transparent' : 'rgba(255,255,255,0.97)',
          backdropFilter: transparent ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: transparent ? 'none' : 'blur(20px)',
          borderBottom: transparent ? 'none' : '1px solid #EBEBEB',
          pointerEvents: revealed ? 'auto' : 'none',
          willChange: 'opacity, transform',
          transition: 'padding 0.35s ease, background 0.35s ease, border-color 0.35s ease',
        }}
      >
        <div
          className="wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            to="/"
            aria-label="Ir para o início"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            <img
              src="/images/Usina-Logo-Grande.png"
              alt="Usina do Jet"
              style={{
                height: scrolled ? '3rem' : '4.5rem',
                width: 'auto',
                objectFit: 'contain',
                filter: transparent ? 'brightness(0) invert(1)' : 'none',
                transition: 'all 0.35s ease',
              }}
            />
          </Link>

          <ul
            className="hidden md:flex"
            style={{ alignItems: 'center', gap: '2.5rem', listStyle: 'none' }}
          >
            {links.map((link) => {
              const active = location.pathname === link.path

              return (
                <li key={link.path} style={{ position: 'relative' }}>
                  <Link
                    to={link.path}
                    className="mono"
                    style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      color: active
                        ? transparent
                          ? '#fff'
                          : '#0A0A0A'
                        : transparent
                          ? 'rgba(255,255,255,0.55)'
                          : '#888',
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.color = transparent ? '#fff' : '#0A0A0A'
                    }}
                    onMouseLeave={(event) => {
                      if (!active) {
                        event.currentTarget.style.color = transparent
                          ? 'rgba(255,255,255,0.55)'
                          : '#888'
                      }
                    }}
                  >
                    {link.label}
                  </Link>

                  {active && (
                    <motion.span
                      layoutId="nav-line"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        display: 'block',
                        background: '#FF7B00',
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>

          <NavCta transparent={transparent} compact={scrolled} />

          <button
            type="button"
            className="md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((current) => !current)}
            style={{
              padding: '0.4rem',
              border: 'none',
              background: 'none',
              color: transparent ? '#fff' : '#0A0A0A',
              cursor: 'pointer',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 90,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              background: '#fff',
            }}
          >
            {links.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Link
                  to={link.path}
                  className="display"
                  style={{
                    fontSize: 'clamp(2.5rem, 9vw, 5rem)',
                    color: location.pathname === link.path ? '#FF7B00' : '#DEDEDE',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = '#0A0A0A'
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color =
                      location.pathname === link.path ? '#FF7B00' : '#DEDEDE'
                  }}
                >
                  {link.label.toUpperCase()}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              style={{ marginTop: '1rem' }}
            >
              <NavCta mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
