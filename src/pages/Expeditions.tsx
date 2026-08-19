import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Images,
  MapPin,
  Users,
  X,
} from 'lucide-react'
import './Expeditions.css'

interface Expedition {
  id: string
  sequenceLabel: string
  destination: string
  shortDestination: string
  state: string
  dateLabel: string
  duration: string
  spots: number
  description: string
  coverImage: string
  galleryImages: string[]
}

interface HeroSlide {
  image: string
  expedition: string
  location: string
  year: string
  position?: string
}

interface CountdownValue {
  days: number
  hours: number
  minutes: number
  ended: boolean
}

const HERO_AUTOPLAY_DURATION = 6_800

const UPCOMING_EXPEDITION = {
  destination: 'Campos do Jordão',
  date: '21–23 de agosto de 2026',
  countdownDate: '2026-08-21T08:00:00-03:00',
  duration: '3 dias',
  availability: '7 vagas',
  price: 'R$ 3.800',
  image: '/images/Expedi%C3%A7%C3%A3o4.jpeg',
  detailsPath: '/expedicoes/campos-do-jordao-2026',
  registrationPath: '/expedicoes/campos-do-jordao-2026/inscricao',
}

const EXPEDITIONS: Expedition[] = [
  {
    id: 'angra-paraty',
    sequenceLabel: 'Primeira expedição',
    destination: 'Angra dos Reis × Paraty',
    shortDestination: 'Angra × Paraty',
    state: 'Rio de Janeiro',
    dateLabel: '2026',
    duration: '4 dias · 3 noites',
    spots: 14,
    description:
      'Enseadas, ilhas e a travessia até as águas históricas de Paraty em uma rota acompanhada de ponta a ponta.',
    coverImage: '/images/Angra/CAPA%20ANGRA.webp',
    galleryImages: [
      '/images/Angra/CAPA%20ANGRA.webp',
      '/images/Angra/FOTO%202.webp',
      '/images/Angra/FOTO%203.webp',
      '/images/Angra/FOTO%204.webp',
      '/images/Angra/FOTO%205.webp',
      '/images/Angra/FOTO%206.webp',
      '/images/Angra/FOTO%207.webp',
      '/images/Angra/FOTO%208.webp',
    ],
  },
  {
    id: 'capitolio-2025',
    sequenceLabel: 'Segunda expedição',
    destination: 'Capitólio',
    shortDestination: 'Capitólio',
    state: 'Minas Gerais',
    dateLabel: '2026',
    duration: '8 dias · 7 noites',
    spots: 20,
    description:
      'Os cânions do Lago de Furnas vistos de perto, entre paredões, água verde e muitos quilômetros navegados.',
    coverImage: '/images/Capitolio/capa.webp',
    galleryImages: [
      '/images/Capitolio/capa.webp',
      '/images/Capitolio/FOTO%201.webp',
      '/images/Capitolio/FOTO%202.webp',
      '/images/Capitolio/FOTO%203.webp',
      '/images/Capitolio/FOTO%204.webp',
      '/images/Capitolio/FOTO%205.webp',
      '/images/Capitolio/FOTO%206.webp',
      '/images/Capitolio/FOTO%207.webp',
      '/images/Capitolio/FOTO%208.webp',
    ],
  },
  {
    id: 'sao-sebastiao-ilhabela',
    sequenceLabel: 'Terceira expedição',
    destination: 'São Sebastião × Ilhabela',
    shortDestination: 'São Sebastião',
    state: 'São Paulo',
    dateLabel: '2026',
    duration: '4 dias · 3 noites',
    spots: 16,
    description:
      'Do mar aberto de São Sebastião às enseadas protegidas de Ilhabela, sempre com a equipe por perto.',
    coverImage: '/images/S%C3%A3o-Sebasti%C3%A3o/SAO%20SEBAS%20X%20ILHABELA%20FOTOS%20SITE.webp',
    galleryImages: [
      '/images/S%C3%A3o-Sebasti%C3%A3o/SAO%20SEBAS%20X%20ILHABELA%20FOTOS%20SITE.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%203.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%201.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%202.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%204.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%205.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO6.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%207.webp',
      '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%208.webp',
    ],
  },
]

