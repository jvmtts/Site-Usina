import {
  useCallback,
  useEffect,
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
  Plus,
  X,
} from 'lucide-react'
import { patrocinadores, type Patrocinador } from '../data/patrocinadores'
import BrandIntro from '../components/BrandIntro'
import HeroMedia from '../components/HeroMedia'

const EXPEDITION_PATH = '/expedicoes/campos-do-jordao-2026'
const activeBrands = patrocinadores.filter((brand) => brand.ativo)

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

const services = [
  {
    number: '01',
    title: 'Expedições náuticas',
    description: 'Roteiros acompanhados, estrutura de apoio e grupos reunidos para conhecer o Brasil por uma perspectiva diferente.',
    story: 'No fim, não é só sobre o trajeto. É sobre quem estava ali e o que cada pessoa leva de volta.',
    image: '/images/image1.png',
    imageAlt: 'Expedição náutica da Usina do Jet',
    gallery: [
      { src: '/images/image1.png', alt: 'Registro de uma expedição náutica da Usina do Jet' },
      { src: '/images/image2.png', alt: 'Participantes durante uma experiência da Usina do Jet' },
      { src: '/images/image3.png', alt: 'Momento vivido durante uma expedição da Usina do Jet' },
    ],
  },
  {
    number: '02',
    title: 'Catálogo selecionado',
    description: 'Uma seleção para quem quer entrar na água, renovar o equipamento ou encontrar a próxima oportunidade no universo do jet.',
    story: 'Escolher bem também faz parte da experiência de quem já vive esse universo ou quer começar a vivê-lo.',
    image: '/images/image5.png',
    imageAlt: 'Jet ski selecionado para o catálogo da Usina do Jet',
    gallery: [
      { src: '/images/image5.png', alt: 'Seleção do catálogo da Usina do Jet' },
      { src: '/images/image2.png', alt: 'Registro do universo náutico da Usina do Jet' },
      { src: '/images/image1.png', alt: 'Jet ski em uma experiência da Usina do Jet' },
    ],
  },
  {
    number: '03',
    title: 'Projetos e parcerias',
    description: 'Experiências e colaborações construídas com marcas e pessoas que compartilham a mesma paixão pelo mundo náutico.',
    story: 'As melhores ideias ganham força quando são construídas com gente que acredita na mesma história.',
    image: '/images/image4.png',
    imageAlt: 'Encontro realizado pela comunidade Usina do Jet',
    gallery: [
      { src: '/images/image4.png', alt: 'Encontro realizado pela comunidade Usina do Jet' },
      { src: '/images/image3.png', alt: 'Experiência construída com parceiros da Usina do Jet' },
      { src: '/images/image1.png', alt: 'Pessoas reunidas em uma ação da Usina do Jet' },
    ],
  },
  {
    number: '04',
    title: 'Nova frente',
    description: 'Um novo caminho da Usina do Jet que será apresentado em breve.',
    story: 'Estamos preparando esta nova frente. Em breve, este espaço contará sua história e reunirá seus principais registros.',
    image: '/images/image2.png',
    imageAlt: 'Registro temporário da nova frente da Usina do Jet',
    gallery: [
      { src: '/images/image2.png', alt: 'Registro temporário da nova frente da Usina do Jet' },
      { src: '/images/image3.png', alt: 'Experiência da Usina do Jet' },
      { src: '/images/image4.png', alt: 'Comunidade reunida em uma experiência da Usina do Jet' },
    ],
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
      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
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
          <span className="manifesto-index mono">01 / Nossa história</span>
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
              Conheça nossas expedições <ArrowRight aria-hidden="true" size={18} />
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

function ServicesSection() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const storyRef = useRef<HTMLElement | null>(null)
  const mapHasEntered = useInView(mapRef, {
    once: true,
    margin: '-12% 0px -12% 0px',
  })
  const mapIsVisible = useInView(mapRef, {
    margin: '-30% 0px -30% 0px',
  })
  const reduceMotion = useReducedMotion()
  const [activeService, setActiveService] = useState(0)
  const [openedService, setOpenedService] = useState<number | null>(null)
  const [isMapInteracting, setIsMapInteracting] = useState(false)

  const routePaths = [
    'M 539 322 C 470 283, 398 239, 310 199',
    'M 661 322 C 732 282, 804 240, 890 203',
    'M 539 398 C 470 441, 398 489, 312 538',
    'M 661 398 C 733 441, 806 489, 888 538',
  ]
  const nodeEntrance = [
    { x: -28, y: -18, rotate: -1.2 },
    { x: 28, y: -16, rotate: 1.1 },
    { x: -24, y: 20, rotate: -0.9 },
    { x: 24, y: 18, rotate: 0.8 },
  ]
  const selectedService = openedService === null ? null : services[openedService]

  useEffect(() => {
    if (openedService === null) return

    const frame = window.requestAnimationFrame(() => {
      storyRef.current?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [openedService, reduceMotion])

  useEffect(() => {
    if (!mapIsVisible || reduceMotion || isMapInteracting || openedService !== null) return

    const interval = window.setInterval(() => {
      setActiveService((current) => (current + 1) % services.length)
    }, 5200)

    return () => window.clearInterval(interval)
  }, [isMapInteracting, mapIsVisible, openedService, reduceMotion])

  const toggleService = (index: number) => {
    setActiveService(index)
    setOpenedService((current) => current === index ? null : index)
  }

  return (
    <section className="services-section" aria-labelledby="services-title">
      <div className="wrap services-heading">
        <Reveal>
          <span className="eyebrow">O que fazemos</span>
          <h2 id="services-title" className="display section-title">
            Uma marca.<br />Diferentes caminhos.
          </h2>
        </Reveal>
        <Reveal className="services-heading-copy" delay={0.08}>
          <p>
            A Usina conecta pessoas, destinos e marcas em torno de uma paixão
            que começa no jet e continua muito além do percurso.
          </p>
          <span className="mono services-guidance">
            Escolha um caminho para conhecer de perto
          </span>
        </Reveal>
      </div>

      <div
        ref={mapRef}
        className="wrap services-map"
        onMouseEnter={() => setIsMapInteracting(true)}
        onMouseLeave={() => setIsMapInteracting(false)}
        onFocusCapture={() => setIsMapInteracting(true)}
        onBlurCapture={() => setIsMapInteracting(false)}
      >
        <svg
          className="service-routes"
          viewBox="0 0 1200 720"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {routePaths.map((path, index) => (
            <motion.path
              key={path}
              className={activeService === index ? 'service-route is-active' : 'service-route'}
              d={path}
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={mapHasEntered ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{
                duration: reduceMotion ? 0 : 1.35,
                delay: reduceMotion ? 0 : 0.48 + index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </svg>

        <motion.div
          className="service-mark"
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.88, rotate: -2 }}
          animate={mapHasEntered ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: reduceMotion ? 0 : 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="service-mark-logo">
            <img src="/images/Usina-logo-Preto.png" alt="Usina do Jet" />
          </span>
        </motion.div>

        <ol className="service-nodes">
          {services.map((service, index) => {
            const isActive = activeService === index
            const isOpen = openedService === index

            return (
              <motion.li
                key={service.number}
                className={`service-node service-node-${index}${isActive ? ' is-active' : ''}`}
                initial={reduceMotion ? false : {
                  opacity: 0,
                  x: nodeEntrance[index].x,
                  y: nodeEntrance[index].y,
                  rotate: nodeEntrance[index].rotate,
                }}
                whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{
                  duration: reduceMotion ? 0 : 1.02,
                  delay: reduceMotion ? 0 : 0.28 + (index % 2) * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setActiveService(index)}
              >
                <button
                  type="button"
                  className="service-node-link"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? 'service-story-panel' : undefined}
                  onFocus={() => setActiveService(index)}
                  onPointerDown={() => setActiveService(index)}
                  onClick={() => toggleService(index)}
                >
                  <motion.span
                    className="service-node-media"
                    initial={reduceMotion ? false : {
                      clipPath: 'inset(12% 12% 12% 12% round 46%)',
                      scale: 0.94,
                    }}
                    whileInView={{
                      clipPath: 'inset(0% 0% 0% 0% round 0%)',
                      scale: 1,
                    }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{
                      duration: reduceMotion ? 0 : 1.15,
                      delay: reduceMotion ? 0 : 0.36 + (index % 2) * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <SmartImage src={service.image} alt={service.imageAlt} />
                    <span className="service-node-shade" aria-hidden="true" />
                    <span className="mono service-node-number">{service.number}</span>
                  </motion.span>
                  <span className="service-node-copy">
                    <strong>{service.title}</strong>
                    <span className="service-node-action">
                      {isOpen ? 'Fechar história' : 'Abrir história'}
                      <Plus className={isOpen ? 'is-open' : ''} aria-hidden="true" size={17} />
                    </span>
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ol>
      </div>

      <div className="wrap service-story-region">
        <AnimatePresence initial={false} mode="wait">
          {selectedService && (
            <motion.article
              ref={storyRef}
              key={selectedService.number}
              id="service-story-panel"
              className="service-story"
              aria-labelledby={`service-story-title-${selectedService.number}`}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              <header className="service-story-header">
                <span className="mono">Caderno da Usina · {selectedService.number}</span>
                <button
                  type="button"
                  className="service-story-close"
                  onClick={() => setOpenedService(null)}
                  aria-label={`Fechar detalhes de ${selectedService.title}`}
                >
                  <X aria-hidden="true" size={19} />
                </button>
              </header>

              <div className="service-story-layout">
                <div className="service-story-copy">
                  <span className="eyebrow">Por dentro da Usina</span>
                  <h3
                    id={`service-story-title-${selectedService.number}`}
                    className="display"
                  >
                    {selectedService.title}
                  </h3>
                  <p>{selectedService.description}</p>
                  <blockquote>{selectedService.story}</blockquote>
                </div>

                <div className="service-story-gallery">
                  {selectedService.gallery.map((image, index) => (
                    <motion.figure
                      key={`${selectedService.number}-${image.src}-${index}`}
                      className={`service-story-photo service-story-photo-${index}`}
                      initial={reduceMotion ? false : { opacity: 0.68, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.72,
                        delay: reduceMotion ? 0 : 0.12 + index * 0.09,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <SmartImage src={image.src} alt={image.alt} />
                      <figcaption className="mono">
                        Arquivo Usina · {String(index + 1).padStart(2, '0')}
                      </figcaption>
                    </motion.figure>
                  ))}
                </div>
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
function BrandLogo({ brand }: { brand: Patrocinador }) {
  const [failed, setFailed] = useState(false)

  if (!brand.logo || failed) return <span>{brand.nome}</span>

  return (
    <img
      src={brand.logo}
      alt={brand.nome}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

function BrandTrack({ className = '' }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  if (activeBrands.length === 0) return null

  const shouldAnimate = !reduceMotion && activeBrands.length > 1
  const minimumItems = 6
  const repeats = Math.max(1, Math.ceil(minimumItems / activeBrands.length))
  const trackBrands = shouldAnimate
    ? Array.from({ length: repeats }, () => activeBrands).flat()
    : activeBrands

  return (
    <div
      className={`brand-track${shouldAnimate ? ' is-moving' : ' is-static'}${className ? ` ${className}` : ''}`}
    >
      <div className="brand-track-inner">
        {[0, 1].map((groupIndex) => (
          <div
            className="brand-track-group"
            aria-hidden={groupIndex === 1 ? 'true' : undefined}
            key={groupIndex}
          >
            {trackBrands.map((brand, index) => {
              const isDuplicate = groupIndex === 1 || index >= activeBrands.length

              return (
                <a
                  key={`${groupIndex}-${brand.id}-${index}`}
                  href={brand.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-mark"
                  data-brand-id={brand.id}
                  tabIndex={isDuplicate ? -1 : undefined}
                  aria-hidden={isDuplicate ? 'true' : undefined}
                  aria-label={isDuplicate ? undefined : `Conhecer ${brand.nome}`}
                >
                  <BrandLogo brand={brand} />
                </a>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function BrandBand({ id, title }: { id: string; title: string }) {
  if (activeBrands.length === 0) return null

  return (
    <section className="partner-ribbon" aria-labelledby={id}>
      <div className="wrap partner-ribbon-layout">
        <div className="partner-ribbon-heading">
          <span className="partner-ribbon-line" aria-hidden="true" />
          <h2 id={id} className="mono">
            {title}
          </h2>
        </div>
        <BrandTrack className="partner-ribbon-brands" />
      </div>
    </section>
  )
}

function PartnerRibbon() {
  return <BrandBand id="partner-ribbon-title" title="Nossos patrocinadores" />
}

function BrandRail() {
  return <BrandBand id="brand-title" title="Marcas que navegam com a gente" />
}
function DestinationGallery() {
  const reduceMotion = useReducedMotion()
  const [current, setCurrent] = useState(0)

  const selectDestination = useCallback((index: number) => {
    const total = destinations.length
    setCurrent(((index % total) + total) % total)
  }, [])

  useEffect(() => {
    if (reduceMotion) return

    let timeoutId = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setCurrent((value) => (value + 1) % destinations.length)
      }
    }, 7000)

    const restartWhenVisible = () => {
      if (document.visibilityState !== 'visible') return

      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(
        () => setCurrent((value) => (value + 1) % destinations.length),
        7000,
      )
    }

    document.addEventListener('visibilitychange', restartWhenVisible)

    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', restartWhenVisible)
    }
  }, [current, reduceMotion])

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
          <Link to="/expedicoes" className="text-link gallery-intro-link">
            Explorar todas as expedições <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </Reveal>
      </div>

      <motion.div
        className="gallery-stage"
        initial={reduceMotion ? false : { opacity: 0.78, y: 24, scale: 0.992 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: reduceMotion ? 0 : 0.88, ease: [0.16, 1, 0.3, 1] }}
      >
        {destinations.map((destination, index) => (
          <motion.div
            key={destination.image}
            className="gallery-slide"
            initial={false}
            animate={{
              opacity: index === current ? 1 : 0,
              scale: index === current ? 1 : 1.025,
              x: index === current ? '0%' : '1.5%',
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

        <div className="wrap gallery-navigation" role="group" aria-label="Selecionar destino">
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

        {!reduceMotion && (
          <div className="gallery-timer" aria-hidden="true">
            <motion.span
              key={current}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 7, ease: 'linear' }}
            />
          </div>
        )}
      </motion.div>
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
  const reduceMotion = useReducedMotion()

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
          <span className="display countdown-value">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                className="countdown-value-inner"
                key={unit.value}
                initial={reduceMotion ? false : { opacity: 0, y: '45%' }}
                animate={{ opacity: 1, y: '0%' }}
                exit={reduceMotion ? undefined : { opacity: 0, y: '-35%' }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </span>
          <small>{unit.label}</small>
        </div>
      ))}
    </div>
  )
}

function NextExpeditionSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const mediaInView = useInView(sectionRef, { once: true, margin: '-110px' })
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.34,
  })
  const imageY = useTransform(smoothProgress, [0, 1], ['-3.5%', '3.5%'])
  const imageScale = useTransform(smoothProgress, [0, 0.55, 1], [1.08, 1.035, 1.01])

  return (
    <section ref={sectionRef} className="next-section" aria-labelledby="next-title">
      <div className="wrap">
        <Reveal className="next-heading">
          <div>
            <span className="eyebrow">Próxima expedição</span>
            <h2 id="next-title" className="display section-title">
              Campos do Jordão
            </h2>
          </div>
          <p className="section-copy">
            Três dias de serra, trilhas e paisagens marcantes, com roteiro guiado e suporte da equipe do início ao fim.
          </p>
        </Reveal>

        <div className="expedition-feature">
          <motion.div
            className="expedition-media"
            initial={reduceMotion ? false : { clipPath: 'inset(0 100% 0 0)' }}
            animate={mediaInView ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
            transition={{ duration: reduceMotion ? 0 : 1.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={EXPEDITION_PATH}
              className="expedition-media-link"
              aria-label="Conhecer a expedição Campos do Jordão"
            >
              <motion.div
                className="expedition-image-motion"
                style={{
                  y: reduceMotion ? 0 : imageY,
                  scale: reduceMotion ? 1 : imageScale,
                }}
              >
                <SmartImage
                  src="/images/Expedição4.jpeg"
                  alt="Expedição em Campos do Jordão"
                />
              </motion.div>
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
            initial={reduceMotion ? false : { opacity: 0, x: 38 }}
            animate={mediaInView ? { opacity: 1, x: 0 } : undefined}
            transition={{
              duration: reduceMotion ? 0 : 0.85,
              delay: reduceMotion ? 0 : 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
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
                <dd>poucas vagas</dd>
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
        </div>
      </div>
    </section>
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
                      initial={reduceMotion ? false : { y: '125%', opacity: 0 }}
                      animate={heroContentVisible
                        ? { y: 0, opacity: 1 }
                        : { y: '125%', opacity: 0 }}
                      transition={{
                        y: {
                          duration: reduceMotion ? 0 : 0.9,
                          delay: reduceMotion ? 0 : 0.16 + index * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        },
                        opacity: {
                          duration: reduceMotion ? 0 : 0.01,
                          delay: reduceMotion ? 0 : 0.16 + index * 0.1,
                        },
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
      <PartnerRibbon />
      <ServicesSection />
      <NextExpeditionSection />
      <DestinationGallery />
      <BrandRail />

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
