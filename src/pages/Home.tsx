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
  X,
} from 'lucide-react'
import { patrocinadores, type Patrocinador } from '../data/patrocinadores'
import { produtos, type Produto } from '../data/produtos'
import BrandIntro from '../components/BrandIntro'
import HeroMedia from '../components/HeroMedia'

const EXPEDITION_PATH = '/expedicoes/campos-do-jordao-2026'
const DESTINATION_AUTOPLAY_DURATION = 10_000
const activeBrands = patrocinadores.filter((brand) => brand.ativo)

interface Destination {
  name: string
  state: string
  edition: string
  image: string
  imageClassName?: string
}

const destinations: Destination[] = [
  {
    name: 'Angra x Paraty',
    state: 'Rio de Janeiro',
    edition: 'Expedição 01',
    image: '/images/Angra.webp',
  },
  {
    name: 'Capitólio',
    state: 'Minas Gerais',
    edition: 'Expedição 02',
    image: '/images/Capitolio.png',
  },
  {
    name: 'São Sebastião x Ilhabela',
    state: 'São Paulo',
    edition: 'Expedição 03',
    image: '/images/SaoSebastiao.png',
  },
  {
    name: 'Alter do Chão',
    state: 'Pará',
    edition: 'Expedição 04',
    image: '/images/AlterdoChão.jpg',
    imageClassName: 'gallery-image-alter',
  },
  {
    name: 'Bahamas',
    state: 'Destino internacional',
    edition: 'Expedição 05',
    image: '/images/bahamas.png',
  },
]

interface ServiceImage {
  src: string
  alt: string
}

interface ServiceDefinition {
  number: string
  title: string
  circleTitle: string
  eyebrow: string
  description: string
  story: string
  details: string[]
  image: string
  imageAlt: string
  coverImage: ServiceImage
  gallery: ServiceImage[]
  galleryLayout?: 'mosaic' | 'portrait'
  kind?: 'editorial' | 'products' | 'reporting'
}

