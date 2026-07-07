import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { X, ChevronRight, ArrowRight, MapPin, Clock, Users } from 'lucide-react'

interface Expedition {
  id: string
  status: 'proxima' | 'realizada'
  destination: string
  state: string
  date: string
  dateLabel: string
  duration: string
  spots: number
  spotsLeft: number
  price: string
  description: string
  highlights: string[]
  itinerary: { day: string; title: string; description: string }[]
  includes: string[]
  hotel: string
  image: string
}

const NEXT: Expedition = {
  id: 'campos-jordao-2026',
  status: 'proxima',
  destination: 'Campos do Jordão',
  state: 'São Paulo',
  date: '2026-08-21T08:00:00',
  dateLabel: '21 – 28 Ago 2026',
  duration: '8 dias · 7 noites',
  spots: 20,
  spotsLeft: 7,
  price: 'R$ 3.800',
  description: 'Uma expedição diferente de tudo que você já viveu. Campos do Jordão com UTVs e quadriciclos — trilhas na serra, paisagens de tirar o fôlego e a adrenalina off road que só a Usina do Jet sabe entregar.',
  highlights: [
    'Trilhas exclusivas na Serra da Mantiqueira',
    'Passeio de UTV e quadriciclo guiado',
    'Paisagens únicas do Pico do Itapeva',
    'Experiência off road com guia especializado',
  ],
  itinerary: [
    { day: 'Dia 01', title: 'Chegada e check-in',          description: 'Recepção no hotel, briefing de segurança e apresentação dos equipamentos.' },
    { day: 'Dia 02', title: 'Trilha da Mantiqueira',       description: 'Primeira trilha oficial com UTVs. Paisagens da Serra da Mantiqueira.' },
    { day: 'Dia 03', title: 'Pico do Itapeva',             description: 'Rota até o Pico do Itapeva com parada panorâmica e almoço na serra.' },
    { day: 'Dia 04', title: 'Quadriciclos — Trilha Livre', description: 'Dia de trilha livre com quadriciclos. Ritmo mais relaxado para fotos e vídeos.' },
    { day: 'Dia 05', title: 'Rota das Araucárias',         description: 'Percurso entre as araucárias centenárias da região. Paisagem única.' },
    { day: 'Dia 06', title: 'Trilha e cachoeiras',         description: 'Exploração das cachoeiras da serra com parada para banho.' },
    { day: 'Dia 07', title: 'Confraternização',            description: 'Jantar especial de encerramento, entrega de certificados e fotos do grupo.' },
    { day: 'Dia 08', title: 'Retorno',                     description: 'Café da manhã especial e transfer para o aeroporto.' },
  ],
  includes: [
    '7 noites em hotel 4★ na serra',
    'Café da manhã todos os dias',
    'Almoço nos dias 02, 03 e 05',
    'Jantar de abertura e encerramento',
    'UTV e quadriciclo com combustível incluso',
    'Capacete, colete e equipamentos de proteção',
    'Guia off road certificado',
    'Seguro de aventura completo',
    'Transfer aeroporto ↔ hotel',
  ],
  hotel: 'Hotel Vila Inglesa 4★ — Campos do Jordão',
  image: '/images/Expedição4.jpeg',
}

