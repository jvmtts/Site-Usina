import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Início',     path: '/' },
  { label: 'Expedições', path: '/expedicoes' },
  { label: 'Catálogo',   path: '/catalogo' },
  { label: 'Contato',    path: '/contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const location                = useLocation()
  const isHero                  = location.pathname === '/'
  const transparent             = isHero && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          padding: scrolled ? '0.85rem 0' : '1.6rem 0',
          background: transparent ? 'transparent' : 'rgba(255,255,255,0.97)',
          backdropFilter: transparent ? 'none' : 'blur(20px)',
          borderBottom: transparent ? 'none' : '1px solid #EBEBEB',
          transition: 'all 0.35s ease',
        }}
      >
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo - Ajustada para ter presença e mudar de tamanho dinamicamente */}
          <Link to="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <img
              src="/images/Usina-Logo-Grande.png"
              alt="Usina do Jet"
              style={{
                height: scrolled ? '3rem' : '4.5rem', // Mágica aqui: Grande no topo, menor no scroll
                width: 'auto', 
                objectFit: 'contain',
                filter: transparent ? 'brightness(0) invert(1)' : 'none', // Mantém o Preto/Branco funcionando
                transition: 'all 0.35s ease',
              }}
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex"
              style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', listStyle: 'none' }}>
            {links.map(link => {
              const active = location.pathname === link.path
              return (
                <li key={link.path} style={{ position: 'relative' }}>
                  <Link
                    to={link.path}
                    className="mono"
                    style={{
                      fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                      textDecoration: 'none', transition: 'color 0.2s',
                      color: active
                        ? (transparent ? '#fff' : '#0A0A0A')
                        : (transparent ? 'rgba(255,255,255,0.55)' : '#888'),
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.color = transparent ? '#fff' : '#0A0A0A'
                    }}
                    onMouseLeave={e => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.color = transparent ? 'rgba(255,255,255,0.55)' : '#888'
                    }}
                  >
                    {link.label}
                  </Link>
                  {active && (
                    <motion.span
                      layoutId="nav-line"
                      style={{
                        position: 'absolute', bottom: '-4px', left: 0, right: 0,
                        height: '2px', background: '#FF7B00', display: 'block',
                      }}
                    />
                  )}
                </li>
              )
            })}
          </ul>

          {/* CTA */}
          <Link
            to="/expedicoes"
            className="btn-primary hidden md:inline-flex"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.65rem' }}
          >
            Garantir vaga
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem',
              color: transparent ? '#fff' : '#0A0A0A',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: '#fff',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '2rem',
            }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={link.path}
                  className="display"
                  style={{
                    fontSize: 'clamp(2.5rem, 9vw, 5rem)', textDecoration: 'none',
                    color: location.pathname === link.path ? '#FF7B00' : '#DEDEDE',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0A0A0A' }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color =
                      location.pathname === link.path ? '#FF7B00' : '#DEDEDE'
                  }}
                >
                  {link.label.toUpperCase()}
                </Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}>
              <Link to="/expedicoes" className="btn-primary" style={{ marginTop: '1rem' }}>
                Garantir vaga
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}