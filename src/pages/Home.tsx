import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'

const slides = [
  { src: '/images/image1.png', caption: 'Capitólio — Minas Gerais' },
  { src: '/images/image2.png', caption: 'Lago de Furnas — MG' },
  { src: '/images/image3.png', caption: 'Bonito — Mato Grosso do Sul' },
  { src: '/images/image4.png', caption: 'Ilha Grande — Rio de Janeiro' },
  { src: '/images/image5.png', caption: 'Serra da Canastra — MG' },
]

/* ─ Countdown hook ─────────────────────────────────────── */
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

/* ─ Countdown display ──────────────────────────────────── */
function Countdown({ date }: { date: string }) {
  const { d, h, m, s, over } = useCountdown(date)

  if (over) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2rem', background: '#FF7B00' }}>
      <span className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff' }}>
        Expedição em andamento
      </span>
    </div>
  )

  const units = [
    { v: d, l: 'Dias' },
    { v: h, l: 'Horas' },
    { v: m, l: 'Min' },
    { v: s, l: 'Seg' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', flexWrap: 'wrap' }}>
      {units.map(({ v, l }, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: '#0A0A0A',
              padding: '0.85rem 1rem',
              minWidth: 'clamp(4.5rem, 8vw, 7rem)',
              textAlign: 'center',
            }}>
              <span className="display" style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                color: '#FF7B00',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                display: 'block',
              }}>
                {String(v).padStart(2, '0')}
              </span>
            </div>
            <span className="mono" style={{
              fontSize: '0.6rem', letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#999',
              marginTop: '0.5rem',
            }}>
              {l}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="display" style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#DEDEDE', lineHeight: 1,
              padding: '0.7rem 0.2rem',
              marginTop: '0.1rem',
            }}>:</span>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─ Reveal ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {}, className = '' }:
  { children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-70px' })
  return (
    <motion.div ref={ref} className={className} style={style}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

/* ─ Carousel — full width, sem wrap ───────────────────── */
function Carousel() {
  const [cur, setCur]       = useState(0)
  const [dir, setDir]       = useState(1)
  const [paused, setPaused] = useState(false)
  const total               = slides.length

  const goTo = useCallback((idx: number, d: number) => {
    setDir(d)
    setCur(((idx % total) + total) % total)
  }, [total])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => goTo(cur + 1, 1), 5500)
    return () => clearInterval(id)
  }, [cur, paused, goTo])

  return (
    <div
      style={{
        position: 'relative', overflow: 'hidden', background: '#000',
        width: '100%', aspectRatio: '16/8',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={cur} custom={dir}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
            center: { x: 0 },
            exit:  (d: number) => ({ x: d > 0 ? '-100%' : '100%' }),
          }}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.85, ease: [0.77, 0, 0.18, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <img
            src={slides[cur].src}
            alt={slides[cur].caption}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
          <motion.p
            className="mono"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{
              position: 'absolute', bottom: '2rem', left: 'clamp(1.5rem, 5vw, 7rem)',
              fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {slides[cur].caption}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={() => goTo(cur - 1, -1)}
        style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 'clamp(1rem, 3vw, 3rem)', zIndex: 10,
          width: '3rem', height: '3rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(10px)', color: '#fff', cursor: 'pointer', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => goTo(cur + 1, 1)}
        style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          right: 'clamp(1rem, 3vw, 3rem)', zIndex: 10,
          width: '3rem', height: '3rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(10px)', color: '#fff', cursor: 'pointer', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Counter */}
      <div className="mono" style={{
        position: 'absolute', top: '2rem', right: 'clamp(1.5rem, 5vw, 7rem)', zIndex: 10,
        fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)',
      }}>
        {String(cur + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Progress dots */}
      <div style={{
        position: 'absolute', bottom: '2rem', right: 'clamp(1.5rem, 5vw, 7rem)', zIndex: 10,
        display: 'flex', gap: '0.4rem',
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i, i > cur ? 1 : -1)}
            style={{
              height: '2px', border: 'none', cursor: 'pointer', padding: 0,
              width: i === cur ? '2.5rem' : '0.9rem',
              background: i === cur ? '#FF7B00' : 'rgba(255,255,255,0.25)',
              transition: 'all 0.35s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─ Home ────────────────────────────────────────────────── */
export default function Home() {
  const heroRef     = useRef(null)
  const { scrollY } = useScroll()
  const imgY        = useTransform(scrollY, [0, 700], [0, 160])
  const textOpacity = useTransform(scrollY, [0, 420], [1, 0])
  const textY       = useTransform(scrollY, [0, 420], [0, 55])

  return (
    <main style={{ background: '#fff' }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        position: 'relative', height: '100dvh', minHeight: '640px',
        overflow: 'hidden', background: '#000',
      }}>
        <motion.div style={{ y: imgY, position: 'absolute', inset: 0, scale: 1.1 }}>
          <img src="/images/hero-bg.png" alt=""
               style={{ width: '100%', height: '100%', objectFit: 'cover',
                        objectPosition: 'center 40%', opacity: 0.52, display: 'block' }} />
        </motion.div>
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 65%)' }} />

        <motion.div
          style={{ opacity: textOpacity, y: textY, position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}
          className="wrap"
        >
          <div style={{ paddingBottom: 'clamp(3.5rem, 7vh, 6rem)' }}>
            <motion.p className="mono"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                       color: '#FF7B00', marginBottom: '1.5rem' }}>
              Expedições Náuticas · Brasil · Desde 2018
            </motion.p>

            <motion.h1 className="display"
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(4.5rem, 13vw, 12rem)', color: '#fff',
                       lineHeight: 0.88, marginBottom: '0.12em' }}>
              USINA<br />
              <span style={{ WebkitTextStroke: '2px #FF7B00', color: 'transparent' }}>DO JET</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.72 }}
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', fontWeight: 300,
                       marginTop: '1.75rem', marginBottom: '2.5rem' }}>
              Onde a velocidade encontra a natureza
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.88 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/expedicoes" className="btn-primary">
                Ver próxima expedição <ArrowUpRight size={15} />
              </Link>
              <Link to="/expedicoes" className="mono"
                style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                         color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
                         display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}>
                Expedições passadas <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
          style={{ position: 'absolute', bottom: '2.5rem', right: '2.5rem', zIndex: 2,
                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: '1px', height: '3.5rem',
                     background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))' }} />
          <span className="mono" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            scroll
          </span>
        </motion.div>
      </section>

      {/* ══ MANIFESTO ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: 'clamp(7rem, 14vh, 12rem) 0',
                        borderBottom: '1px solid #EBEBEB' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: 'clamp(3rem, 6vw, 8rem)', alignItems: 'end' }}
               className="grid-cols-1 lg:grid-cols-2">
            <div>
              <Reveal>
                <span className="eyebrow" style={{ marginBottom: '1.5rem' }}>Sobre a Usina do Jet</span>
                <h2 className="display" style={{ fontSize: 'clamp(2.8rem, 6.5vw, 6rem)', color: '#0A0A0A' }}>
                  DESDE 2018,<br />
                  <span style={{ color: '#FF7B00' }}>LEVAMOS</span><br />
                  QUEM AMA<br />
                  VELOCIDADE
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <p style={{ color: '#666', fontSize: '1.1rem', fontWeight: 300,
                          lineHeight: 1.85, marginBottom: '2.5rem' }}>
                A Usina do Jet é uma comunidade de apaixonados por aventura náutica.
                Reunimos pessoas que escolheram viver com intensidade — explorando
                os destinos mais bonitos do Brasil sobre as águas.
              </p>
              <Link to="/expedicoes" className="btn-outline">
                Conheça as expedições
              </Link>
            </Reveal>
          </div>

          {/* Stats */}
          <Reveal delay={0.2}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              marginTop: 'clamp(5rem, 9vh, 8rem)',
              border: '1px solid #EBEBEB',
            }}>
              {[
                { n: '3',    label: 'Expedições realizadas', sub: 'e a 4ª chegando' },
                { n: '2018', label: 'Ano de fundação',       sub: 'muito mais por vir' },
                { n: '100%', label: 'Experiência imersiva',  sub: 'do início ao fim' },
              ].map(({ n, label, sub }, i) => (
                <div key={n} style={{
                  padding: 'clamp(2rem, 4vw, 3.5rem)',
                  borderRight: i < 2 ? '1px solid #EBEBEB' : 'none',
                }}>
                  <p className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    color: '#0A0A0A', marginBottom: '0.5rem' }}>{n}</p>
                  <p style={{ color: '#0A0A0A', fontSize: '0.95rem', fontWeight: 600,
                               marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ color: '#999', fontSize: '0.85rem', fontWeight: 300 }}>{sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ GALERIA — full width sem wrap ══════════════════════ */}
      <section style={{ background: '#fff', paddingTop: 'clamp(5rem, 9vh, 8rem)' }}>
        {/* Header dentro do wrap */}
        <div className="wrap" style={{ marginBottom: '2.5rem' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end',
                           justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.85rem' }}>Galeria</span>
              <h2 className="display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)', color: '#0A0A0A' }}>
                NOSSAS EXPEDIÇÕES
              </h2>
            </div>
            <Link to="/expedicoes" className="mono"
              style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                       color: '#888', textDecoration: 'none',
                       display: 'flex', alignItems: 'center', gap: '0.5rem',
                       paddingBottom: '0.25rem', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF7B00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888' }}>
              Ver todas <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
        {/* Carrossel fora do wrap — vai de borda a borda */}
        <Reveal delay={0.1}>
          <Carousel />
        </Reveal>
      </section>

      {/* ══ PRÓXIMA EXPEDIÇÃO com countdown ════════════════════ */}
      <section style={{ background: '#F7F7F5', padding: 'clamp(6rem, 11vh, 10rem) 0',
                        borderTop: '1px solid #EBEBEB' }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow" style={{ marginBottom: '0.85rem' }}>4ª Expedição</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
              color: '#0A0A0A', marginBottom: 'clamp(3rem, 5vh, 4rem)' }}>
              A PRÓXIMA AVENTURA JÁ TEM DESTINO
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            {/* Countdown em destaque */}
            <div style={{
              background: '#fff', border: '1px solid #EBEBEB',
              padding: 'clamp(2rem, 4vw, 3.5rem)',
              marginBottom: '2rem',
              display: 'flex', flexWrap: 'wrap',
              alignItems: 'center', justifyContent: 'space-between', gap: '2.5rem',
            }}>
              <div>
                <p className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#999', marginBottom: '1.5rem' }}>
                  A expedição começa em
                </p>
                <Countdown date="2025-08-21T08:00:00" />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="mono" style={{ fontSize: '0.65rem', letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#999', marginBottom: '0.5rem' }}>
                  Investimento
                </p>
                <p className="display" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: '#0A0A0A' }}>
                  R$ 3.800
                </p>
                <p className="mono" style={{ fontSize: '0.6rem', letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#999', marginTop: '0.3rem' }}>
                  por pessoa · 7 vagas restantes
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <Link to="/expedicoes" style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{ position: 'relative', overflow: 'hidden', background: '#000',
                         border: '1px solid #EBEBEB', cursor: 'pointer' }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if (img) img.style.transform = 'scale(1.04)'
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if (img) img.style.transform = 'scale(1)'
                }}
              >
                <img src="/images/Expedição1.png" alt="Capitólio MG"
                     style={{ width: '100%', aspectRatio: '21/8', objectFit: 'cover',
                              display: 'block', transition: 'transform 0.9s ease' }} />
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 100%)' }} />

                <div style={{ position: 'absolute', inset: 0, padding: 'clamp(2rem, 4vw, 4.5rem)',
                              display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 1rem', background: '#FF7B00',
                                marginBottom: '1.75rem', width: 'fit-content' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff',
                      flexShrink: 0, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                    <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.18em',
                      textTransform: 'uppercase', color: '#fff' }}>Vagas abertas</span>
                  </div>

                  <h3 className="display" style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)',
                    color: '#fff', lineHeight: 0.88, marginBottom: '0.3em' }}>CAPITÓLIO</h3>
                  <p className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.18em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
                    marginBottom: '2rem' }}>Minas Gerais · Lago de Furnas · 21–28 Ago 2025</p>

                  <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                    {[['8 dias', '7 noites'], ['7 vagas', 'restantes'], ['R$ 3.800', 'por pessoa']].map(([v, l]) => (
                      <div key={v}>
                        <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.15rem' }}>{v}</p>
                        <p className="mono" style={{ fontSize: '0.58rem', letterSpacing: '0.14em',
                          textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>{l}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span className="mono" style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                      Ver roteiro completo
                    </span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA FINAL ══════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', position: 'relative', overflow: 'hidden',
        padding: 'clamp(7rem, 14vh, 12rem) 0', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
          <span className="display" style={{ fontSize: 'clamp(10rem, 28vw, 26rem)',
            color: 'rgba(255,255,255,0.018)', whiteSpace: 'nowrap', letterSpacing: '-0.04em' }}>JET</span>
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal>
            <span className="eyebrow" style={{ marginBottom: '1.5rem' }}>Faça parte</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: '#fff',
              lineHeight: 0.9, marginBottom: '0.12em' }}>PRONTO PARA</h2>
            <h2 className="display" style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.9,
              marginBottom: 'clamp(2rem, 4vh, 3rem)',
              WebkitTextStroke: '2px #FF7B00', color: 'transparent' }}>EMBARCAR?</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '1.05rem', fontWeight: 300,
                        maxWidth: '380px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
              A 4ª expedição da Usina do Jet está com vagas abertas. Garanta a sua antes que esgote.
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <Link to="/expedicoes" className="btn-primary" style={{ margin: '0 auto' }}>
              Garantir minha vaga <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>

    </main>
  )
}