const PAST: Expedition[] = [
  {
    id: 'capitolio-2025',
    status: 'realizada',
    destination: 'Capitólio',
    state: 'Minas Gerais',
    date: '2025-08-21T08:00:00',
    dateLabel: '21 – 28 Ago 2025',
    duration: '8 dias · 7 noites',
    spots: 20,
    spotsLeft: 0,
    price: 'R$ 3.800',
    description: 'Os cânions esverdeados do Lago de Furnas em cima de um jet ski. Paredões de até 150 m de altura, águas cristalinas e silêncio absoluto.',
    highlights: ['Cânion das Escadas', 'Furnas do Bom Jesus', 'Pôr do sol no Mirante', 'Night ride pelo lago'],
    itinerary: [
      { day: 'Dia 01', title: 'Chegada',           description: 'Recepção e briefing de segurança.' },
      { day: 'Dia 02', title: 'Cânions de Furnas', description: 'Cânion das Escadas e piscinas naturais.' },
      { day: 'Dia 03', title: 'Cascatas',          description: 'Furnas do Bom Jesus e Cascata da Formiga.' },
      { day: 'Dia 04', title: 'Dia livre',         description: 'Descanso e passeios opcionais.' },
      { day: 'Dia 05', title: 'Night ride',        description: 'Passeio noturno iluminado pelo lago.' },
      { day: 'Dia 06', title: 'Mirante do Lago',   description: 'Último passeio e pôr do sol.' },
      { day: 'Dia 07', title: 'Confraternização',  description: 'Almoço especial e certificados.' },
      { day: 'Dia 08', title: 'Retorno',           description: 'Café da manhã e transfer.' },
    ],
    includes: ['7 noites em hotel 4★', 'Café da manhã', 'Almoços inclusos', 'Jet ski com combustível', 'Guia náutico', 'Seguro aventura'],
    hotel: 'Capitólio Eco Resort 4★',
    image: '/images/Expedição1.png',
  },
  {
    id: 'ilha-grande-2025',
    status: 'realizada',
    destination: 'Ilha Grande',
    state: 'Rio de Janeiro',
    date: '2025-01-10T08:00:00',
    dateLabel: '10 – 13 Jan 2025',
    duration: '4 dias · 3 noites',
    spots: 18,
    spotsLeft: 0,
    price: 'R$ 4.200',
    description: 'Circunavegação da Ilha Grande por jet ski: praias desertas, enseadas secretas e o azul mais intenso do litoral fluminense.',
    highlights: ['Praia Lopes Mendes', 'Lagoa Azul', 'Gruta do Acaiá', 'Praias Selvagens'],
    itinerary: [
      { day: 'Dia 01', title: 'Vila do Abraão', description: 'Chegada de barco e reconhecimento.' },
      { day: 'Dia 02', title: 'Circuito Sul',   description: 'Lopes Mendes e Lagoa Azul.' },
      { day: 'Dia 03', title: 'Circuito Norte', description: 'Gruta do Acaiá e praias selvagens.' },
      { day: 'Dia 04', title: 'Retorno',        description: 'Manhã livre e transfer.' },
    ],
    includes: ['3 noites em pousada boutique', 'Café da manhã e jantar', 'Jet ski premium', 'Guia náutico', 'Seguro aventura', 'Transfer de lancha'],
    hotel: 'Pousada Naturalia — Boutique',
    image: '/images/Expedição2.png',
  },
  {
    id: 'bonito-2024',
    status: 'realizada',
    destination: 'Bonito',
    state: 'Mato Grosso do Sul',
    date: '2024-11-08T08:00:00',
    dateLabel: '08 – 12 Nov 2024',
    duration: '5 dias · 4 noites',
    spots: 16,
    spotsLeft: 0,
    price: 'R$ 4.900',
    description: 'Rios cristalinos do Pantanal, fauna exuberante e mergulho com visibilidade de até 40 metros.',
    highlights: ['Rio da Prata', 'Rio Sucuri', 'Gruta do Lago Azul', 'Safari no Pantanal'],
    itinerary: [
      { day: 'Dia 01', title: 'Chegada',      description: 'Check-in e jantar.' },
      { day: 'Dia 02', title: 'Rio da Prata', description: 'Flutuação e jet ski.' },
      { day: 'Dia 03', title: 'Rio Sucuri',   description: 'Mergulho cristalino.' },
      { day: 'Dia 04', title: 'Safari',       description: 'Pantanal fotográfico.' },
      { day: 'Dia 05', title: 'Retorno',      description: 'Gruta e encerramento.' },
    ],
    includes: ['4 noites em resort 4★', 'Pensão completa', 'Jet ski', 'Equipamentos', 'Guia náutico', 'Seguro aventura'],
    hotel: 'Zagaia Eco Resort 4★',
    image: '/images/Expedição3.png',
  },
]

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
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '1rem 2rem', background: '#FF7B00' }}>
      <span className="mono" style={{ fontSize: '0.85rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>
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
    <div>
      <p className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#666', marginBottom: '1.25rem', fontWeight: 700 }}>
        A expedição começa em
      </p>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', flexWrap: 'wrap' }}>
        {units.map(({ v, l }, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ background: '#0A0A0A', padding: '0.85rem 1rem', minWidth: 'clamp(4.5rem, 8vw, 7rem)', textAlign: 'center' }}>
                <span className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#FF7B00', lineHeight: 1, display: 'block', fontVariantNumeric: 'tabular-nums' }}>
                  {String(v).padStart(2, '0')}
                </span>
              </div>
              <span className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#777', marginTop: '0.5rem', fontWeight: 700 }}>
                {l}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#DEDEDE', lineHeight: 1, padding: '0.7rem 0.2rem', marginTop: '0.1rem' }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

function Modal({ exp, onClose }: { exp: Expedition; onClose: () => void }) {
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
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto', borderTop: '3px solid #FF7B00' }}>

        {/* Imagem header */}
        <div style={{ position: 'relative', height: '280px', overflow: 'hidden', flexShrink: 0 }}>
          <img src={exp.image} alt={exp.destination}
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
          <button onClick={onClose}
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '2.5rem', height: '2.5rem',
              background: 'rgba(255,255,255,0.9)', border: 'none', color: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem 2.5rem' }}>
            <span className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF7B00', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
              {exp.state} · {exp.dateLabel}
            </span>
            <h2 className="display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#fff' }}>
              {exp.destination.toUpperCase()}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '2.5rem 2.5rem 3.5rem' }}>

          {/* Countdown se próxima */}
          {exp.status === 'proxima' && (
            <div style={{ marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #EBEBEB' }}>
              <Countdown date={exp.date} />
            </div>
          )}

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '0', marginBottom: '2.5rem', border: '1px solid #EBEBEB' }}>
            {[
              { label: 'Investimento', value: exp.price,    accent: true },
              { label: 'Duração',      value: exp.duration, accent: false },
              { label: 'Hospedagem',   value: exp.hotel,    accent: false },
              exp.status === 'proxima'
                ? { label: 'Vagas',  value: `${exp.spotsLeft} restantes`, accent: true }
                : { label: 'Status', value: 'Encerrada',                  accent: false },
            ].map(({ label, value, accent }, i, arr) => (
              <div key={label} style={{ padding: '1.5rem', borderRight: i < arr.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {label}
                </p>
                <p style={{ color: accent ? '#FF7B00' : '#0A0A0A', fontSize: '1rem', fontWeight: 700 }}>{value}</p>
              </div>
            ))}
          </div>

          <p style={{ color: '#555', fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.85, marginBottom: '2.5rem' }}>
            {exp.description}
          </p>

          {/* Destaques */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', marginBottom: '1.25rem', fontWeight: 700 }}>
              Destaques
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {exp.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <ChevronRight size={14} style={{ color: '#FF7B00', flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#333', fontSize: '0.9rem', fontWeight: 400 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Roteiro */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', marginBottom: '1.25rem', fontWeight: 700 }}>
              Roteiro
            </p>
            <div style={{ border: '1px solid #EBEBEB' }}>
              {exp.itinerary.map((day, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.25rem 1.5rem', borderBottom: i < exp.itinerary.length - 1 ? '1px solid #EBEBEB' : 'none' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF7B00', width: '3.5rem', flexShrink: 0, paddingTop: '2px', fontWeight: 700 }}>
                    {day.day}
                  </span>
                  <div>
                    <p style={{ color: '#0A0A0A', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{day.title}</p>
                    <p style={{ color: '#666', fontSize: '0.875rem', fontWeight: 300, lineHeight: 1.7 }}>{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incluso */}
          <div style={{ background: '#F7F7F5', border: '1px solid #EBEBEB', padding: '1.75rem', marginBottom: '2.5rem' }}>
            <p className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', marginBottom: '1.25rem', fontWeight: 700 }}>
              O que está incluso
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {exp.includes.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7B00', flexShrink: 0 }} />
                  <span style={{ color: '#444', fontSize: '0.9rem', fontWeight: 400 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1.75rem', borderTop: '1px solid #EBEBEB' }}>
            {exp.status === 'proxima' ? (
              <a href={`https://wa.me/5511999999999?text=Quero+garantir+minha+vaga+em+${encodeURIComponent(exp.destination)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Garantir vaga via WhatsApp
              </a>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#F7F7F5', border: '1px solid #EBEBEB' }}>
                <span className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#999', fontWeight: 700 }}>
                  Expedição encerrada
                </span>
              </div>
            )}
            <button onClick={onClose} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Fechar</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Expeditions() {
  const [modal, setModal] = useState<Expedition | null>(null)

  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Header */}
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
            Calendário · 4ª expedição confirmada
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
            Desde 2018 realizamos 3 expedições inesquecíveis. A 4ª está chegando — garanta a sua vaga.
          </motion.p>
        </div>
      </section>

      {/* Próxima */}
      <section className="wrap" style={{ paddingTop: 'clamp(5rem,10vh,8rem)', paddingBottom: 'clamp(5rem,10vh,8rem)' }}>
        <Reveal>
          <span className="eyebrow" style={{ marginBottom: '0.85rem' }}>Próxima expedição · 4ª edição</span>
          <h2 className="display" style={{ fontSize: 'clamp(2rem,5vw,4rem)', color: '#0A0A0A', marginBottom: 'clamp(3rem,5vh,4rem)' }}>
            {NEXT.destination.toUpperCase()} — {NEXT.state.toUpperCase()}
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ border: '1px solid #EBEBEB', overflow: 'hidden' }}>

            {/* Imagem */}
            <div style={{ position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; if (img) img.style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector('img') as HTMLImageElement; if (img) img.style.transform = 'scale(1)' }}>
              <img src={NEXT.image} alt={NEXT.destination}
                   style={{ width: '100%', aspectRatio: '21/8', objectFit: 'cover', display: 'block', transition: 'transform 0.9s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: '2rem', left: '2.5rem' }}>
                <span className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
                  Serra da Mantiqueira · São Paulo
                </span>
              </div>
            </div>

            {/* Info */}
            <div style={{ background: '#fff', padding: 'clamp(2.5rem,4vw,4rem)' }}>

              {/* Badge + meta + preço */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1rem', background: '#FF7B00', marginBottom: '1.5rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', flexShrink: 0, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                    <span className="mono" style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>
                      Vagas abertas · {NEXT.spotsLeft} restantes
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                    {[
                      { icon: <MapPin size={14} />, label: 'Destino',  value: `${NEXT.destination}, ${NEXT.state}` },
                      { icon: <Clock size={14} />,  label: 'Período',  value: NEXT.dateLabel },
                      { icon: <Clock size={14} />,  label: 'Duração',  value: NEXT.duration },
                      { icon: <Users size={14} />,  label: 'Vagas',    value: `${NEXT.spotsLeft} de ${NEXT.spots}` },
                    ].map(({ icon, label, value }) => (
                      <div key={label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <span style={{ color: '#FF7B00' }}>{icon}</span>
                          <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>
                            {label}
                          </span>
                        </div>
                        <p style={{ color: '#0A0A0A', fontSize: '0.95rem', fontWeight: 600 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Investimento
                  </p>
                  <p className="display" style={{ fontSize: 'clamp(2.5rem,4vw,3.5rem)', color: '#0A0A0A' }}>{NEXT.price}</p>
                  <p className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginTop: '0.3rem', fontWeight: 700 }}>
                    por pessoa
                  </p>
                </div>
              </div>

              {/* Countdown */}
              <div style={{ padding: '2.5rem', background: '#F7F7F5', border: '1px solid #EBEBEB', marginBottom: '3rem' }}>
                <Countdown date={NEXT.date} />
              </div>

              {/* Destaques */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '0.75rem', marginBottom: '3rem' }}>
                {NEXT.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', border: '1px solid #EBEBEB' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FF7B00', flexShrink: 0 }} />
                    <span style={{ color: '#333', fontSize: '0.9rem', fontWeight: 400 }}>{h}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href={`https://wa.me/5511999999999?text=Quero+garantir+minha+vaga+em+${encodeURIComponent(NEXT.destination)}`}
                   target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Garantir vaga via WhatsApp
                </a>
                <button onClick={() => setModal(NEXT)} className="btn-outline">
                  Ver roteiro completo <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Passadas */}
      <section style={{ borderTop: '1px solid #EBEBEB', background: '#F7F7F5', paddingTop: 'clamp(4rem,8vh,6rem)', paddingBottom: 'clamp(6rem,12vh,10rem)' }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow-dark" style={{ marginBottom: '0.85rem' }}>Arquivo</span>
            <h2 className="display" style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', color: '#0A0A0A', marginBottom: 'clamp(3rem,5vh,4rem)' }}>
              EXPEDIÇÕES REALIZADAS
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {PAST.map((exp, i) => (
              <Reveal key={exp.id} delay={i * 0.08}>
                <div
                  onClick={() => setModal(exp)}
                  style={{ cursor: 'pointer', background: '#fff', border: '1px solid #EBEBEB', overflow: 'hidden', transition: 'box-shadow 0.25s, border-color 0.25s' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = '0 8px 40px rgba(0,0,0,0.1)'
                    el.style.borderColor = '#D0D0D0'
                    const img = el.querySelector('img') as HTMLImageElement
                    if (img) img.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = 'none'
                    el.style.borderColor = '#EBEBEB'
                    const img = el.querySelector('img') as HTMLImageElement
                    if (img) img.style.transform = 'scale(1)'
                  }}
                >
                  <div style={{ overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
                    <img src={exp.image} alt={exp.destination}
                         style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s ease' }} />
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.4rem 0.9rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
                      <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                        Realizada
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1.75rem 2rem' }}>
                    <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '0.4rem', fontWeight: 700 }}>
                      {exp.state} · {exp.dateLabel}
                    </span>
                    <h3 className="display" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', color: '#0A0A0A', marginBottom: '0.75rem' }}>
                      {exp.destination.toUpperCase()}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      {exp.description.slice(0, 100)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #EBEBEB' }}>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>
                          {exp.duration}
                        </span>
                        <span className="mono" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', fontWeight: 700 }}>
                          {exp.spots} participantes
                        </span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF7B00', fontSize: '0.82rem', fontWeight: 700 }}>
                        Ver galeria <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {modal && <Modal exp={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </main>
  )
}