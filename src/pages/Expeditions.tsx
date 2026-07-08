import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ArrowRight, MapPin, Clock, Users, Camera } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface PastExpedition {
  id: string
  destination: string
  state: string
  dateLabel: string
  duration: string
  spots: number
  description: string
  coverImage: string
  galleryImages: string[]
  nextEditionMonth: string
  nextEditionYear: string
}

/* ─── Data ───────────────────────────────────────────── */
const PAST: PastExpedition[] = [
  {
    id: 'angra-paraty',
    destination: 'Angra x Paraty',
    state: 'Rio de Janeiro',
    dateLabel: '2026',
    duration: '4 dias · 3 noites',
    spots: 14,
    description: 'A primeira expedição da Usina do Jet. Navegamos entre as enseadas paradisíacas de Angra dos Reis e as águas históricas de Paraty.',
    coverImage: '/images/Angra/CAPA%20ANGRA.webp',
    galleryImages: [
      '/images/Angra/FOTO%202.webp',
      '/images/Angra/FOTO%203.webp',
      '/images/Angra/FOTO%204.webp',
      '/images/Angra/FOTO%205.webp',
      '/images/Angra/FOTO%206.webp',
      '/images/Angra/FOTO%207.webp',
      '/images/Angra/FOTO%208.webp',
    ],
    nextEditionMonth: 'JAN',
    nextEditionYear: '2027',
  },
  {
    id: 'sao-sebastiao-ilhabela',
    destination: 'São Sebastião x Ilhabela',
    state: 'São Paulo',
    dateLabel: '2026',
    duration: '4 dias · 3 noites',
    spots: 16,
    description: 'O litoral norte paulista em toda sua beleza. Das praias abertas de São Sebastião às enseadas protegidas de Ilhabela.',
    coverImage: '/images/São-Sebastião/SAO%20SEBAS%20X%20ILHABELA%20FOTOS%20SITE.webp',
    galleryImages: [
      '/images/São-Sebastião/FOTO%201.webp',
      '/images/São-Sebastião/FOTO%202.webp',
      '/images/São-Sebastião/FOTO%203.webp',
      '/images/São-Sebastião/FOTO%204.webp',
      '/images/São-Sebastião/FOTO%205.webp',
      '/images/São-Sebastião/FOTO6.webp',
      '/images/São-Sebastião/FOTO%207.webp',
      '/images/São-Sebastião/FOTO%208.webp',
    ],
    nextEditionMonth: 'MAR',
    nextEditionYear: '2027',
  },
  {
    id: 'capitolio-2025',
    destination: 'Capitólio',
    state: 'Minas Gerais',
    dateLabel: 'Ago 2025',
    duration: '8 dias · 7 noites',
    spots: 20,
    description: 'Os cânions esverdeados do Lago de Furnas em cima de um jet ski. Paredões de até 150 m de altura, águas cristalinas.',
    coverImage: '/images/Capitolio/capa.webp',
    galleryImages: [
      '/images/Capitolio/FOTO%201.webp',
      '/images/Capitolio/FOTO%202.webp',
      '/images/Capitolio/FOTO%203.webp',
      '/images/Capitolio/FOTO%204.webp',
      '/images/Capitolio/FOTO%205.webp',
      '/images/Capitolio/FOTO%206.webp',
      '/images/Capitolio/FOTO%207.webp',
      '/images/Capitolio/FOTO%208.webp',
    ],
    nextEditionMonth: 'JUN',
    nextEditionYear: '2027',
  },
]

