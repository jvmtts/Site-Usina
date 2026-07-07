import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="wrap" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '4rem', flexWrap: 'wrap' }}
             className="grid-cols-1 md:grid-cols-[2fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <img
              src="/images/Usina-Logo-Grande.png"
              alt="Usina do Jet"
              style={{ height: '1.9rem', width: 'auto', objectFit: 'contain', objectPosition: 'left',
                       filter: 'brightness(0) invert(1)', opacity: 0.75, marginBottom: '1.4rem', display: 'block' }}
            />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem',
                        fontWeight: 300, lineHeight: 1.75, maxWidth: '240px' }}>
              Desde 2018 levamos quem ama velocidade para onde a água manda.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.75rem' }}>
              {[
                { label: 'Instagram', href: 'https://instagram.com/usinadojet',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
                { label: 'WhatsApp', href: 'https://wa.me/5511999999999',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                   style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'rgba(255,255,255,0.3)',
                            border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}
                   onMouseEnter={e => {
                     const el = e.currentTarget as HTMLElement
                     el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.25)'
                   }}
                   onMouseLeave={e => {
                     const el = e.currentTarget as HTMLElement
                     el.style.color = 'rgba(255,255,255,0.3)'; el.style.borderColor = 'rgba(255,255,255,0.08)'
                   }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <p className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontWeight: 700 }}>
              Navegação
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[{ l: 'Início', p: '/' }, { l: 'Expedições', p: '/expedicoes' },
                { l: 'Catálogo', p: '/catalogo' }, { l: 'Contato', p: '/contato' }].map(({ l, p }) => (
                <Link key={p} to={p}
                  style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem',
                           fontWeight: 300, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontWeight: 700 }}>
              Contato
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[{ label: 'Brasil', sub: 'Localização' }, { label: '(00) 00000-0000', sub: 'WhatsApp' }].map(({ label, sub }) => (
                <div key={sub}>
                  <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem', fontWeight: 700 }}>{sub}</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', fontWeight: 300 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '1.4rem', paddingBottom: '1.4rem',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} Usina do Jet · Todos os direitos reservados
        </span>
        <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          Brasil · Desde 2018
        </span>
      </div>
    </footer>
  )
}