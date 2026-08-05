import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  ChevronDown, Tent, Wrench, MapPinned, UtensilsCrossed, ShieldCheck, Users, ImageOff, ArrowRight, Check, Phone,
} from 'lucide-react'
import TrailLine from '../components/TrailLine'
import Lightbox from '../components/LightBox'
import { REGISTRATION_TARGET } from '../config/routes'

/* ────────────────────────────────────────────────────────────────────
   CONFIGURAÇÃO DE CONTEÚDO
──────────────────────────────────────────────────────────────────── */
const FORMULARIO_IMAGE_ROOT = '/images/Formulario'
const HERO_IMAGE = `${FORMULARIO_IMAGE_ROOT}/CamposFormulario.png`
const USINA_WHITE_LOGO = `${FORMULARIO_IMAGE_ROOT}/logo%20usina%201000px%20x%201000px.png`

const GALERIA_INSTAGRAM = [
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem1.jpeg`, alt: 'Roteiro da expedição — dia 1' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem2.jpeg`, alt: 'Roteiro da expedição — dia 2' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem3.jpeg`, alt: 'Estrutura de apoio' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem4.jpeg`, alt: 'Hospedagem' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem5.jpeg`, alt: 'Trilhas e paisagens' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem6.jpeg`, alt: 'O que levar' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem7.jpeg`, alt: 'Regras de segurança' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem8.jpeg`, alt: 'Edição anterior' },
]

const INCLUSOS = [
  { icon: Tent, titulo: 'Hospedagem na serra', desc: 'Pousada reservada para todo o grupo durante os dias de expedição.' },
  { icon: Wrench, titulo: 'Apoio mecânico', desc: 'Equipe técnica acompanhando o comboio, pronta pra qualquer imprevisto.' },
  { icon: MapPinned, titulo: 'Roteiro guiado', desc: 'Trilhas selecionadas e sinalizadas, com guias que conhecem o terreno.' },
  { icon: UtensilsCrossed, titulo: 'Refeições nos dias de trilha', desc: 'Você foca em pilotar — a logística de comida a gente resolve.' },
  { icon: ShieldCheck, titulo: 'Suporte e segurança', desc: 'Equipe de resgate e protocolo de segurança em todo o percurso.' },
  { icon: Users, titulo: 'Grupo fechado', desc: 'Turma limitada, pensada pra criar uma experiência coletiva de verdade.' },
]

/* ── Roteiro dia a dia ──────────────────────────────────────────── */
const ROTEIRO = [
  {
    dia: 'Dia 1',
    data: 'Sexta-feira',
    titulo: 'Chegada e abertura',
    imagem: `${FORMULARIO_IMAGE_ROOT}/imagensRoteiro/imagem3.png`,
    atividades: [
      'Check-in no evento e no hotel em Campos do Jordão',
      'Jantar de abertura e reunião com participantes',
      'Resenha no centro de Campos do Jordão',
      'Chocolate quente',
    ],
  },
  {
    dia: 'Dia 2',
    data: 'Sábado',
    titulo: 'Roteiro off-road',
    imagem: `${FORMULARIO_IMAGE_ROOT}/imagensRoteiro/imagem2.png`,
    atividades: [
      'Café da manhã',
      'Cachoeiras, trilhas e estradas de terra',
      'Percurso guiado até Minas Gerais',
      'Visita à fazenda de morangos e colheita de morango',
      'Almoço na fazenda',
      'Jantar especial no centro de Campos do Jordão',
    ],
  },
  {
    dia: 'Dia 3',
    data: 'Domingo',
    titulo: 'Pico do Itapeva e fábrica de chocolate',
    imagem: `${FORMULARIO_IMAGE_ROOT}/imagensRoteiro/imagem1.png`,
    atividades: [
      'Café da manhã no Pico do Itapeva — ponto mais alto da região (2.030m)',
      'Almoço na fábrica de chocolate',
    ],
  },
]