const expedicaoGallery: ServiceImage[] = [
  { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image1.png', alt: 'Expedição da Usina do Jet em Angra dos Reis' },
  { src: '/images/Angra/FOTO%202.webp', alt: 'Jet skis durante o percurso em Angra dos Reis' },
  { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image2.png', alt: 'Participantes reunidos durante a expedição' },
  { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image3.png', alt: 'Paisagem registrada durante a expedição em Angra' },
  { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image4.png', alt: 'Momento do grupo durante o trajeto náutico' },
  { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image7.png', alt: 'Registro da experiência da Usina do Jet em Angra' },
]

const OffRoadGallery: ServiceImage[] = [
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image1.png', alt: 'Travessia da Usina do Jet entre São Sebastião e Ilhabela' },
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image2.png', alt: 'Participantes na travessia de São Sebastião' },
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image3.png', alt: 'Jet skis durante a experiência no litoral paulista' },
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image4.png', alt: 'Registro da rota entre mar e ilha' },
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image5.png', alt: 'Momento da expedição no litoral' },
  { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image6.png', alt: 'Comunidade reunida durante o percurso' },
]

const CorridadeJetGallery: ServiceImage[] = [
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image6.png', alt: 'Travessia da Usina do Jet entre São Sebastião e Ilhabela' },
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image2.png', alt: 'Participantes na travessia de São Sebastião' },
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image3.png', alt: 'jet skis durante a experiência no litoral paulista' },
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image4.png', alt: 'Registro da rota entre mar e ilha' },
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image5.png', alt: 'Momento da expedição no litoral' },
  { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image1.png', alt: 'Comunidade reunida durante o percurso' },
]

const PodcastGallery: ServiceImage[] = [
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image6.png', alt: 'Experiência da Usina do Jet em Campos do Jordão' },
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image2.png', alt: 'Registro de uma experiência da Usina do Jet' },
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image3.png', alt: 'Participantes reunidos durante um evento' },
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image4.png', alt: 'Momento vivido durante a experiência' },
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image5.png', alt: 'Paisagem do roteiro da Usina do Jet' },
  { src: '/images/ImagensHome/O_que_fazemos/Podcast/image1.png', alt: 'Registro da comunidade Usina do Jet' },
]
const CoberturaEventosGallery: ServiceImage[] = [
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image5.png', alt: 'Experiência da Usina do Jet em Campos do Jordão' },
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image2.png', alt: 'Registro de uma experiência da Usina do Jet' },
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image9.png', alt: 'Participantes reunidos durante um evento' },
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image7.png', alt: 'Momento vivido durante a experiência' },
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image6.png', alt: 'Paisagem do roteiro da Usina do Jet' },
  { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image8.png', alt: 'Registro da comunidade Usina do Jet' },
]
const produtosGallery: ServiceImage[] = [
  { src: '/images/capaprodutos.jpeg', alt: 'Experiência da Usina do Jet em Campos do Jordão' },
]

const services: ServiceDefinition[] = [
  {
    number: '01',
    title: 'Expedições náuticas',
    circleTitle: 'Expedições náuticas',
    eyebrow: 'Rotas que viram histórias',
    description: 'Roteiros acompanhados, estrutura de apoio e grupos reunidos para conhecer o Brasil por uma perspectiva diferente.',
    story: 'No fim, não é só sobre o trajeto. É sobre quem estava ali e o que cada pessoa leva de volta.',
    details: [
      'Cada saída é pensada com antecedência, respeitando o ritmo do grupo, as condições do percurso e tudo o que torna a viagem mais segura e gostosa de viver.',
      'Entre uma parada e outra, o destino deixa de ser apenas cenário. É ali que surgem os encontros, as descobertas e as histórias que continuam depois da água.',
    ],
    image: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image1.png',
    imageAlt: 'Expedição náutica da Usina do Jet',
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image1.png', alt: 'Expedição náutica da Usina do Jet' },
    gallery: expedicaoGallery,
  },
  {
    number: '02',
    title: 'Corridas de jet',
    circleTitle: 'Corridas de jet',
    eyebrow: 'Velocidade com propósito',
    description: 'A energia das competições vista de perto, do preparo antes da largada aos encontros que acontecem fora da pista.',
    story: 'A corrida dura alguns minutos. A preparação, a parceria e tudo o que ela desperta ficam por muito mais tempo.',
    details: [
      'A Usina acompanha esse universo por inteiro: os pilotos, as equipes, os bastidores e a emoção de quem vive cada etapa de verdade.',
      'Mais do que registrar velocidade, buscamos mostrar as pessoas e as histórias que fazem o esporte continuar crescendo.',
    ],
    image: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image6.png',
    imageAlt: 'Piloto durante uma corrida de jet',
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Corridas_de_jet/image6.png', alt: 'Corrida de jet acompanhada pela Usina' },
    gallery: CorridadeJetGallery,
  },
  {
    number: '03',
    title: 'Cobertura de eventos nacionais e internacionais',
    circleTitle: 'Cobertura de eventos',
    eyebrow: 'Onde a cena acontece',
    description: 'Presença em eventos no Brasil e no exterior para transformar cada momento importante em imagem, contexto e memória.',
    story: 'Uma boa cobertura não olha apenas para o palco. Ela percebe o clima, os bastidores e tudo o que faz aquele encontro ser único.',
    details: [
      'A narrativa começa antes do primeiro clique. Entendemos o evento, acompanhamos seus momentos essenciais e construímos um registro com identidade.',
      'O resultado reúne movimento, pessoas e detalhes para que a experiência continue viva e possa chegar a quem não estava ali.',
    ],
    image: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image1.png',
    imageAlt: 'Evento náutico acompanhado pela Usina do Jet',
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Cobertura_de_Eventos/image1.png', alt: 'Registro do arquivo de eventos da Usina do Jet' },
    gallery: CoberturaEventosGallery,
  },
  {
    number: '04',
    title: 'Reportagens e conteúdo',
    circleTitle: 'Reportagens e conteúdo',
    eyebrow: 'Histórias bem contadas',
    description: 'Reportagens, entrevistas e registros que aproximam o público das pessoas, dos lugares e das novidades do universo do jet.',
    story: 'Conteúdo bom não precisa aumentar o tom. Precisa encontrar o olhar certo e contar o que realmente vale ser lembrado.',
    details: [],
    image: '/images/ImagensHome/O_que_fazemos/Reportagens/image1.png',
    imageAlt: 'Personagem retratado em conteúdo da Usina do Jet',
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Expedição_Náutica/image7.png', alt: 'Registro de uma expedição da Usina do Jet' },
    gallery: [],
    kind: 'reporting',
  },
  {
    number: '05',
    title: 'Podcast Usina do Jet',
    circleTitle: 'Podcast Usina do Jet',
    eyebrow: 'Conversas sem pressa',
    description: 'Um espaço para ouvir quem movimenta o universo náutico e conhecer as histórias que normalmente ficam longe das câmeras.',
    story: 'Toda trajetória tem uma parte que não cabe na legenda. É essa conversa que queremos trazer para perto.',
    details: [
      'Pilotos, organizadores, viajantes e pessoas ligadas ao jet compartilham experiências, aprendizados e momentos que ajudaram a construir seus caminhos.',
      'O formato é simples e humano: uma boa conversa, tempo para aprofundar e curiosidade para chegar ao que ainda não foi contado.',
    ],
    image: '/images/ImagensHome/O_que_fazemos/Podcast/image1.png',
    imageAlt: 'Conversa com integrantes da comunidade Usina do Jet',
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Podcast/image1.png', alt: 'Podcast da Usina do Jet' },
    gallery: PodcastGallery.slice().reverse(),
  },
  {
    number: '06',
    title: 'Produtos e equipamentos',
    circleTitle: 'Produtos e equipamentos',
    eyebrow: 'Escolhas para viver a água',
    description: 'Uma seleção de equipamentos, acessórios e peças para quem já vive o jet ou está preparando a próxima experiência.',
    story: 'O produto certo resolve o que precisa e deixa mais espaço para aproveitar o que realmente importa.',
    details: [
      'Reunimos itens disponíveis no catálogo da Usina com informação clara, acesso rápido aos detalhes e caminhos simples para comprar.',
      'A seleção abaixo acompanha o catálogo atual. Se quiser explorar outras categorias, é só seguir para a vitrine completa.',
    ],
    image: '/images/capaprodutos.jpeg',
    imageAlt: 'Seleção de produtos e equipamentos da Usina do Jet',
    coverImage: { src: '/images/capaprodutos.jpeg', alt: 'Produtos e equipamentos da Usina do Jet' },
    gallery: produtosGallery,
    kind: 'products',
  },
  {
    number: '07',
    title: 'Experiências especiais',
    circleTitle: 'Experiências especiais',
    eyebrow: 'Do mar à terra',
    description: 'Encontros desenhados para viver novos lugares com presença, boa companhia e o cuidado que já faz parte da Usina.',
    story: 'Nem toda experiência precisa seguir a mesma rota. Algumas começam na água, outras na estrada, mas todas começam com gente.',
    details: [
      'Criamos momentos que respeitam o espírito de cada destino e aproximam pessoas que compartilham a vontade de descobrir algo novo.',
      'A proposta muda conforme o lugar, o grupo e a ocasião. O cuidado com a experiência, porém, continua sendo o mesmo.',
    ],
    image: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image1.png',
    imageAlt: 'Experiência especial da Usina do Jet em terra',
    gallery: OffRoadGallery,
    coverImage: { src: '/images/ImagensHome/O_que_fazemos/Experiencias_especiais/image1.png', alt: 'Experiência off-road da Usina do Jet' },
    galleryLayout: 'portrait',
  },
]

const featuredProducts = produtos.filter((product) => product.disponivel).slice(0, 16)

function getProductImage(product: Produto) {
  const colorImages = product.imagensPorCor
    ? Object.values(product.imagensPorCor).find((images) => images.length > 0)
    : undefined

  return colorImages?.[0] ?? product.imagens[0] ?? '/images/image5.png'
}

function getProductCategory(product: Produto) {
  return Array.isArray(product.categoria) ? product.categoria[0] : product.categoria
}

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
  {
    value: '+50',
    label: 'Eventos realizados',
    note: 'Expedições, corridas de jet e encontros no Brasil e no exterior.',
  },
  { value: '2018', label: 'O início da nossa história' },
  { value: '100%', label: 'Experiência acompanhada' },
]

function AnimatedMetric({ value, label, note, index }: { value: string; label: string; note?: string; index: number }) {
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
      <span className="manifesto-stat-label">{label}</span>
      {note && <small className="manifesto-stat-note">{note}</small>}
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
          <div className="manifesto-image-motion">
            <SmartImage
              src="/images/FOTO%201%20V2.png"
              alt="Vista aérea de um grupo de jet skis navegando em uma expedição da Usina do Jet"
            />
          </div>
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
              Desde 2018, reunimos pessoas movidas pela descoberta. Cada expedição e cada evento, seja ele no mar ou na terra, nasce do cuidado com o roteiro, da estrutura de apoio e da vontade de viver a paisagem de um jeito mais intenso.
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
                note={metric.note}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const reportingTopics = [
  {
    id: 'reportagens',
    title: 'Reportagens e informação',
    paragraphs: [
      'Acompanhamos eventos, novidades e experiências do universo náutico. O trabalho reúne reportagens, entrevistas e conteúdo técnico, com uma linguagem direta para quem já vive o esporte e para quem está chegando agora.',
      'Além de mostrar, queremos explicar: ouvir quem conhece o assunto e dar contexto ao que acontece dentro e fora da água.',
    ],
  },
  {
    id: 'eventos',
    title: 'Dos eventos à canoagem',
    paragraphs: [
      'O jet é parte da nossa história, mas as pautas não param nele. A canoagem brasileira também faz parte dos eventos que acompanhamos, ampliando o espaço para outras modalidades e para as pessoas que vivem o esporte.',
      'Em cada cobertura, o olhar vai para a competição e para o entorno: a preparação, o encontro entre participantes e o trabalho de quem faz tudo acontecer.',
    ],
  },
  {
    id: 'bastidores',
    title: 'Entrevistas e bastidores',
    paragraphs: [
      'Conversar com atletas, organizadores e profissionais do setor ajuda a contar o que uma imagem sozinha não explica. São experiências, escolhas e aprendizados de quem está ali, com espaço para cada pessoa falar do seu jeito.',
      'Esses relatos ganham continuidade nos vídeos e nas reportagens da Usina, para que o público possa acompanhar as histórias mesmo depois do evento.',
    ],
  },
]

function ReportingContent() {
  return (
    <section className="services-reporting" aria-labelledby="services-reporting-title">
      <header className="services-reporting-heading">
        <div>
          <span className="mono services-reporting-eyebrow">Por dentro do nosso trabalho</span>
          <h4 id="services-reporting-title" className="display">O que a gente conta.</h4>
        </div>
        <p>
          A câmera registra o momento. A reportagem aproxima o público de quem estava lá.
          É desse encontro entre imagem, conversa e informação que nasce o conteúdo da Usina.
        </p>
      </header>

      <div className="services-reporting-topics">
        {reportingTopics.map((topic, index) => (
          <section
            key={topic.id}
            className="services-reporting-topic"
            aria-labelledby={`services-reporting-${topic.id}`}
          >
            <div className="services-reporting-topic-heading">
              <span className="mono services-reporting-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h5 id={`services-reporting-${topic.id}`} className="display">{topic.title}</h5>
            </div>
            <div className="services-reporting-copy">
              {topic.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>

      <div className="services-reporting-channel">
        <p>Vídeos, entrevistas e reportagens completas no canal da Usina do Jet.</p>
        <a
          href="https://www.youtube.com/@usinadojet"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver reportagens no YouTube, abre em nova aba"
        >
          Ver reportagens no YouTube <ArrowUpRight aria-hidden="true" size={20} />
        </a>
      </div>
    </section>
  )
}

function ServicesSection() {
  const portalRef = useRef<HTMLDivElement | null>(null)
  const portalHasEntered = useInView(portalRef, {
    once: true,
    margin: '-12% 0px -12% 0px',
  })
  const reduceMotion = useReducedMotion()
  const hasOpenedServiceRef = useRef(false)
  const [activeService, setActiveService] = useState<number | null>(null)
  const [openedService, setOpenedService] = useState<number | null>(null)

  const routePaths = [
    'M 520 330 C 430 270, 330 185, 205 145',
    'M 680 330 C 785 255, 900 185, 1010 150',
    'M 470 390 C 350 390, 235 385, 105 390',
    'M 730 390 C 850 395, 980 390, 1095 405',
    'M 515 455 C 440 520, 350 590, 275 650',
    'M 600 480 C 605 550, 610 620, 610 690',
    'M 690 455 C 780 520, 880 585, 985 635',
  ]
  const selectedService = openedService === null ? null : services[openedService]
  const skipPortalIntro = Boolean(reduceMotion || hasOpenedServiceRef.current)

  const openService = (index: number) => {
    hasOpenedServiceRef.current = true
    setActiveService(index)
    setOpenedService(index)
    requestAnimationFrame(() => {
      portalRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })
  }

  const closeService = () => {
    setOpenedService(null)
    setActiveService(null)
  }

  const returnToPaths = () => {
    closeService()
    requestAnimationFrame(() => {
      portalRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
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
          ref={portalRef}
          className={`services-portal-stage${selectedService ? ' is-detail-open' : ''}`}
        >
          <AnimatePresence initial={!reduceMotion} mode="sync">
            {!selectedService && (
              <motion.div
                key="services-orbit"
                className={`services-portal-orbit${activeService !== null ? ' has-active-node' : ''}`}
                initial={skipPortalIntro ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <svg
                  className="services-portal-routes"
                  viewBox="0 0 1200 800"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                >
                  {routePaths.map((path) => (
                    <path
                      key={`base-route-${path}`}
                      className={`services-portal-route-base${portalHasEntered ? ' is-visible' : ''}`}
                      d={path}
                    />
                  ))}
                  {!skipPortalIntro && routePaths.map((path, index) => (
                    <motion.path
                      key={`intro-route-${path}`}
                      className={`services-portal-intro-route${portalHasEntered ? ' is-running' : ''}`}
                      d={path}
                      style={{ animationDelay: `${0.7 + index * 0.06}s` }}
                      initial={{ pathLength: 0 }}
                      animate={portalHasEntered ? {
                        pathLength: [0, 1, 1],
                      } : undefined}
                      transition={{
                        duration: 0.72,
                        delay: 0.7 + index * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                        times: [0, 0.64, 1],
                      }}
                    />
                  ))}
                  <AnimatePresence>
                    {activeService !== null && (
                      <motion.path
                        key={routePaths[activeService]}
                        className="services-portal-active-route"
                        d={routePaths[activeService]}
                        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
                      />
                    )}
                  </AnimatePresence>
                </svg>

                <motion.div
                  className="services-portal-mark"
                  initial={skipPortalIntro ? false : {
                    opacity: 0,
                    y: 18,
                    scale: 0.9,
                    filter: 'blur(10px)',
                  }}
                  animate={portalHasEntered ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  } : undefined}
                  transition={{
                    duration: reduceMotion ? 0 : 0.82,
                    delay: reduceMotion ? 0 : 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <img src="/images/Usina-logo-Preto.png" alt="Usina do Jet" />
                </motion.div>

                <ol className="services-portal-nodes">
                  {services.map((service, index) => {
                    const isActive = activeService === index

                    return (
                      <motion.li
                        key={service.number}
                        className={`services-portal-node services-portal-node-${index}${isActive ? ' is-active' : ''}`}
                        initial={skipPortalIntro ? false : {
                          opacity: 0,
                          scale: 0.82,
                          x: index === 2 ? -58 : index === 3 ? 58 : index < 2 ? (index === 0 ? -48 : 48) : 0,
                          y: index < 2 ? -38 : index > 3 ? 38 : 0,
                          filter: 'blur(7px)',
                        }}
                        animate={portalHasEntered ? {
                          opacity: 1,
                          scale: 1,
                          x: 0,
                          y: 0,
                          filter: 'blur(0px)',
                        } : undefined}
                        transition={{
                          duration: reduceMotion ? 0 : 0.78,
                          delay: reduceMotion ? 0 : 0.42 + index * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        <button
                          type="button"
                          className="services-portal-node-button"
                          aria-label={`Conhecer ${service.title}`}
                          onMouseEnter={() => setActiveService(index)}
                          onMouseLeave={() => setActiveService(null)}
                          onFocus={() => setActiveService(index)}
                          onBlur={() => setActiveService(null)}
                          onClick={() => openService(index)}
                        >
                          <motion.span
                            className="services-portal-node-media"
                          >
                            <SmartImage src={service.image} alt={service.imageAlt} />
                            <span className="services-portal-node-shade" aria-hidden="true" />
                            <span className="mono services-portal-node-number">{service.number}</span>
                          </motion.span>
                          <span className="services-portal-node-caption">
                            <motion.span
                              className="services-portal-node-caption-inner"
                              initial={skipPortalIntro ? false : { opacity: 0, y: 10 }}
                              animate={portalHasEntered ? { opacity: 1, y: 0 } : undefined}
                              transition={{
                                duration: reduceMotion ? 0 : 0.45,
                                delay: reduceMotion ? 0 : 0.82 + index * 0.1,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              <strong>{service.circleTitle}</strong>
                              <ArrowUpRight aria-hidden="true" size={16} />
                            </motion.span>
                          </span>
                        </button>
                      </motion.li>
                    )
                  })}
                </ol>
              </motion.div>
            )}
            {selectedService && (
              <motion.article
                key={`services-detail-${selectedService.number}`}
                className={`services-portal-detail services-portal-detail-${selectedService.kind ?? 'editorial'}`}
                aria-labelledby={`services-portal-title-${selectedService.number}`}
                aria-live="polite"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  className="services-portal-close"
                  onClick={closeService}
                  aria-label={`Fechar detalhes de ${selectedService.title}`}
                >
                  <X aria-hidden="true" size={20} />
                </button>

                <header className="services-portal-detail-hero">
                  <motion.figure
                    className="services-portal-detail-media"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <SmartImage src={selectedService.coverImage.src} alt={selectedService.coverImage.alt} eager />
                    <span className="services-portal-detail-shade" aria-hidden="true" />
                    <figcaption className="mono">Arquivo Usina / {selectedService.number}</figcaption>
                  </motion.figure>

                  <motion.div
                    className="services-portal-detail-copy"
                    initial={reduceMotion ? false : { opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="mono services-portal-detail-eyebrow">{selectedService.eyebrow}</span>
                    <span className="mono services-portal-detail-index">{selectedService.number}</span>
                    <h3 id={`services-portal-title-${selectedService.number}`} className="display">
                      {selectedService.title}
                    </h3>
                    <p>{selectedService.description}</p>
                    <blockquote>{selectedService.story}</blockquote>
                  </motion.div>
                </header>

                <div className="services-portal-detail-body">
                  {selectedService.kind !== 'reporting' && (
                    <section className="services-portal-narrative" aria-label={`Sobre ${selectedService.title}`}>
                      <div>
                        <span className="mono">Por dentro da Usina</span>
                        <h4 className="display">Mais do que uma imagem.</h4>
                      </div>
                      <div className="services-portal-narrative-copy">
                        {selectedService.details.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedService.kind === 'reporting' ? (
                    <ReportingContent />
                  ) : selectedService.kind === 'products' ? (
                    <section className="services-products" aria-labelledby="services-products-title">
                      <header className="services-products-heading">
                        <div>
                          <span className="mono">Seleção do catálogo</span>
                          <h4 id="services-products-title" className="display">Principais produtos</h4>
                        </div>
                        <p>Uma amostra do que está disponível agora. Abra um item para ver fotos, variações e formas de compra.</p>
                      </header>

                      {featuredProducts.length > 0 ? (
                        <div className="services-products-grid">
                          {featuredProducts.map((product, index) => (
                            <motion.div
                              key={product.id}
                              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, margin: '-30px' }}
                              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : (index % 4) * 0.045 }}
                            >
                              <Link to={`/catalogo/produto/${product.id}`} className="services-product-card">
                                <span className="services-product-image">
                                  <SmartImage src={getProductImage(product)} alt={product.nome} />
                                </span>
                                <span className="services-product-copy">
                                  <small className="mono">{getProductCategory(product)}</small>
                                  <strong>{product.nome}</strong>
                                  <span>{String(product.preco)}</span>
                                </span>
                                <ArrowUpRight aria-hidden="true" size={18} />
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="services-products-empty">Os produtos estão sendo atualizados. A vitrine completa continua disponível no catálogo.</p>
                      )}

                      <Link to="/catalogo" className="services-products-more">
                        Ver catálogo completo <ArrowRight aria-hidden="true" size={18} />
                      </Link>
                    </section>
                  ) : (
                    <section className={`services-portal-gallery${selectedService.galleryLayout === 'portrait' ? ' services-portal-gallery-portrait' : ''}`} aria-label={`Registros de ${selectedService.title}`}>
                      {selectedService.gallery.map((image, index) => (
                        <motion.figure
                          key={`${selectedService.number}-${image.src}-${index}`}
                          className={`services-portal-gallery-item services-portal-gallery-item-${index}`}
                          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : (index % 3) * 0.07 }}
                        >
                          <SmartImage src={image.src} alt={image.alt} />
                          <figcaption className="mono">{String(index + 1).padStart(2, '0')}</figcaption>
                        </motion.figure>
                      ))}
                    </section>
                  )}

                  <footer className="services-portal-detail-footer">
                    <div className="services-portal-detail-return">
                      <span className="mono">Terminou de explorar?</span>
                      <button type="button" onClick={returnToPaths}>
                        <ChevronLeft aria-hidden="true" size={18} />
                        Voltar aos caminhos
                      </button>
                    </div>
                    <nav className="services-portal-detail-nav" aria-label="Outros caminhos da Usina">
                      {services.map((service, index) => (
                        <button
                          key={service.number}
                          type="button"
                          className={openedService === index ? 'is-current' : ''}
                          onClick={() => openService(index)}
                          aria-label={`Abrir ${service.title}`}
                          aria-current={openedService === index ? 'true' : undefined}
                        >
                          <span className="mono">{service.number}</span>
                        </button>
                      ))}
                    </nav>
                  </footer>
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
  const sectionRef = useRef<HTMLElement | null>(null)
  const navigationRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()
  const isGalleryInView = useInView(sectionRef, { amount: 0.35 })
  const [current, setCurrent] = useState(0)

  const selectDestination = useCallback((index: number) => {
    const total = destinations.length
    setCurrent(((index % total) + total) % total)
  }, [])

  useEffect(() => {
    const navigation = navigationRef.current
    if (!navigation) return

    const keepSelectionVisible = () => {
      if (navigation.scrollWidth <= navigation.clientWidth) return
      const selected = navigation.querySelector<HTMLButtonElement>('[aria-current="true"]')
      if (!selected) return

      const viewport = navigation.getBoundingClientRect()
      const button = selected.getBoundingClientRect()
      const offset = button.left < viewport.left
        ? button.left - viewport.left
        : Math.max(0, button.right - viewport.right)

      if (Math.abs(offset) > 1) {
        navigation.scrollTo({
          left: navigation.scrollLeft + offset,
          behavior: reduceMotion ? 'instant' : 'smooth',
        })
      }
    }

    keepSelectionVisible()
    const observer = new ResizeObserver(keepSelectionVisible)
    observer.observe(navigation)
    return () => observer.disconnect()
  }, [current, reduceMotion])

  useEffect(() => {
    if (reduceMotion || !isGalleryInView) return

    let timeoutId = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setCurrent((value) => (value + 1) % destinations.length)
      }
    }, DESTINATION_AUTOPLAY_DURATION)

    const restartWhenVisible = () => {
      if (document.visibilityState !== 'visible') return

      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(
        () => setCurrent((value) => (value + 1) % destinations.length),
        DESTINATION_AUTOPLAY_DURATION,
      )
    }

    document.addEventListener('visibilitychange', restartWhenVisible)

    return () => {
      window.clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', restartWhenVisible)
    }
  }, [current, isGalleryInView, reduceMotion])

  return (
    <section ref={sectionRef} className="gallery-section" aria-labelledby="gallery-title">
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
            Cinco expedições, diferentes paisagens e a mesma vontade de descobrir novos lugares, no Brasil e no exterior.
          </p>
          <Link to="/expedicoes" className="text-link gallery-intro-link">
            Explorar todas as expedições <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </Reveal>
      </div>

      <motion.div
        className="gallery-showcase"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        role="region"
        aria-roledescription="carrossel"
        aria-label="Expedições realizadas"
      >
        <div className="gallery-stage">
          <div className="gallery-info">
            <div className="gallery-copy">
              {destinations.map((destination, index) => (
                <motion.div
                  key={destination.name}
                  className="gallery-caption"
                  initial={false}
                  animate={{ opacity: index === current ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35 }}
                  aria-hidden={index !== current}
                >
                  <p className="mono gallery-edition">{destination.edition}</p>
                  <h3 className="display">{destination.name}</h3>
                  <p className="gallery-location">{destination.state}</p>
                </motion.div>
              ))}
            </div>

            <div className="gallery-controls">
              <button
                type="button"
                className="gallery-arrow gallery-arrow-left"
                onClick={() => selectDestination(current - 1)}
                aria-label="Mostrar destino anterior"
              >
                <ChevronLeft aria-hidden="true" size={22} />
              </button>
              <button
                type="button"
                className="gallery-arrow gallery-arrow-right"
                onClick={() => selectDestination(current + 1)}
                aria-label="Mostrar próximo destino"
              >
                <ChevronRight aria-hidden="true" size={22} />
              </button>
              <span className="mono gallery-counter" aria-hidden="true">
                <span>{String(current + 1).padStart(2, '0')}</span>
                <span>/ {String(destinations.length).padStart(2, '0')}</span>
              </span>
            </div>
          </div>

          <div className="gallery-photos">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.name}
                className="gallery-slide"
                initial={false}
                animate={{ opacity: index === current ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeInOut' }}
                style={{ zIndex: index === current ? 2 : 1, pointerEvents: index === current ? 'auto' : 'none' }}
                aria-hidden={index !== current}
                drag={index === current && !reduceMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.05}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) selectDestination(current + 1)
                  if (info.offset.x > 60) selectDestination(current - 1)
                }}
              >
                <SmartImage
                  src={destination.image}
                  alt={`${destination.name}, ${destination.state}`}
                  className={`gallery-image ${destination.imageClassName ?? ''}`.trim()}
                />
              </motion.div>
            ))}

            {!reduceMotion && isGalleryInView && (
              <div className="gallery-timer" aria-hidden="true">
                <motion.span
                  key={current}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: DESTINATION_AUTOPLAY_DURATION / 1000, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </div>

        <div
          ref={navigationRef}
          className="gallery-navigation"
          style={{ '--gallery-count': destinations.length } as CSSProperties}
          role="group"
          aria-label="Selecionar destino"
        >
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

      </motion.div>
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
                <span className="mono">Eventos e expedições pelo Brasil · Desde 2018</span>
              </motion.div>

              <h1 id="home-title" className="display hero-title">
                {['Eventos e expedição', 'de jet pelo Brasil.'].map((line, index) => (
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
                Onde a experiência encontra a natureza.
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
