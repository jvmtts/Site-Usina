import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="wrap" style={{ padding: '4rem 0 3rem' }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      flexWrap: 'wrap', gap: '3rem', marginBottom: '4rem' }}>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '280px' }}>
            <img
              src="/images/Usina-Logo-Grande.png"
              alt="Usina do Jet"
              style={{ height: '1.8rem', width: 'auto', objectFit: 'contain', objectPosition: 'left',
                       filter: 'brightness(0) invert(1)', opacity: 0.7 }}
            />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 300,
                        lineHeight: 1.7 }}>
              Desde 2018 levamos quem ama velocidade para onde a água manda.
            </p>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
            <div>
              <p className="mono" style={{ fontSize: '0.52rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }}>
                Navegação
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Início', path: '/' },
                  { label: 'Expedições', path: '/expedicoes' },
                  { label: 'Catálogo', path: '/catalogo' },
                  { label: 'Contato', path: '/contato' },
                ].map(l => (
                  <Link key={l.path} to={l.path}
                    style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 300,
                             textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mono" style={{ fontSize: '0.52rem', letterSpacing: '0.22em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }}>
                Contato
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="https://instagram.com/usinadojet" target="_blank" rel="noreferrer"
                   style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 300,
                            textDecoration: 'none', transition: 'color 0.2s' }}
                   onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF7B00' }}
                   onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                >
                  Instagram
                </a>
                <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"
                   style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', fontWeight: 300,
                            textDecoration: 'none', transition: 'color 0.2s' }}
                   onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF7B00' }}
                   onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      flexWrap: 'wrap', gap: '0.75rem',
                      paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="mono" style={{ fontSize: '0.5rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)' }}>
            © {year} Usina do Jet · Todos os direitos reservados
          </span>
          <span className="mono" style={{ fontSize: '0.5rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.14)' }}>
            Brasil · Desde 2018
          </span>
        </div>
      </div>
    </footer>
  )
}