import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/**
 * Barra superior minimalista para a landing da expedição.
 * Diferente da Navbar do site principal: aqui não há links de navegação,
 * só o logo (pra manter a identidade da marca visível) e o CTA de inscrição.
 * Isso evita dar "portas de saída" numa página cujo único objetivo é converter.
 */
export default function TopBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const transparent = !scrolled

  const logoSrc = transparent
    ? '/images/logo usina 1000px x 1000px.png'
    : '/images/Usina-logo-Preto.png'

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? '0.8rem 0' : '1.5rem 0',
        background: transparent ? 'transparent' : 'rgba(255,255,255,0.97)',
        backdropFilter: transparent ? 'none' : 'blur(20px)',
        borderBottom: transparent ? 'none' : '1px solid #EBEBEB',
        transition: 'all 0.35s ease',
      }}
    >
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img
            src={logoSrc}
            alt="Usina do Jet"
            style={{
              height: scrolled ? '3.5rem' : '5rem',
              width: 'auto',
              objectFit: 'contain',
              filter: transparent ? 'brightness(0) invert(1)' : 'none',
              transition: 'height 0.35s ease',
            }}
          />
        </Link>

        <Link
          to="/inscricao"
          className="btn-primary"
          style={{ padding: scrolled ? '0.7rem 1.5rem' : '0.9rem 1.9rem', fontSize: '0.68rem' }}
        >
          Inscreva-se
        </Link>
      </div>
    </header>
  )
}