/* ── Grid de fotos da expedição (3x2) ───────────────────────────── */
const FOTOS_EXPEDICAO = [
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem1.jpeg`, alt: 'Fachada do hotel em Campos do Jordão' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem2.jpeg`, alt: 'Quadriciclos alinhados antes da trilha' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem3.jpeg`, alt: 'Grupo no trajeto off-road' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem4.jpeg`, alt: 'Fábrica de chocolate' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem5.jpeg`, alt: 'Trilha entre a neblina da serra' },
  { src: `${FORMULARIO_IMAGE_ROOT}/Carrosel/imagem6.jpeg`, alt: 'Comboio de quadriciclos em movimento' },
]

/* ── Variantes de animação reutilizáveis ─────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

/* ── Imagem com fallback ── */
function ImagemComFallback({
  src, alt, aspectRatio = '4 / 5',
}: { src: string; alt: string; aspectRatio?: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div style={{ width: '100%', aspectRatio, position: 'relative', overflow: 'hidden', background: '#F0F0EE', borderRadius: '1.25rem' }}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '1.25rem' }}
        />
      ) : (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.75rem', background: 'linear-gradient(155deg, #171717 0%, #0A0A0A 100%)',
            border: '1.5px dashed rgba(255,123,0,0.35)', borderRadius: '1.25rem', color: 'rgba(255,255,255,0.4)', padding: '1.5rem', textAlign: 'center',
          }}
        >
          <ImageOff size={22} style={{ color: '#FF7B00', opacity: 0.7 }} />
          <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', lineHeight: 1.6 }}>
            {alt}<br />(substitua por {src.split('/').pop()})
          </span>
        </div>
      )}
    </div>
  )
}

/* ── PostCard ── */
function PostCard({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const [failed, setFailed] = useState(false)

  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: '0 0 auto', width: 'clamp(210px, 24vw, 270px)', aspectRatio: '4 / 5',
        border: 'none', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        background: '#F0F0EE', scrollSnapAlign: 'start',
      }}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        />
      ) : (
        <div
          style={{
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '0.75rem', background: 'linear-gradient(155deg, #171717 0%, #0A0A0A 100%)',
            border: '1.5px dashed rgba(255,123,0,0.35)', color: 'rgba(255,255,255,0.4)', padding: '1.5rem', textAlign: 'center',
          }}
        >
          <ImageOff size={22} style={{ color: '#FF7B00', opacity: 0.7 }} />
          <span className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', lineHeight: 1.6 }}>
            {alt}<br />(substitua por {src.split('/').pop()})
          </span>
        </div>
      )}
      <div
        style={{
          position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)',
          display: 'flex', alignItems: 'flex-end', padding: '1rem', opacity: 0,
          transition: 'opacity 0.25s',
        }}
        className="post-card-overlay"
      >
        <span className="mono" style={{ color: '#fff', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
          Ampliar
        </span>
      </div>
    </motion.button>
  )
}

/* ── DiaCard ── */
function DiaCard({ dia, invertido }: { dia: typeof ROTEIRO[number]; invertido: boolean }) {
  return (
    <motion.div
      initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer}
      className="roteiro-card-mobile"
      style={{
        display: 'flex', flexDirection: invertido ? 'row-reverse' : 'row', flexWrap: 'wrap',
        alignItems: 'center', gap: 'clamp(2rem, 5vw, 4rem)', paddingTop: 'clamp(3rem, 6vh, 5rem)',
        paddingBottom: 'clamp(3rem, 6vh, 5rem)',
      }}
    >
      <motion.div variants={fadeUp} style={{ flex: '1.15 1 400px', minWidth: '300px', maxWidth: '560px' }}>
        <ImagemComFallback src={dia.imagem} alt={`Imagem de referência — ${dia.titulo}`} aspectRatio="4 / 3" />
      </motion.div>

      <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'baseline', gap: '0.9rem', marginBottom: '1.25rem' }}>
          <span className="display" style={{ fontSize: 'clamp(2.4rem, 5.5vw, 3.4rem)', color: '#FF7B00', lineHeight: 1 }}>
            {dia.dia}
          </span>
          <span className="mono" style={{ fontSize: 'clamp(0.95rem, 1.9vw, 1.15rem)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#888' }}>
            {dia.data}
          </span>
        </motion.div>
        <motion.h3
          variants={fadeUp}
          className="display" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', color: '#0A0A0A', marginBottom: '1.5rem' }}
        >
          {dia.titulo}
        </motion.h3>
        <motion.ul variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {dia.atividades.map(atividade => (
            <motion.li
              key={atividade} variants={fadeUp}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1.02rem', color: '#444', lineHeight: 1.65 }}
            >
              <span
                style={{
                  flexShrink: 0, width: '1.35rem', height: '1.35rem', borderRadius: '50%', background: 'rgba(255,123,0,0.1)',
                  color: '#FF7B00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.1rem',
                }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              {atividade}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  )
}

export default function ExpedicaoLanding() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [fotosLightboxIndex, setFotosLightboxIndex] = useState<number | null>(null)

  return (
    <div style={{ background: '#fff' }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', minHeight: 'max(100svh, 760px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0A0A0A',
          padding: 'clamp(8rem, 15vh, 10rem) 0 clamp(7.5rem, 14vh, 9rem)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={HERO_IMAGE} alt="Campos do Jordão" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.55) 40%, rgba(10,10,10,0.97) 100%)' }} />
        </div>

        <div className="wrap" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <motion.span
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mono" style={{ color: '#FF7B00', fontSize: 'clamp(0.85rem, 1.6vw, 1.1rem)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '1.25rem' }}
          >
            Expedição Off-Road · 2026
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="display" style={{ color: '#fff', fontSize: 'clamp(3rem, 7.6vw, 6.5rem)', marginBottom: '1.5rem', lineHeight: 0.98, maxWidth: '100%' }}
          >
            CAMPOS DO<br />JORDÃO
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.35 }}
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', maxWidth: '540px', lineHeight: 1.7, marginBottom: '2rem' }}
          >
            Oito dias de UTV e quadriciclo entre serra, neblina e trilha técnica.
            Uma expedição fechada, com apoio total, pra quem quer sentir a estrada de verdade.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <Link to={REGISTRATION_TARGET} className="btn-primary" style={{ padding: '1.15rem 2.75rem', fontSize: '0.78rem' }}>
              Quero minha vaga <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.65 }}
            className="mono" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.76rem, 1.4vw, 0.9rem)', fontWeight: 700, letterSpacing: '0.12em', marginTop: '1.25rem' }}
          >
            21–23 de Agosto · Saída de São Paulo
          </motion.p>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: 'clamp(1.25rem, 3vh, 2rem)', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)' }}
        >
          <span className="mono" style={{ fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Role para conhecer</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      <TrailLine>

        {/* ── SOBRE A EXPEDIÇÃO ──────────────── */}
        <section className="section" style={{ paddingBottom: 'clamp(2.5rem, 5vh, 4rem)' }}>
          <div className="wrap wrap-mobile-pad" style={{ maxWidth: '880px', marginLeft: 'clamp(0px, 8vw, 120px)' }}>
            <motion.span initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="eyebrow" style={{ marginBottom: '1rem' }}>
              A Expedição
            </motion.span>

            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="display" style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#0A0A0A', marginBottom: '1.5rem' }}
            >
              Motor ligado, serra à frente.
            </motion.h2>

            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)', color: '#555', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '640px' }}
            >
              De 21 a 23 de agosto, a Usina do Jet leva um grupo fechado de pilotos pelas trilhas de
              Campos do Jordão. Apoio total da equipe, hospedagem resolvida, e um roteiro desenhado
              pra testar sua máquina sem testar sua paciência. Veja abaixo como fica cada dia.
            </motion.p>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={staggerContainer}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', borderTop: '1px solid #EBEBEB', paddingTop: '2rem' }}
            >
              {[
                { n: '3', l: 'Dias de expedição' },
                { n: '21–23', l: 'Agosto de 2026' },
                { n: 'Limitadas', l: 'Vagas disponíveis' },
              ].map(stat => (
                <motion.div key={stat.l} variants={fadeUp}>
                  <p className="display" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#FF7B00', marginBottom: '0.35rem' }}>{stat.n}</p>
                  <p className="mono" style={{ fontSize: 'clamp(0.78rem, 1.4vw, 0.92rem)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#888' }}>{stat.l}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── ROTEIRO DIA A DIA ────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap wrap-mobile-pad" style={{ marginLeft: 'clamp(0px, 8vw, 120px)' }}>
            <motion.span initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="eyebrow" style={{ marginBottom: '1rem' }}>
              O roteiro
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="display" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: '#0A0A0A', marginBottom: '3rem', maxWidth: '640px' }}
            >
              Três dias, cada um com o seu próprio ritmo.
            </motion.h2>

            <div style={{ borderTop: '1px solid #EBEBEB' }}>
              {ROTEIRO.map((dia, i) => (
                <div key={dia.dia} style={{ borderBottom: '1px solid #EBEBEB' }}>
                  <DiaCard dia={dia} invertido={i % 2 === 1} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALERIA DO INSTAGRAM ────────────────────────────── */}
        <section className="section" style={{ background: '#F7F7F5' }}>
          <div className="wrap wrap-mobile-pad" style={{ marginLeft: 'clamp(0px, 8vw, 120px)' }}>
            <motion.span initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="eyebrow" style={{ marginBottom: '1rem' }}>
              No Instagram
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="display" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: '#0A0A0A', marginBottom: '0.75rem' }}
            >
              Tudo o que rola por lá
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              style={{ fontSize: '1rem', color: '#777', marginBottom: '2.5rem', maxWidth: '520px' }}
            >
              Os cards abaixo já foram postados no nosso Instagram com todos os detalhes. Clique em qualquer um pra ampliar e ler.
            </motion.p>
          </div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}
            className="no-scrollbar reset-margin-mobile"
            style={{
              display: 'flex', gap: '1.25rem', overflowX: 'auto', scrollSnapType: 'x mandatory',
              padding: '0 clamp(1.5rem, 5vw, 7rem) 0.5rem', marginLeft: 'clamp(0px, 8vw, 120px)',
            }}
          >
            {GALERIA_INSTAGRAM.map((img, i) => (
              <PostCard key={img.src} src={img.src} alt={img.alt} onClick={() => setLightboxIndex(i)} />
            ))}
          </motion.div>
        </section>

        {/* ── O QUE ESTÁ INCLUSO ──────────────────────────────── */}
        <section className="section">
          <div className="wrap wrap-mobile-pad" style={{ marginLeft: 'clamp(0px, 8vw, 120px)' }}>
            <motion.span initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="eyebrow" style={{ marginBottom: '1rem' }}>
              O que está incluso
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="display" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: '#0A0A0A', marginBottom: '2.5rem' }}
            >
              Você foca na trilha. O resto é com a gente.
            </motion.h2>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerContainer}
              className="grid-inclusos-mobile"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}
            >
              {INCLUSOS.map(item => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.titulo} variants={fadeUp}
                    style={{ border: '1px solid #EBEBEB', padding: '2rem', background: '#fff' }}
                  >
                    <div style={{ width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,123,0,0.08)', color: '#FF7B00', marginBottom: '1.25rem' }}>
                      <Icon size={20} />
                    </div>
                    <p className="display" style={{ fontSize: '1.05rem', color: '#0A0A0A', marginBottom: '0.6rem' }}>{item.titulo}</p>
                    <p style={{ fontSize: '0.88rem', color: '#777', lineHeight: 1.7 }}>{item.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

      </TrailLine>

      {/* ── LOCAÇÃO DE VEÍCULOS ──────────────────────────────── */}
      <section style={{ background: '#0A0A0A', padding: 'clamp(5rem, 11vh, 8rem) 0', position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', top: '-20%', right: '-10%', width: '55%', aspectRatio: '1 / 1', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,123,0,0.14) 0%, transparent 70%)', pointerEvents: 'none',
          }}
        />
        <div className="wrap wrap-mobile-pad" style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(2.5rem, 6vw, 5rem)' }}>
          <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
            <motion.span initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="eyebrow" style={{ marginBottom: '1rem' }}>
              Locação de veículos
            </motion.span>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              className="display" style={{ fontSize: 'clamp(2rem, 4.8vw, 3.2rem)', color: '#fff', marginBottom: '1.5rem', maxWidth: '520px' }}
            >
              Não tem UTV ou quadriciclo? A gente resolve.
            </motion.h2>
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.85, marginBottom: '2.25rem', maxWidth: '480px' }}
            >
              Locação de quadriciclos e UTVs disponível pra quem não possui veículo próprio.
              Fale com a gente pelo WhatsApp e consulte valores e disponibilidade — a locação
              é à parte do pacote da expedição.
            </motion.p>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
              <a
                href="https://wa.me/5511964467000"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '1.1rem 2.5rem', fontSize: '0.78rem' }}
              >
                <Phone size={16} /> Consultar no WhatsApp
              </a>
            </motion.div>
          </div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={staggerContainer}
            style={{
              flex: '1 1 300px', minWidth: '260px', border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.035)', padding: 'clamp(2rem, 4vw, 2.75rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            }}
          >
            {[
              'Quadriciclos e UTVs disponíveis para a expedição',
              'Ideal pra quem não possui veículo próprio',
              'Consulte valores pelo WhatsApp: +55 11 96446-7000',
            ].map(linha => (
              <motion.div key={linha} variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <span
                  style={{
                    flexShrink: 0, width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: 'rgba(255,123,0,0.14)',
                    color: '#FF7B00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.1rem',
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem', lineHeight: 1.6 }}>{linha}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', padding: 'clamp(5rem, 12vh, 9rem) 0' }}>
        <div className="wrap wrap-mobile-pad" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
            className="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', color: '#fff', marginBottom: '1.25rem' }}
          >
            Bora pra Campos?
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '2.5rem', lineHeight: 1.7 }}
          >
            Vagas limitadas para a expedição de agosto em Campos do Jordão. Garanta a sua antes que a turma feche.
          </motion.p>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
            <Link to={REGISTRATION_TARGET} className="btn-primary" style={{ padding: '1.15rem 2.75rem', fontSize: '0.78rem' }}>
              Quero minha vaga <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem 0' }}>
        <div className="wrap wrap-mobile-pad" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <img src={USINA_WHITE_LOGO} alt="Usina do Jet" style={{ height: '2.25rem', width: 'auto', objectFit: 'contain' }} />
          <p className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)' }}>
            © 2026 Usina do Jet. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <Lightbox
        images={GALERIA_INSTAGRAM}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      <Lightbox
        images={FOTOS_EXPEDICAO}
        index={fotosLightboxIndex}
        onClose={() => setFotosLightboxIndex(null)}
        onNavigate={setFotosLightboxIndex}
      />
    </div>
  )
}
