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
  Images,
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
  spots?: number
  description: string
  coverImage: string
  coverImageAlt?: string
  showCoverTitle?: boolean
  galleryImages: [string, ...string[]]
}

interface HeroSlide {
  image: string
  expedition: string
  location: string
  year: string
  position?: string
}

const HERO_AUTOPLAY_DURATION = 6_800

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
  {
    id: 'campos-do-jordao-2026',
    sequenceLabel: 'Quarta expedição',
    destination: 'Campos do Jordão',
    shortDestination: 'Campos do Jordão',
    state: 'São Paulo',
    dateLabel: '21–23 de agosto de 2026',
    duration: '3 dias',
    description:
      'Em agosto de 2026, a Usina foi para a Serra da Mantiqueira. Foram três dias em Campos do Jordão, com trilhas, paisagens de serra e o acompanhamento da equipe.',
    coverImage: '/images/Expedi%C3%A7%C3%A3o4.jpeg',
    coverImageAlt: 'Arquitetura e iluminação do centro de Campos do Jordão',
    showCoverTitle: true,
    galleryImages: ['/images/Expedi%C3%A7%C3%A3o4.jpeg',
                    'images/Campos/image1.png',
                    'images/Campos/image2.png',
                    'images/Campos/image3.png',
                    'images/Campos/image4.png',
                    'images/Campos/image5.png',
                    'images/Campos/image6.png',
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
          Expedições por mar e por terra, com a equipe por perto em cada etapa do caminho.
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
    <article className={`exp-chapter${expedition.showCoverTitle ? ' exp-chapter-with-caption' : ''}`} aria-label={`Expedição ${expedition.destination}`}>
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
                alt={expedition.coverImageAlt ?? `Participantes da expedição ${expedition.destination}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </motion.span>
            <span className="exp-chapter-image-shade" aria-hidden="true" />
          </motion.span>
          {expedition.showCoverTitle && (
            <span className="exp-chapter-cover-caption">
              <span className="mono">Expedição realizada · {expedition.dateLabel}</span>
              <strong className="display">{expedition.destination}</strong>
            </span>
          )}
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
              Do mar à serra, diferentes paisagens e o mesmo cuidado em cada quilômetro.
              Abra uma rota para conhecer os detalhes e ver as imagens.
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
  const hasGallery = images.length > 1

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
    if (!hasGallery) return

    const neighbors = [
      images[(imageIndex + 1) % images.length],
      images[(imageIndex - 1 + images.length) % images.length],
    ]
    neighbors.forEach((src) => {
      const preload = new Image()
      preload.src = src
    })
  }, [hasGallery, imageIndex, images])

  useEffect(() => {
    previousBodyOverflowRef.current = document.body.style.overflow
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    scrollLockReleasedRef.current = false
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (hasGallery && event.key === 'ArrowLeft') navigate(-1)
      if (hasGallery && event.key === 'ArrowRight') navigate(1)

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
  }, [hasGallery, navigate, releaseScrollLock, requestClose])

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
          {expedition.spots !== undefined && (
            <div><dt className="mono">Grupo</dt><dd>{expedition.spots} participantes</dd></div>
          )}
        </dl>
        {hasGallery && (
          <div className="exp-dialog-count">
            <span className="mono">Fotografia</span>
            <strong>{String(imageIndex + 1).padStart(2, '0')}</strong>
            <small>/ {String(images.length).padStart(2, '0')}</small>
          </div>
        )}
      </motion.aside>

      <motion.div
        className={`exp-dialog-gallery${hasGallery ? '' : ' exp-dialog-gallery-single'}`}
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
              drag={reduceMotion || !hasGallery ? false : 'x'}
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
          {hasGallery && (
            <>
            <button type="button" className="exp-dialog-arrow is-left" onClick={() => navigate(-1)} aria-label="Fotografia anterior">
              <ChevronLeft size={24} aria-hidden="true" />
            </button>
            <button type="button" className="exp-dialog-arrow is-right" onClick={() => navigate(1)} aria-label="Próxima fotografia">
              <ChevronRight size={24} aria-hidden="true" />
            </button>
            </>
          )}
        </div>

        {hasGallery && (
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
        )}
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
      <FutureRoute />

      <AnimatePresence>
        {selectedExpedition && (
          <ExpeditionDialog expedition={selectedExpedition} onClose={() => setSelectedExpedition(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}
