import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from 'lucide-react'
import { patrocinadores, type Patrocinador } from '../data/patrocinadores'
import BrandIntro from '../components/BrandIntro'
import HeroMedia from '../components/HeroMedia'

const EXPEDITION_PATH = '/expedicoes/campos-do-jordao-2026'

const destinations = [
  {
    name: 'Angra dos Reis',
    state: 'Rio de Janeiro',
    edition: 'Expedição 01',
    image: '/images/image1.png',
  },
  {
    name: 'Capitólio',
    state: 'Minas Gerais',
    edition: 'Expedição 02',
    image: '/images/image2.png',
  },
  {
    name: 'São Sebastião',
    state: 'São Paulo',
    edition: 'Expedição 03',
    image: '/images/image3.png',
  },
]

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  style?: CSSProperties
}

function Reveal({ children, className = '', delay = 0, style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: '-64px' })
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 38, filter: 'blur(5px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: reduceMotion ? 0 : 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

function SmartImage({ src, alt, className = '', eager = false }: SmartImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (failed) {
    return (
      <div className={`media-fallback ${className}`} role="img" aria-label={alt}>
        <ImageOff aria-hidden="true" size={28} />
        <span>Imagem em preparação</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      fetchPriority={eager ? 'high' : 'auto'}
      onError={() => setFailed(true)}
    />
  )
}

const manifestoMetrics = [
  { value: '03', label: 'Expedições realizadas' },
  { value: '2018', label: 'O início da nossa história' },
  { value: '100%', label: 'Experiência acompanhada' },
]

function AnimatedMetric({ value, label, index }: { value: string; label: string; index: number }) {
  const ref = useRef<HTMLElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const reduceMotion = useReducedMotion()

  return (
    <div className="manifesto-stat">
      <strong ref={ref} className="display" aria-label={value}>
        {Array.from(value).map((character, characterIndex) => (
          <span className="manifesto-digit-mask" aria-hidden="true" key={`${character}-${characterIndex}`}>
            <motion.span
              initial={reduceMotion ? false : { y: '110%', opacity: 0 }}
              animate={isInView ? { y: '0%', opacity: 1 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 0.72,
                delay: reduceMotion ? 0 : index * 0.1 + characterIndex * 0.055,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {character}
            </motion.span>
          </span>
        ))}
      </strong>
      <span>{label}</span>
    </div>
  )
}

function ManifestoSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const sectionInView = useInView(sectionRef, { once: true, margin: '-90px' })
  const contentInView = useInView(contentRef, { once: true, margin: '-100px' })
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.35,
  })
  const imageScale = useTransform(smoothProgress, [0, 0.55, 1], [1.1, 1.035, 1])
  const imageY = useTransform(smoothProgress, [0, 1], ['-4%', '4%'])
  const wakeProgress = useTransform(smoothProgress, [0.16, 0.78], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="manifesto-section"
      aria-labelledby="manifesto-title"
    >
      <div className="wrap manifesto-grid">
        <motion.div
          className="manifesto-media"
          initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
          animate={sectionInView ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
          transition={{ duration: reduceMotion ? 0 : 1.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="manifesto-image-motion"
            style={{
              scale: reduceMotion ? 1 : imageScale,
              y: reduceMotion ? 0 : imageY,
            }}
          >
            <SmartImage
              src="/images/image4.png"
              alt="Participantes da Usina do Jet durante uma expedição"
            />
          </motion.div>
          <div className="manifesto-media-shade" aria-hidden="true" />
          <motion.span
            className="manifesto-wake"
            aria-hidden="true"
            style={{ scaleX: reduceMotion ? 1 : wakeProgress }}
          />
          <span className="manifesto-index mono">01 — Nossa história</span>
          <span className="manifesto-signature mono" aria-hidden="true">
            Brasil · Desde 2018
          </span>
        </motion.div>

        <div ref={contentRef} className="manifesto-content">
          <motion.span
            className="eyebrow"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={contentInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduceMotion ? 0 : 0.58 }}
          >
            Sobre a Usina do Jet
          </motion.span>

          <h2 id="manifesto-title" className="display section-title manifesto-title">
            {['Criamos histórias', 'em movimento.'].map((line, index) => (
              <span className="manifesto-title-mask" key={line}>
                <motion.span
                  initial={reduceMotion ? false : { y: '108%' }}
                  animate={contentInView ? { y: '0%' } : undefined}
                  transition={{
                    duration: reduceMotion ? 0 : 0.88,
                    delay: reduceMotion ? 0 : 0.12 + index * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={contentInView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.72,
              delay: reduceMotion ? 0 : 0.38,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className="section-copy manifesto-copy">
              Desde 2018, reunimos pessoas movidas pela descoberta. Cada expedição nasce do cuidado com o roteiro, da estrutura de apoio e da vontade de viver a paisagem de um jeito mais intenso.
            </p>
            <Link to="/expedicoes" className="text-link">
              Conheça nossas experiências <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </motion.div>

          <div className="manifesto-stats">
            {manifestoMetrics.map((metric, index) => (
              <AnimatedMetric
                key={metric.label}
                value={metric.value}
                label={metric.label}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface SponsorSlot {
  sponsor: Patrocinador
  revision: number
}

function SponsorRail() {
  const reduceMotion = useReducedMotion()
  const activeSponsors = useMemo(
    () => patrocinadores.filter((sponsor: Patrocinador) => sponsor.ativo),
    [],
  )
  const [slots, setSlots] = useState<SponsorSlot[]>([])
  const [paused, setPaused] = useState(false)
  const nextSponsorRef = useRef(4)
  const nextSlotRef = useRef(0)

  useEffect(() => {
    setSlots(
      activeSponsors
        .slice(0, 4)
        .map((sponsor, index) => ({ sponsor, revision: index })),
    )
    nextSponsorRef.current = Math.min(4, activeSponsors.length)
    nextSlotRef.current = 0
  }, [activeSponsors])

  useEffect(() => {
    if (reduceMotion || paused || activeSponsors.length <= 4 || slots.length === 0) return

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return

      setSlots((currentSlots) => {
        if (currentSlots.length === 0) return currentSlots

        const updatedSlots = [...currentSlots]
        const slotIndex = nextSlotRef.current % updatedSlots.length
        const sponsorIndex = nextSponsorRef.current % activeSponsors.length

        updatedSlots[slotIndex] = {
          sponsor: activeSponsors[sponsorIndex],
          revision: updatedSlots[slotIndex].revision + activeSponsors.length,
        }

        nextSlotRef.current = (slotIndex + 1) % updatedSlots.length
        nextSponsorRef.current = (sponsorIndex + 1) % activeSponsors.length
        return updatedSlots
      })
    }, 3200)

    return () => window.clearInterval(intervalId)
  }, [activeSponsors, paused, reduceMotion, slots.length])

  if (activeSponsors.length === 0) return null

  return (
    <section
      className="sponsor-section"
      aria-labelledby="sponsor-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="wrap sponsor-layout">
        <div className="sponsor-heading">
          <span className="signature-line" aria-hidden="true" />
          <h2 id="sponsor-title">Marcas que navegam com a gente</h2>
        </div>

        <div className="sponsor-grid">
          {slots.map((slot, index) => (
            <div className={`sponsor-slot sponsor-slot-${index + 1}`} key={index}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.a
                  key={`${slot.sponsor.id}-${slot.revision}`}
                  href={slot.sponsor.link}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="sponsor-link"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                  aria-label={`Conhecer ${slot.sponsor.nome}`}
                >
                  {slot.sponsor.logo ? (
                    <img src={slot.sponsor.logo} alt={slot.sponsor.nome} loading="lazy" />
                  ) : (
                    <span>{slot.sponsor.nome}</span>
                  )}
                </motion.a>
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DestinationGallery() {
  const reduceMotion = useReducedMotion()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const selectDestination = useCallback((index: number) => {
    const total = destinations.length
    setCurrent(((index % total) + total) % total)
  }, [])

  useEffect(() => {
    if (reduceMotion || paused) return

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setCurrent((value) => (value + 1) % destinations.length)
      }
    }, 7000)

    return () => window.clearInterval(intervalId)
  }, [paused, reduceMotion])

  return (
    <section className="gallery-section" aria-labelledby="gallery-title">
      <div className="wrap gallery-heading">
        <Reveal>
          <span className="eyebrow">Destinos</span>
          <h2 id="gallery-title" className="display section-title">
            Histórias que começam pelo caminho.
          </h2>
        </Reveal>
        <Reveal className="gallery-intro" delay={0.08}>
          <img
            className="gallery-mark"
            src="/images/Usina-logo-Preto.png"
            alt=""
            aria-hidden="true"
          />
          <p className="section-copy">
            Três expedições, diferentes paisagens e a mesma vontade de descobrir o Brasil de um jeito que poucos conhecem.
          </p>
        </Reveal>
      </div>

      <div
        className="gallery-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {destinations.map((destination, index) => (
          <motion.div
            key={destination.image}
            className="gallery-slide"
            initial={false}
            animate={{
              opacity: index === current ? 1 : 0,
              scale: index === current ? 1 : 1.025,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ zIndex: index === current ? 2 : 1, pointerEvents: index === current ? 'auto' : 'none' }}
            drag={index === current && !reduceMotion ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) selectDestination(current + 1)
              if (info.offset.x > 60) selectDestination(current - 1)
            }}
          >
            <SmartImage
              src={destination.image}
              alt={`${destination.name}, ${destination.state}`}
              className="gallery-image"
              eager
            />
            <div className="gallery-shade" aria-hidden="true" />
            <motion.div
              className="wrap gallery-caption"
              animate={{ opacity: index === current ? 1 : 0, y: index === current ? 0 : 18 }}
              transition={{ duration: reduceMotion ? 0 : 0.6, delay: index === current ? 0.22 : 0 }}
            >
              <p className="mono gallery-edition">{destination.edition}</p>
              <h3 className="display">{destination.name}</h3>
              <p>{destination.state}</p>
            </motion.div>
          </motion.div>
        ))}

        <button
          type="button"
          className="gallery-arrow gallery-arrow-left"
          onClick={() => selectDestination(current - 1)}
          aria-label="Mostrar destino anterior"
        >
          <ChevronLeft aria-hidden="true" size={24} />
        </button>
        <button
          type="button"
          className="gallery-arrow gallery-arrow-right"
          onClick={() => selectDestination(current + 1)}
          aria-label="Mostrar próximo destino"
        >
          <ChevronRight aria-hidden="true" size={24} />
        </button>

        <div className="wrap gallery-navigation" aria-label="Selecionar destino">
          {destinations.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={index === current ? 'is-active' : ''}
              onClick={() => selectDestination(index)}
              aria-current={index === current ? 'true' : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.name}
            </button>
          ))}
        </div>

        {!reduceMotion && !paused && (
          <div className="gallery-timer" aria-hidden="true">
            <motion.span
              key={current}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 7, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </section>
  )
}

interface CountdownValue {
  days: number
  hours: number
  minutes: number
  status: 'upcoming' | 'ongoing' | 'finished'
}

function calculateCountdown(start: string, end: string): CountdownValue {
  const now = Date.now()
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return { days: 0, hours: 0, minutes: 0, status: 'finished' }
  }

  if (now >= endTime) return { days: 0, hours: 0, minutes: 0, status: 'finished' }
  if (now >= startTime) return { days: 0, hours: 0, minutes: 0, status: 'ongoing' }

  const totalMinutes = Math.max(0, Math.ceil((startTime - now) / 60_000))
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    status: 'upcoming',
  }
}

function Countdown({ start, end }: { start: string; end: string }) {
  const [countdown, setCountdown] = useState(() => calculateCountdown(start, end))

  useEffect(() => {
    setCountdown(calculateCountdown(start, end))
    const intervalId = window.setInterval(
      () => setCountdown(calculateCountdown(start, end)),
      30_000,
    )
    return () => window.clearInterval(intervalId)
  }, [end, start])

  if (countdown.status !== 'upcoming') {
    return (
      <p className="countdown-status">
        {countdown.status === 'ongoing' ? 'A expedição está acontecendo' : 'Inscrições encerradas'}
      </p>
    )
  }

  const units = [
    { value: countdown.days, label: 'Dias' },
    { value: countdown.hours, label: 'Horas' },
    { value: countdown.minutes, label: 'Minutos' },
  ]

  return (
    <div
      className="countdown"
      role="timer"
      aria-live="off"
      aria-label={`Faltam ${countdown.days} dias, ${countdown.hours} horas e ${countdown.minutes} minutos`}
    >
      {units.map((unit) => (
        <div className="countdown-unit" key={unit.label}>
          <span className="display">{String(unit.value).padStart(2, '0')}</span>
          <small>{unit.label}</small>
        </div>
      ))}
    </div>
  )
}

interface HomeProps {
  introActive?: boolean
  heroContentVisible?: boolean
  onIntroContentReveal?: () => void
  onIntroComplete?: () => void
}

const noop = () => undefined

export default function Home({
  introActive = false,
  heroContentVisible = true,
  onIntroContentReveal = noop,
  onIntroComplete = noop,
}: HomeProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0])
  const symbolY = useTransform(scrollYProgress, [0, 1], [0, -16])

  return (
    <div className="home-page">
      <AnimatePresence>
        {introActive && (
          <BrandIntro
            key="brand-intro"
            onContentReveal={onIntroContentReveal}
            onComplete={onIntroComplete}
          />
        )}
      </AnimatePresence>

      <section ref={heroRef} className="home-hero" aria-labelledby="home-title">
        <motion.div className="hero-media" style={{ y: reduceMotion ? 0 : mediaY }}>
          <HeroMedia
            videoSrc="/images/video-fundo.mp4"
            posterSrc="/images/hero-bg.png"
            posterAlt="Expedição da Usina do Jet em uma paisagem brasileira"
          />
        </motion.div>
        <div className="hero-overlay" aria-hidden="true" />

        <motion.div
          className="wrap hero-content"
          style={{
            y: reduceMotion ? 0 : contentY,
            opacity: reduceMotion ? 1 : contentOpacity,
          }}
        >
          <div className="hero-layout">
            <div className="hero-copy-column">
              <motion.div
                className="hero-kicker"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={heroContentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.08 }}
              >
                <span className="mono">Expedições pelo Brasil · Desde 2018</span>
              </motion.div>

              <h1 id="home-title" className="display hero-title">
                {['O Brasil visto', 'de outro ângulo.'].map((line, index) => (
                  <span className="hero-title-mask" key={line}>
                    <motion.span
                      initial={reduceMotion ? false : { y: '105%' }}
                      animate={{ y: heroContentVisible ? 0 : '105%' }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.9,
                        delay: reduceMotion ? 0 : 0.16 + index * 0.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.div
                className="hero-wake"
                aria-hidden="true"
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: heroContentVisible ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.p
                className="hero-copy"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={heroContentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.48 }}
              >
                Onde a velocidade encontra a natureza.
              </motion.p>

              <motion.div
                className="hero-actions"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={heroContentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.58 }}
              >
                <Link to={EXPEDITION_PATH} className="btn-primary">
                  Conhecer a próxima expedição <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
                <Link to="/expedicoes" className="btn-ghost-light">
                  Ver todas as expedições <ArrowRight aria-hidden="true" size={18} />
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="hero-symbol"
              style={{ y: reduceMotion ? 0 : symbolY }}
              initial={reduceMotion ? false : { opacity: 0, x: 28, clipPath: 'inset(0 100% 0 0)' }}
              animate={heroContentVisible
                ? { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }
                : { opacity: 0, x: 28, clipPath: 'inset(0 100% 0 0)' }}
              transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <img src="/images/Usina-logo-Preto.png" alt="Usina do Jet" />
              <motion.span
                className="hero-symbol-shine"
                aria-hidden="true"
                initial={reduceMotion ? false : { opacity: 0, backgroundPosition: '-180% 0' }}
                animate={reduceMotion || !heroContentVisible
                  ? { opacity: 0 }
                  : { opacity: [0, 0.9, 0], backgroundPosition: '180% 0' }}
                transition={{ duration: 0.95, delay: 1.05, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="hero-scroll"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: heroContentVisible ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.72 }}
        >
          <span />
          <small className="mono">Explore</small>
        </motion.div>
      </section>

      <ManifestoSection />

      <SponsorRail />
      <DestinationGallery />

      <section className="next-section" aria-labelledby="next-title">
        <div className="wrap">
          <Reveal className="next-heading">
            <div>
              <span className="eyebrow">Próxima experiência</span>
              <h2 id="next-title" className="display section-title">
                Campos do Jordão
              </h2>
            </div>
            <p className="section-copy">
              Três dias de serra, trilhas e paisagens marcantes, com roteiro guiado e suporte da equipe do início ao fim.
            </p>
          </Reveal>

          <Reveal className="expedition-feature" delay={0.08}>
            <motion.div
              className="expedition-media"
              initial={reduceMotion ? false : { opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={EXPEDITION_PATH}
                className="expedition-media-link"
                aria-label="Conhecer a expedição Campos do Jordão"
              >
                <SmartImage
                  src="/images/Expedição4.jpeg"
                  alt="Expedição em Campos do Jordão"
                />
                <span className="expedition-badge">
                  <i aria-hidden="true" /> Vagas abertas
                </span>
                <span className="expedition-location">
                  <strong>Campos do Jordão</strong>
                  <small>Serra da Mantiqueira · São Paulo</small>
                </span>
              </Link>
            </motion.div>

            <motion.div
              className="expedition-panel"
              initial={reduceMotion ? false : { opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <p className="mono expedition-date">21–23 de agosto de 2026</p>
                <h3>A expedição começa em</h3>
                <Countdown
                  start="2026-08-21T08:00:00-03:00"
                  end="2026-08-23T20:00:00-03:00"
                />
              </div>

              <dl className="expedition-facts">
                <div>
                  <dt>Duração</dt>
                  <dd>3 dias</dd>
                </div>
                <div>
                  <dt>Disponibilidade</dt>
                  <dd>7 vagas</dd>
                </div>
                <div>
                  <dt>Investimento</dt>
                  <dd>R$ 3.800</dd>
                </div>
              </dl>

              <Link to={EXPEDITION_PATH} className="btn-dark expedition-cta">
                Ver roteiro completo <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="cta-title">
        <div className="home-cta-word display" aria-hidden="true">BRASIL</div>
        <div className="wrap home-cta-content">
          <Reveal>
            <span className="eyebrow">Sua próxima história</span>
            <h2 id="cta-title" className="display">
              Há caminhos que só aparecem para quem decide ir.
            </h2>
            <p>Conheça os detalhes da próxima expedição e descubra se essa experiência é para você.</p>
            <Link to={EXPEDITION_PATH} className="btn-primary">
              Conhecer a expedição <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