const HERO_SLIDES: HeroSlide[] = [
  {
    image: '/images/Angra/FOTO%202.webp',
    expedition: 'Angra dos Reis × Paraty',
    location: 'Rio de Janeiro',
    year: '2026',
    position: 'center 44%',
  },
  {
    image: '/images/Capitolio/FOTO%201.webp',
    expedition: 'Capitólio',
    location: 'Minas Gerais',
    year: 'Agosto de 2025',
    position: 'center 48%',
  },
  {
    image: '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%203.webp',
    expedition: 'São Sebastião × Ilhabela',
    location: 'São Paulo',
    year: '2026',
    position: 'center 58%',
  },
  {
    image: '/images/Angra/FOTO%204.webp',
    expedition: 'Angra dos Reis × Paraty',
    location: 'Rio de Janeiro',
    year: '2026',
    position: 'center 48%',
  },
  {
    image: '/images/Capitolio/FOTO%203.webp',
    expedition: 'Capitólio',
    location: 'Minas Gerais',
    year: 'Agosto de 2025',
    position: 'center 48%',
  },
  {
    image: '/images/S%C3%A3o-Sebasti%C3%A3o/FOTO%201.webp',
    expedition: 'São Sebastião × Ilhabela',
    location: 'São Paulo',
    year: '2026',
    position: 'center 46%',
  },
]

function getCountdown(target: string): CountdownValue {
  const difference = new Date(target).getTime() - Date.now()

  if (!Number.isFinite(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, ended: true }
  }

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference % 86_400_000) / 3_600_000),
    minutes: Math.floor((difference % 3_600_000) / 60_000),
    ended: false,
  }
}