/* ─── Countdown ──────────────────────────────────────── */
function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true }
    return {
      d: Math.floor(diff / 86_400_000),
      h: Math.floor((diff % 86_400_000) / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      over: false,
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

function Countdown({ date }: { date: string }) {
  const { d, h, m, s, over } = useCountdown(date)
  if (over) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', background: '#FF7B00' }}>
      <span className="mono" style={{ fontSize: '0.82rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>
        Expedição em andamento
      </span>
    </div>
  )
  const units = [{ v: d, l: 'Dias' }, { v: h, l: 'Hrs' }, { v: m, l: 'Min' }, { v: s, l: 'Seg' }]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', flexWrap: 'wrap' }}>
      {units.map(({ v, l }, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#0A0A0A', padding: '0.65rem 0.75rem', minWidth: 'clamp(3.5rem, 6vw, 5.5rem)', textAlign: 'center' }}>
              <span className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#FF7B00', lineHeight: 1, display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                {String(v).padStart(2, '0')}
              </span>
            </div>
            <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#777', marginTop: '0.4rem', fontWeight: 700 }}>{l}</span>
          </div>
          {i < units.length - 1 && (
            <span className="display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#DDD', lineHeight: 1, padding: '0.5rem 0.15rem' }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Reveal ─────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

/* ─── Gallery Modal ──────────────────────────────────── */
function GalleryModal({ exp, onClose }: { exp: PastExpedition; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -20px 80px rgba(0,0,0,0.4)' }}>

        {/* Hero — imagem de capa com título sobreposto */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/7', overflow: 'hidden', background: '#0A0A0A' }}>
          <img src={exp.coverImage} alt={exp.destination}
               style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.15) 100%)' }} />
          <div style={{ position: 'absolute', top: '3px', left: 0, right: 0, height: '3px', background: '#FF7B00' }} />

          {/* Botão fechar flutuante */}
          <button onClick={onClose}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              width: '2.75rem', height: '2.75rem', borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.25)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.25s ease, transform 0.25s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FF7B00'; e.currentTarget.style.transform = 'rotate(90deg)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.transform = 'rotate(0deg)' }}>
            <X size={17} />
          </button>

          {/* Título sobreposto */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(1.5rem,3vw,2.5rem)' }}>
            <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF7B00', display: 'block', marginBottom: '0.4rem', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              {exp.state} · {exp.dateLabel}
            </span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', color: '#fff', lineHeight: 0.95, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
              {exp.destination.toUpperCase()}
            </h2>
          </div>
        </div>

        {/* Descrição + stats */}
        <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)', borderBottom: '1px solid #EBEBEB', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ color: '#555', fontSize: '1rem', fontWeight: 300, lineHeight: 1.8, maxWidth: '560px', flex: '1 1 320px' }}>
            {exp.description}
          </p>
          <div style={{ display: 'flex', gap: '1.75rem', flexShrink: 0 }}>
            {[
              { icon: <Clock size={15} />, label: 'Duração', text: exp.duration },
              { icon: <Users size={15} />, label: 'Grupo', text: `${exp.spots} pessoas` },
            ].map(({ icon, label, text }) => (
              <div key={label} style={{ borderLeft: '2px solid #FF7B00', paddingLeft: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF7B00', marginBottom: '0.25rem' }}>
                  {icon}
                  <span className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
                </div>
                <span style={{ color: '#0A0A0A', fontSize: '0.9rem', fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Galeria — bento grid */}
        <div style={{ padding: 'clamp(1.5rem,3vw,2.5rem)' }}>
          <p className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={14} /> Galeria
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 'clamp(120px,16vw,180px)', gridAutoFlow: 'dense', gap: '0.6rem' }}>
            {exp.galleryImages.map((src, i) => (
              <div key={i}
                   style={{
                     position: 'relative',
                     overflow: 'hidden',
                     background: '#F0F0F0',
                     gridColumn: i === 0 ? 'span 2' : 'span 1',
                     gridRow: i === 0 ? 'span 2' : 'span 1',
                     cursor: 'pointer',
                   }}
                   onMouseEnter={e => {
                     const img = e.currentTarget.querySelector('img') as HTMLImageElement
                     if (img) img.style.transform = 'scale(1.08)'
                     const ov = e.currentTarget.querySelector('.gal-overlay') as HTMLElement
                     if (ov) ov.style.opacity = '1'
                   }}
                   onMouseLeave={e => {
                     const img = e.currentTarget.querySelector('img') as HTMLImageElement
                     if (img) img.style.transform = 'scale(1)'
                     const ov = e.currentTarget.querySelector('.gal-overlay') as HTMLElement
                     if (ov) ov.style.opacity = '0'
                   }}>
                <img src={src} alt={`${exp.destination} ${i + 1}`}
                     style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} />
                <div className="gal-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 45%)', opacity: 0, transition: 'opacity 0.3s ease' }} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Expeditions() {
  const [galleryExp, setGalleryExp] = useState<PastExpedition | null>(null)

  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ── */}
      <section style={{ background: '#0A0A0A', position: 'relative', overflow: 'hidden', paddingTop: 'clamp(8rem,16vh,12rem)', paddingBottom: 'clamp(4rem,8vh,6rem)' }}>
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', overflow: 'hidden' }}>
          <span className="display" style={{ fontSize: 'clamp(8rem,18vw,16rem)', color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>
            EXPEDIÇÕES
          </span>
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <motion.span className="eyebrow"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: '1.25rem' }}>
            Calendário de expedições
          </motion.span>
          <motion.h1 className="display"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: '#fff', lineHeight: 0.9 }}>
            EXPEDIÇÕES
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.75, maxWidth: '480px', marginTop: '1.75rem' }}>
            4 expedições realizadas desde 2022. A próxima já tem data — garanta a sua vaga.
          </motion.p>
        </div>
      </section>

      {/* ── PRÓXIMA EXPEDIÇÃO — Campos do Jordão ── */}
      <section className="wrap" style={{ paddingTop: 'clamp(4rem,8vh,6rem)', paddingBottom: 'clamp(3rem,5vh,4rem)' }}>
        <Reveal>
          <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Próxima expedição</span>
          <h2 className="display" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#0A0A0A', marginBottom: '2rem' }}>
            CAMPOS DO JORDÃO — SÃO PAULO
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ border: '1px solid #EBEBEB', overflow: 'hidden' }}>
            {/* Imagem + Overlay de Meta Info */}
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '380px' }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; if (img) img.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; if (img) img.style.transform = 'scale(1)' }}>
              <img src="/images/Expedição4.jpeg" alt="Campos do Jordão"
                   style={{ width: '100%', aspectRatio: '21/8', minHeight: '380px', objectFit: 'cover', display: 'block', transition: 'transform 0.9s ease' }} />

              {/* Gradientes combinados para garantir a leitura no topo e na base */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />

              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 'clamp(1.5rem,3vw,3rem)' }}>
                {/* Header (Badge + Título) */}
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', background: '#FF7B00', marginBottom: '1rem' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                    <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>Vagas abertas</span>
                  </div>
                  <h3 className="display" style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', color: '#fff', lineHeight: 0.9, marginBottom: '0.4rem' }}>CAMPOS DO JORDÃO</h3>
                  <p className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
                    Serra da Mantiqueira · 21–28 Ago 2026
                  </p>
                </div>

                {/* Informações da Expedição */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                  {[
                    { icon: <MapPin size={14} />, label: 'Destino',    value: 'Campos do Jordão, SP' },
                    { icon: <Clock size={14} />,  label: 'Período',    value: '21 – 28 Ago 2026' },
                    { icon: <Clock size={14} />,  label: 'Duração',    value: '8 dias · 7 noites' },
                    { icon: <Users size={14} />,  label: 'Vagas',      value: '7 de 20 restantes' },
                  ].map(({ icon, label, value }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#FF7B00' }}>{icon}</span>
                        <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{label}</span>
                      </div>
                      <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info inferior branca (Contador, Botão e Preço lado a lado) */}
            <div style={{ background: '#fff', padding: 'clamp(1.5rem,3vw,2.5rem)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>

                {/* Countdown (Esquerda) */}
                <div style={{ flex: '1 1 auto' }}>
                  <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#777', marginBottom: '1rem', fontWeight: 700 }}>
                    A expedição começa em
                  </p>
                  <Countdown date="2026-08-21T08:00:00" />
                </div>

                {/* Botão WhatsApp (Centro) */}
                <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center' }}>
                  <a href="https://wa.me/5511999999999?text=Quero+garantir+minha+vaga+em+Campos+do+Jord%C3%A3o"
                     target="_blank" rel="noopener noreferrer" className="btn-primary"
                     style={{ padding: '1.2rem 3rem', fontSize: '0.8rem' }}>
                    Garantir vaga via WhatsApp
                  </a>
                </div>

                {/* Preço (Direita) */}
                <div style={{ flex: '1 1 auto', textAlign: 'right' }}>
                  <p className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', marginBottom: '0.3rem', fontWeight: 700 }}>Investimento</p>
                  <p className="display" style={{ fontSize: 'clamp(2rem,3vw,2.8rem)', color: '#0A0A0A', lineHeight: 1 }}>R$ 3.800</p>
                  <p className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#999', marginTop: '0.25rem', fontWeight: 700 }}>por pessoa</p>
                </div>

              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── EM BREVE — Florianópolis ── */}
      <section className="wrap" style={{ paddingBottom: 'clamp(5rem,10vh,8rem)' }}>
        <Reveal>
          <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Em breve</span>
          <h2 className="display" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#0A0A0A', marginBottom: '2rem' }}>
            PRÓXIMAS EXPEDIÇÕES
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          {/* Card Florianópolis — sem clique, só teaser */}
          <div style={{ position: 'relative', overflow: 'hidden', background: '#0A0A0A', border: '1px solid #EBEBEB', aspectRatio: '21/7' }}>
            {/* Fundo com gradiente premium */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 50%, #0A0A0A 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,123,0,0.08) 0%, transparent 60%)' }} />

            {/* Conteúdo */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: 'clamp(2rem,4vw,4rem)', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.9rem', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '1.25rem' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    Em breve · Data a confirmar
                  </span>
                </div>
                <h3 className="display" style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)', color: '#fff', lineHeight: 0.88, marginBottom: '0.5rem' }}>
                  FLORIANÓPOLIS
                </h3>
                <p className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                  Santa Catarina · Outubro 2026
                </p>
              </div>

              {/* Lado direito — destaque da data */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Previsão
                </p>
                <p className="display" style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: '#FF7B00', lineHeight: 1 }}>
                  OUT
                </p>
                <p className="display" style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: '#FF7B00', lineHeight: 1 }}>
                  2026
                </p>
                <p className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem', fontWeight: 700 }}>
                  data a confirmar
                </p>
              </div>
            </div>

            {/* Linha decorativa laranja no fundo */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #FF7B00, transparent)' }} />
          </div>
        </Reveal>
      </section>

      {/* ── EXPEDIÇÕES REALIZADAS (faixas horizontais, estilo Florianópolis) ── */}
      <section style={{ borderTop: '1px solid #EBEBEB', background: '#F7F7F5', paddingTop: 'clamp(4rem,8vh,6rem)', paddingBottom: 'clamp(6rem,12vh,10rem)' }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow-dark" style={{ marginBottom: '0.75rem' }}>Arquivo</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', color: '#0A0A0A', marginBottom: 'clamp(2.5rem,5vh,3.5rem)' }}>
              EXPEDIÇÕES REALIZADAS
            </h2>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {PAST.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 0.08}>
                <div
                  className="past-exp-card"
                  onClick={() => setGalleryExp(exp)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0A0A0A',
                    border: '1px solid #EBEBEB',
                    aspectRatio: '21/7',
                    cursor: 'pointer',
                    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = '#FF7B00'
                    el.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)'
                    const img = el.querySelector('.banner-bg') as HTMLImageElement
                    if (img) img.style.transform = 'scale(1.08)'
                    const overlay = el.querySelector('.banner-overlay') as HTMLElement
                    if (overlay) overlay.style.opacity = '0.55'
                    const content = el.querySelector('.banner-content') as HTMLElement
                    if (content) content.style.transform = 'translateY(-4px)'
                    const btn = el.querySelector('.gallery-btn') as HTMLElement
                    if (btn) {
                      btn.style.background = '#FF7B00'
                      btn.style.borderColor = '#FF7B00'
                      btn.style.color = '#fff'
                      btn.style.paddingRight = '1.4rem'
                    }
                    const arrow = el.querySelector('.gallery-arrow') as HTMLElement
                    if (arrow) arrow.style.transform = 'translateX(3px)'
                    const line = el.querySelector('.accent-line') as HTMLElement
                    if (line) line.style.width = '100%'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = '#EBEBEB'
                    el.style.boxShadow = 'none'
                    const img = el.querySelector('.banner-bg') as HTMLImageElement
                    if (img) img.style.transform = 'scale(1)'
                    const overlay = el.querySelector('.banner-overlay') as HTMLElement
                    if (overlay) overlay.style.opacity = '1'
                    const content = el.querySelector('.banner-content') as HTMLElement
                    if (content) content.style.transform = 'translateY(0)'
                    const btn = el.querySelector('.gallery-btn') as HTMLElement
                    if (btn) {
                      btn.style.background = 'transparent'
                      btn.style.borderColor = 'rgba(255,255,255,0.4)'
                      btn.style.color = '#fff'
                      btn.style.paddingRight = '1.75rem'
                    }
                    const arrow = el.querySelector('.gallery-arrow') as HTMLElement
                    if (arrow) arrow.style.transform = 'translateX(0)'
                    const line = el.querySelector('.accent-line') as HTMLElement
                    if (line) line.style.width = '0%'
                  }}
                >
                  {/* Imagem de fundo */}
                  <img
                    src={exp.coverImage}
                    alt={exp.destination}
                    className="banner-bg"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.8s ease',
                    }}
                  />

                  {/* Overlay escuro (transição suave no hover) */}
                  <div
                    className="banner-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.15) 100%)',
                      opacity: 1,
                      transition: 'opacity 0.5s ease',
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)' }} />
                  {/* Vinheta extra atrás da data (direita), garante legibilidade do laranja */}
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 90% 40%, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />

                  {/* Número de índice — detalhe editorial */}
                  <span className="mono" style={{ position: 'absolute', top: 'clamp(1.25rem,2.5vw,1.75rem)', right: 'clamp(1.25rem,2.5vw,1.75rem)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', textShadow: '0 2px 8px rgba(0,0,0,0.8)', zIndex: 1, fontWeight: 700 }}>
                    0{i + 1} / 0{PAST.length}
                  </span>

                  {/* Conteúdo */}
                  <div
                    className="banner-content"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'clamp(1.25rem,3vw,3rem)',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      transition: 'transform 0.5s ease',
                    }}
                  >
                    {/* Esquerda: badge, título, botão */}
                    <div style={{ maxWidth: '520px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.25)', marginBottom: '0.9rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7B00', flexShrink: 0 }} />
                        <span className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>
                          Realizada · {exp.state} · {exp.dateLabel}
                        </span>
                      </div>

                      <h3 className="display" style={{ fontSize: 'clamp(1.8rem,4vw,3.2rem)', color: '#fff', lineHeight: 0.95, marginBottom: '1.1rem', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
                        {exp.destination.toUpperCase()}
                      </h3>

                      {/* Zona de ação — botão minimalista */}
                      <button
                        className="gallery-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.55rem',
                          padding: '0.7rem 1.75rem',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          color: '#fff',
                          borderRadius: '99px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>Ver Galeria</span>
                        <ArrowRight className="gallery-arrow" size={15} style={{ transition: 'transform 0.3s ease' }} />
                      </button>
                    </div>

                    {/* Direita: Datas das Previsões */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Previsão Próxima Edição
                      </p>
                      <p className="display" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#FF7B00', lineHeight: 1 }}>
                        {exp.nextEditionMonth}
                      </p>
                      <p className="display" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', color: '#FF7B00', lineHeight: 1 }}>
                        {exp.nextEditionYear}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modal da Galeria */}
      <AnimatePresence>
        {galleryExp && (
          <GalleryModal exp={galleryExp} onClose={() => setGalleryExp(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}