function useCountdown(target: string) {
  const [countdown, setCountdown] = useState(() => getCountdown(target))

  useEffect(() => {
    const update = () => setCountdown(getCountdown(target))
    update()
    const timer = window.setInterval(update, 30_000)
    return () => window.clearInterval(timer)
  }, [target])

  return countdown
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reduceMotion ? 0 : 0.82,
        delay: reduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

function MaskedLine({ children, delay }: { children: ReactNode; delay: number }) {
  const reduceMotion = useReducedMotion()

  return (
    <span className="exp-hero-mask-line">
      <motion.span
        initial={reduceMotion ? false : { y: '112%' }}
        animate={{ y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.92,
          delay: reduceMotion ? 0 : delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function ExpeditionHero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const activeSlide = HERO_SLIDES[activeIndex]

  const navigate = useCallback((direction: number) => {
    setActiveIndex((current) => (current + direction + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    if (reduceMotion) return

    const timer = window.setTimeout(() => navigate(1), HERO_AUTOPLAY_DURATION)
    return () => window.clearTimeout(timer)
  }, [activeIndex, navigate, reduceMotion])

  useEffect(() => {
    const nextSlide = HERO_SLIDES[(activeIndex + 1) % HERO_SLIDES.length]
    const preload = new Image()
    preload.src = nextSlide.image
  }, [activeIndex])

  return (
    <section
      className="exp-hero"
      aria-labelledby="expeditions-heading"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const difference = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
        touchStartX.current = null
        if (Math.abs(difference) > 55) navigate(difference > 0 ? -1 : 1)
      }}
    >
      <div className="exp-hero-media" aria-live="off">
        <AnimatePresence initial={false} mode="sync">
          <motion.img
            key={activeSlide.image}
            src={activeSlide.image}
            alt=""
            aria-hidden="true"
            draggable={false}
            fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
            style={{ objectPosition: activeSlide.position ?? 'center' }}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.055 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{
              opacity: { duration: reduceMotion ? 0 : 1.15, ease: 'easeOut' },
              scale: { duration: reduceMotion ? 0 : HERO_AUTOPLAY_DURATION / 1_000 + 0.8, ease: 'linear' },
            }}
          />
        </AnimatePresence>
      </div>

      <div className="exp-hero-shade" aria-hidden="true" />
      <motion.div
        className="exp-hero-opening-mask"
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: reduceMotion ? 0 : 1.08, delay: 0.08, ease: [0.76, 0, 0.24, 1] }}
      />

      <div className="wrap exp-hero-content">
        <motion.span
          className="mono exp-hero-kicker"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.72 }}
        >
          Rotas pelo Brasil · Desde 2018
        </motion.span>

        <h1 id="expeditions-heading" className="display exp-hero-title">
          <MaskedLine delay={0.48}>Conheça nossas</MaskedLine>
          <MaskedLine delay={0.6}>expedições.</MaskedLine>
        </h1>

        <motion.p
          className="exp-hero-description"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.92 }}
        >
          Travessias acompanhadas por paisagens que só a água consegue revelar.
        </motion.p>
      </div>

      <div className="wrap exp-hero-footer">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeSlide.expedition}-${activeIndex}`}
            className="exp-hero-caption"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.34 }}
          >
            <span className="mono">Fotografia {String(activeIndex + 1).padStart(2, '0')}</span>
            <strong>{activeSlide.expedition}</strong>
            <small>{activeSlide.location} · {activeSlide.year}</small>
          </motion.div>
        </AnimatePresence>

        <div className="exp-hero-controls">
          <span className="mono exp-hero-counter">
            {String(activeIndex + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
          </span>
          <button type="button" onClick={() => navigate(-1)} aria-label="Fotografia anterior">
            <ChevronLeft size={21} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigate(1)} aria-label="Próxima fotografia">
            <ChevronRight size={21} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="exp-hero-progress" aria-hidden="true">
        <span
          key={activeIndex}
          style={{
            animationDuration: reduceMotion ? '0ms' : `${HERO_AUTOPLAY_DURATION}ms`,
          }}
        />
      </div>

      <a className="exp-hero-scroll" href="#historias">
        <span className="mono">Descobrir as rotas</span>
        <ArrowDown size={17} aria-hidden="true" />
      </a>
    </section>
  )
}

function ExpeditionChapter({
  expedition,
  onOpen,
}: {
  expedition: Expedition
  onOpen: (expedition: Expedition) => void
}) {
  const mediaRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: mediaRef,
    offset: ['start 94%', 'start 58%'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    mass: 0.42,
    restDelta: 0.001,
  })
  const clipPath = useTransform(
    smoothProgress,
    [0, 1],
    ['inset(12% 7% 12% 7%)', 'inset(0% 0% 0% 0%)'],
  )
  const imageScale = useTransform(smoothProgress, [0, 1], [1.065, 1])
  const actionOpacity = useTransform(smoothProgress, [0.52, 0.78], [0, 1])
  const actionY = useTransform(smoothProgress, [0.52, 0.78], [8, 0])

  return (
    <article className="exp-chapter" aria-label={`Expedição ${expedition.destination}`}>
      <div ref={mediaRef} className="exp-chapter-media">
        <button
          type="button"
          onClick={() => onOpen(expedition)}
          aria-label={`Conhecer a expedição ${expedition.destination}`}
        >
          <motion.span
            className="exp-chapter-image-frame"
            style={reduceMotion ? undefined : { clipPath }}
          >
            <motion.span
              className="exp-chapter-image-motion"
              style={reduceMotion ? undefined : { scale: imageScale }}
            >
              <img
                src={expedition.coverImage}
                alt={`Participantes da expedição ${expedition.destination}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </motion.span>
            <span className="exp-chapter-image-shade" aria-hidden="true" />
          </motion.span>
          <motion.span
            className="exp-chapter-media-action"
            style={reduceMotion ? undefined : { opacity: actionOpacity, y: actionY }}
          >
            <Images size={18} aria-hidden="true" />
            Abrir história
          </motion.span>
        </button>
      </div>
    </article>
  )
}

function ExpeditionStories({ onOpen }: { onOpen: (expedition: Expedition) => void }) {
  return (
    <section id="historias" className="exp-stories" aria-labelledby="stories-heading">
      <div className="wrap">
        <Reveal className="exp-stories-heading">
          <div>
            <span className="mono exp-kicker">Expedições realizadas</span>
            <h2 id="stories-heading" className="display">Cada destino deixou uma história.</h2>
          </div>
          <div className="exp-section-summary">
            <img
              className="exp-section-logo"
              src="/images/Usina-logo-Preto.png"
              alt=""
              aria-hidden="true"
            />
            <p>
              Três trajetos, diferentes paisagens e o mesmo cuidado em cada quilômetro.
              Abra uma rota para ver o relato e as fotografias da viagem.
            </p>
          </div>
        </Reveal>

        <div className="exp-chapters">
          {EXPEDITIONS.map((expedition) => (
            <ExpeditionChapter
              key={expedition.id}
              expedition={expedition}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  const reduceMotion = useReducedMotion()
  const formattedValue = String(value).padStart(2, '0')

  return (
    <span className="exp-countdown-value" aria-label={String(value)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={formattedValue}
          aria-hidden="true"
          initial={reduceMotion ? false : { y: '55%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? undefined : { y: '-55%', opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          {formattedValue}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Countdown({ target }: { target: string }) {
  const countdown = useCountdown(target)

  if (countdown.ended) {
    return <p className="exp-countdown-ended">Consulte a próxima data com nossa equipe.</p>
  }

  const units = [
    { label: 'Dias', value: countdown.days },
    { label: 'Horas', value: countdown.hours },
    { label: 'Minutos', value: countdown.minutes },
  ]

  return (
    <div className="exp-countdown" aria-label="Contagem regressiva para a expedição">
      {units.map((unit) => (
        <div className="exp-countdown-unit" key={unit.label}>
          <AnimatedNumber value={unit.value} />
          <span className="mono exp-countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

function UpcomingExpedition() {
  const facts = [
    { icon: MapPin, label: 'Destino', value: `${UPCOMING_EXPEDITION.destination}, SP` },
    { icon: Clock3, label: 'Duração', value: UPCOMING_EXPEDITION.duration },
    { icon: Users, label: 'Disponibilidade', value: UPCOMING_EXPEDITION.availability },
  ]

  return (
    <section className="exp-upcoming" aria-labelledby="upcoming-heading">
      <div className="wrap">
        <Reveal className="exp-upcoming-heading">
          <div>
            <span className="mono exp-kicker">Próxima partida</span>
            <h2 id="upcoming-heading" className="display">A próxima história já tem destino.</h2>
          </div>
          <div className="exp-section-summary">
            <img
              className="exp-section-logo"
              src="/images/Usina-logo-Preto.png"
              alt=""
              aria-hidden="true"
            />
            <p>
              Campos do Jordão ganha sua própria experiência. Veja o essencial por aqui ou
              abra a página da expedição para conhecer o roteiro completo.
            </p>
          </div>
        </Reveal>

        <Reveal className="exp-upcoming-card" delay={0.08}>
          <div className="exp-upcoming-media">
            <img
              src={UPCOMING_EXPEDITION.image}
              alt="Campos do Jordão, próxima expedição da Usina do Jet"
              loading="lazy"
              decoding="async"
            />
            <span className="mono exp-upcoming-status"><i aria-hidden="true" />Vagas abertas</span>
            <div className="exp-upcoming-media-caption">
              <span className="mono">Serra da Mantiqueira · São Paulo</span>
              <h3 className="display">Campos do Jordão</h3>
            </div>
          </div>

          <div className="exp-upcoming-content">
            <div className="exp-upcoming-date">
              <span className="mono">{UPCOMING_EXPEDITION.date}</span>
              <strong>A expedição começa em</strong>
            </div>

            <Countdown target={UPCOMING_EXPEDITION.countdownDate} />

            <dl className="exp-upcoming-facts">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <dt><Icon size={16} strokeWidth={1.8} aria-hidden="true" /><span className="mono">{label}</span></dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="exp-upcoming-price">
                <dt className="mono">Investimento</dt>
                <dd>{UPCOMING_EXPEDITION.price}</dd>
                <small>por pessoa</small>
              </div>
            </dl>

            <div className="exp-upcoming-actions">
              <Link className="exp-button exp-button-dark" to={UPCOMING_EXPEDITION.detailsPath}>
                Conhecer o roteiro <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link className="exp-text-link" to={UPCOMING_EXPEDITION.registrationPath}>
                Ir direto para a inscrição <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FutureRoute() {
  return (
    <section className="exp-future" aria-labelledby="future-route-heading">
      <div className="wrap">
        <Reveal className="exp-future-card">
          <div className="exp-future-copy">
            <span className="mono exp-kicker exp-kicker-light">No mapa da Usina</span>
            <h2 id="future-route-heading" className="display">Florianópolis</h2>
            <p>
              Uma nova rota está sendo desenhada. Quando os detalhes estiverem fechados,
              você pode ser uma das primeiras pessoas a saber.
            </p>
            <Link className="exp-button exp-button-light" to="/contato">
              Quero receber novidades <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="exp-future-date" aria-label="Previsão para outubro de 2026">
            <span className="mono">Previsão</span>
            <strong className="display">OUT</strong>
            <strong className="display">2026</strong>
            <small className="mono">Data a confirmar</small>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function ExpeditionDialog({ expedition, onClose }: { expedition: Expedition; onClose: () => void }) {
  const [imageIndex, setImageIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousBodyOverflowRef = useRef('')
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const scrollLockReleasedRef = useRef(false)
  const reduceMotion = useReducedMotion()
  const images = expedition.galleryImages

  const navigate = useCallback((direction: number) => {
    setImageIndex((current) => (current + direction + images.length) % images.length)
  }, [images.length])

  const releaseScrollLock = useCallback(() => {
    if (scrollLockReleasedRef.current) return

    document.body.style.overflow = previousBodyOverflowRef.current
    scrollLockReleasedRef.current = true
  }, [])

  const requestClose = useCallback(() => {
    releaseScrollLock()
    onClose()
  }, [onClose, releaseScrollLock])

  useEffect(() => {
    const neighbors = [
      images[(imageIndex + 1) % images.length],
      images[(imageIndex - 1 + images.length) % images.length],
    ]
    neighbors.forEach((src) => {
      const preload = new Image()
      preload.src = src
    })
  }, [imageIndex, images])

  useEffect(() => {
    previousBodyOverflowRef.current = document.body.style.overflow
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    scrollLockReleasedRef.current = false
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (event.key === 'ArrowLeft') navigate(-1)
      if (event.key === 'ArrowRight') navigate(1)

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ))
        if (focusable.length === 0) {
          event.preventDefault()
          return
        }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      releaseScrollLock()
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus({ preventScroll: true })
    }
  }, [navigate, releaseScrollLock, requestClose])

  return (
    <motion.div
      ref={dialogRef}
      className="exp-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exp-dialog-title"
      initial={reduceMotion ? false : { clipPath: 'inset(0 0 0 100%)' }}
      animate={{ clipPath: 'inset(0 0 0 0%)' }}
      exit={reduceMotion ? undefined : { clipPath: 'inset(0 100% 0 0)' }}
      transition={{ duration: reduceMotion ? 0 : 0.76, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.aside
        className="exp-dialog-copy"
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
      >
        <button ref={closeButtonRef} type="button" className="exp-dialog-close" onClick={requestClose} aria-label="Fechar expedição">
          <X size={21} aria-hidden="true" />
        </button>
        <span className="mono exp-kicker exp-kicker-light">
          {expedition.sequenceLabel} · {expedition.dateLabel}
        </span>
        <h2 id="exp-dialog-title" className="display">{expedition.destination}</h2>
        <p>{expedition.description}</p>
        <dl>
          <div><dt className="mono">Destino</dt><dd>{expedition.state}</dd></div>
          <div><dt className="mono">Duração</dt><dd>{expedition.duration}</dd></div>
          <div><dt className="mono">Grupo</dt><dd>{expedition.spots} participantes</dd></div>
        </dl>
        <div className="exp-dialog-count">
          <span className="mono">Fotografia</span>
          <strong>{String(imageIndex + 1).padStart(2, '0')}</strong>
          <small>/ {String(images.length).padStart(2, '0')}</small>
        </div>
      </motion.aside>

      <motion.div
        className="exp-dialog-gallery"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.72, delay: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="exp-dialog-stage">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={images[imageIndex]}
              src={images[imageIndex]}
              alt={`${expedition.destination}, fotografia ${imageIndex + 1} de ${images.length}`}
              draggable={false}
              drag={reduceMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 650) {
                  navigate(info.offset.x > 0 ? -1 : 1)
                }
              }}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
          <button type="button" className="exp-dialog-arrow is-left" onClick={() => navigate(-1)} aria-label="Fotografia anterior">
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button type="button" className="exp-dialog-arrow is-right" onClick={() => navigate(1)} aria-label="Próxima fotografia">
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="exp-dialog-thumbnails" aria-label="Selecionar fotografia">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={index === imageIndex ? 'is-active' : undefined}
              onClick={() => setImageIndex(index)}
              aria-label={`Abrir fotografia ${index + 1}`}
              aria-pressed={index === imageIndex}
            >
              <img src={image} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Expeditions() {
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null)

  return (
    <main className="expeditions-page">
      <ExpeditionHero />

      <ExpeditionStories onOpen={setSelectedExpedition} />
      <UpcomingExpedition />
      <FutureRoute />

      <AnimatePresence>
        {selectedExpedition && (
          <ExpeditionDialog expedition={selectedExpedition} onClose={() => setSelectedExpedition(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}
