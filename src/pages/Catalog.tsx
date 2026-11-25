import { useState, useEffect, useMemo, useRef, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, BadgePercent, ChevronLeft, ChevronRight, ExternalLink, ImageOff, Search, X, ZoomIn } from 'lucide-react'
import type { Produto } from '@/data/produtos'
import { useCatalog } from '@/catalog/catalogContext'
import { formatCatalogPrice } from '@/catalog/formatCatalogPrice'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import './Catalog.css'

const CATALOG_BATCH_SIZE = 8
const CATALOG_SCROLL_KEY = 'catalogScrollY'
const CATALOG_RESTORE_KEY = 'catalogRestorePending'

const getInitialCatalogLimit = () => {
  if (sessionStorage.getItem(CATALOG_RESTORE_KEY) !== 'true') return CATALOG_BATCH_SIZE

  const storedLimit = Number.parseInt(sessionStorage.getItem('catalogLimite') || '', 10)
  if (!Number.isFinite(storedLimit)) return CATALOG_BATCH_SIZE

  return Math.max(
    CATALOG_BATCH_SIZE,
    Math.ceil(storedLimit / CATALOG_BATCH_SIZE) * CATALOG_BATCH_SIZE,
  )
}

/* ─── WhatsApp Icon ──────────────────────────────────────────────── */
const WhatsappIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.482-1.46-1.656-1.758-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

const catalogEase = [0.16, 1, 0.3, 1] as const

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim()
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 400)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <button
      type="button"
      className="catalog-scroll-top"
      data-visible={visible}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  )
}

function CardProduto({ produto, priority }: { produto: Produto; priority: boolean }) {
  const [primaryFailed, setPrimaryFailed] = useState(false)
  const [showAlternative, setShowAlternative] = useState(false)
  const [alternativeReady, setAlternativeReady] = useState(false)
  const category = Array.isArray(produto.categoria) ? produto.categoria[0] : produto.categoria
  const images = (produto.imagens.length ? produto.imagens : Object.values(produto.imagensPorCor ?? {})[0] ?? [])
    .filter(src => src && !src.includes('via.placeholder.com'))
  const [primary, alternative] = images
  const price = formatCatalogPrice(produto.preco)

  const rememberScroll = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return
    sessionStorage.setItem(CATALOG_SCROLL_KEY, window.scrollY.toString())
    sessionStorage.setItem(CATALOG_RESTORE_KEY, 'true')
  }

  return (
    <Link
      className="catalog-product-card"
      to={'/catalogo/produto/' + produto.id}
      onClick={rememberScroll}
      onPointerEnter={event => {
        if (event.pointerType === 'mouse' && alternative) setShowAlternative(true)
      }}
      aria-labelledby={'catalog-product-title-' + produto.id + ' catalog-product-price-' + produto.id}
    >
      <div className="catalog-product-media">
        {primary && !primaryFailed ? (
          <img className="catalog-product-image" src={primary} alt=""
            loading={priority ? 'eager' : 'lazy'} decoding="async"
            onError={() => setPrimaryFailed(true)} />
        ) : (
          <span className="catalog-product-placeholder">
            <ImageOff size={23} strokeWidth={1.4} aria-hidden="true" />
            Foto indisponível
          </span>
        )}
        {primary && !primaryFailed && alternative && showAlternative && (
          <img className="catalog-product-image catalog-product-image--alternative"
            data-ready={alternativeReady} src={alternative} alt="" decoding="async"
            onLoad={() => setAlternativeReady(true)} onError={() => setAlternativeReady(false)} />
        )}
        <span className="catalog-product-category">{category}</span>
      </div>
      <div className="catalog-product-info">
        <h3 id={'catalog-product-title-' + produto.id}>{produto.nome}</h3>
        <div className="catalog-product-footer">
          <p id={'catalog-product-price-' + produto.id} className="catalog-product-price">{price}</p>
          <span className="catalog-card-cta" aria-hidden="true">Ver detalhes</span>
        </div>
      </div>
    </Link>
  )
}

function Vitrine() {
  const { products, status } = useCatalog()
  const [busca, setBusca] = useState(() => sessionStorage.getItem('catalogBusca') || '')
  const [categoria, setCategoria] = useState(() => sessionStorage.getItem('catalogCategoria') || 'Todos')
  const [limite, setLimite] = useState(getInitialCatalogLimit)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchActive, setSearchActive] = useState(() => Boolean(busca))
  const inputRef = useRef<HTMLInputElement>(null)
  const searchToggleRef = useRef<HTMLButtonElement>(null)
  const catalogEnd = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => { sessionStorage.setItem('catalogBusca', busca) }, [busca])
  useEffect(() => { sessionStorage.setItem('catalogCategoria', categoria) }, [categoria])
  useEffect(() => { sessionStorage.setItem('catalogLimite', limite.toString()) }, [limite])

  useEffect(() => {
    const shouldRestore = sessionStorage.getItem(CATALOG_RESTORE_KEY) === 'true'
    const savedScrollY = Number.parseInt(sessionStorage.getItem(CATALOG_SCROLL_KEY) || '', 10)

    if (!shouldRestore || !Number.isFinite(savedScrollY)) {
      sessionStorage.removeItem(CATALOG_SCROLL_KEY)
      sessionStorage.removeItem(CATALOG_RESTORE_KEY)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      return
    }

    let cancelled = false
    let frameId = 0
    let timeoutId = 0
    let attempts = 0

    const restoreScrollPosition = () => {
      if (cancelled) return

      const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const targetScroll = Math.min(savedScrollY, maximumScroll)
      window.scrollTo({ top: targetScroll, left: 0, behavior: 'instant' })
      attempts += 1

      const pageCanReachSavedPosition = maximumScroll >= savedScrollY - 2
      const positionWasRestored = Math.abs(window.scrollY - savedScrollY) <= 2

      if ((pageCanReachSavedPosition && positionWasRestored) || attempts >= 12) {
        sessionStorage.removeItem(CATALOG_SCROLL_KEY)
        sessionStorage.removeItem(CATALOG_RESTORE_KEY)
        return
      }

      timeoutId = window.setTimeout(restoreScrollPosition, 60)
    }

    frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(restoreScrollPosition)
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  const categorias = useMemo(() => {
    const options = products.filter(product => product.disponivel !== false).flatMap(product => product.categoria)
    return ['Todos', ...new Set(options)]
  }, [products])
  const activeCategory = categorias.includes(categoria) ? categoria : 'Todos'
  const filtrados = useMemo(() => {
    const terms = normalizeSearch(busca).split(/\s+/).filter(Boolean)
    return products.filter(product => {
      if (product.disponivel === false) return false
      const categories = [product.categoria].flat()
      const searchable = normalizeSearch([product.nome, product.fichaTecnica?.Marca, ...categories].join(' '))
      return (activeCategory === 'Todos' || categories.includes(activeCategory)) &&
        terms.every(term => searchable.includes(term))
    })
  }, [activeCategory, busca, products])
  const mostrar = filtrados.slice(0, limite)
  const hasMore = limite < filtrados.length

  useEffect(() => {
    setLoadingMore(false)
    const end = catalogEnd.current
    if (!end || !hasMore) return

    if (typeof IntersectionObserver === 'undefined') {
      setLimite(filtrados.length)
      return
    }

    let loadTimer: number | undefined
    const observer = new IntersectionObserver(entries => {
      if (loadTimer !== undefined || !entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      setLoadingMore(true)
      loadTimer = window.setTimeout(() => {
        setLimite(current => Math.min(current + CATALOG_BATCH_SIZE, filtrados.length))
        setLoadingMore(false)
      }, 500)
    }, { rootMargin: '0px 0px -64px' })

    observer.observe(end)
    return () => {
      observer.disconnect()
      window.clearTimeout(loadTimer)
    }
  }, [activeCategory, busca, filtrados.length, hasMore, limite])

  const changeSearch = (value: string) => {
    setBusca(value)
    setLimite(CATALOG_BATCH_SIZE)
  }

  const openSearch = () => {
    flushSync(() => setSearchActive(true))
    inputRef.current?.focus({ preventScroll: true })
  }

  const closeSearch = () => {
    changeSearch('')
    setSearchActive(false)
    searchToggleRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className="catalog-list-page">
      <div className="wrap">
        <section className="catalog-hero" aria-labelledby="catalog-title">
          <div className="catalog-hero-media" aria-hidden="true">
            <img src="/images/Capitolio/FOTO%202.webp" alt="" fetchPriority="high" decoding="async" />
          </div>
          <motion.div
            className="catalog-hero-content"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.38, ease: catalogEase }}
          >
            <h1 id="catalog-title">Equipamentos<br />para jet ski</h1>
            <p>Âncoras, coletes e acessórios para sua próxima saída.</p>
            <a className="catalog-hero-link" href="#catalogo-produtos">
              Explorar produtos <ArrowDown size={15} aria-hidden="true" />
            </a>
          </motion.div>
        </section>
      </div>

      <section id="catalogo-produtos" className="wrap catalog-results" aria-labelledby="catalog-results-title" tabIndex={-1}>
        <div className="catalog-toolbar">
          <div
            className="catalog-search"
            role="search"
            data-active={searchActive}
            onKeyDown={event => {
              if (event.key === 'Escape' && searchActive) {
                event.preventDefault()
                closeSearch()
              }
            }}
          >
            <button
              ref={searchToggleRef}
              type="button"
              className="catalog-search-toggle"
              aria-label={searchActive ? 'Limpar e fechar busca' : 'Abrir busca'}
              aria-controls="catalog-search-fields"
              aria-expanded={searchActive}
              onClick={searchActive ? closeSearch : openSearch}
            >
              <Search className="catalog-search-lens" size={19} strokeWidth={1.75} aria-hidden="true" />
              <X className="catalog-search-cross" size={21} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <div id="catalog-search-fields" className="catalog-search-fields" inert={!searchActive}>
              <label htmlFor="catalog-search-input" className="sr-only">Buscar produtos</label>
              <input
                ref={inputRef}
                id="catalog-search-input"
                type="search"
                value={busca}
                onChange={event => changeSearch(event.target.value)}
                placeholder="Buscar por nome ou marca"
                autoComplete="off"
              />
              {busca && (
                <button
                  type="button"
                  className="catalog-search-clear"
                  onClick={() => { changeSearch(''); inputRef.current?.focus() }}
                  aria-label="Limpar busca"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
          <div className="catalog-filters" role="group" aria-label="Filtrar por categoria">
            {categorias.map(category => (
              <button type="button" key={category} className="catalog-filter-chip"
                aria-pressed={activeCategory === category}
                onClick={() => { setCategoria(category); setLimite(CATALOG_BATCH_SIZE) }}
              >
                {activeCategory === category && (
                  <motion.span className="catalog-filter-indicator"
                    layoutId={reduceMotion ? undefined : 'catalog-filter-indicator'}
                    transition={{ duration: reduceMotion ? 0 : 0.24, ease: catalogEase }}
                    aria-hidden="true" />
                )}
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-results-header">
          <h2 id="catalog-results-title">{activeCategory === 'Todos' ? 'Todos os produtos' : activeCategory}</h2>
          {status === 'ready' && <span role="status">{filtrados.length} {filtrados.length === 1 ? 'produto' : 'produtos'}</span>}
        </div>

        {mostrar.length ? (
          <div className="catalog-grid">
            <AnimatePresence initial={false} mode="popLayout">
              {mostrar.map((product, index) => (
                <motion.article key={product.id} layout={reduceMotion ? false : 'position'}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: catalogEase }}
                >
                  <CardProduto produto={product} priority={index < 3} />
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        ) : status !== 'ready' || products.length === 0 ? (
          <div className="catalog-empty" role="status">
            <h3>{status === 'loading' ? 'Consultando estoque…' :
              status === 'unavailable' ? 'Estoque em atualização' : 'Nenhum produto disponível no momento'}</h3>
            {status === 'unavailable' && <p>Volte em alguns instantes para conferir os produtos disponíveis.</p>}
          </div>
        ) : (
          <div className="catalog-empty">
            <h3>Nenhum produto encontrado</h3>
            <p>Experimente outro termo ou veja todas as categorias.</p>
            <button type="button" onClick={() => { changeSearch(''); setCategoria('Todos'); openSearch() }}>
              Limpar filtros
            </button>
          </div>
        )}

        {hasMore && (
          <div ref={catalogEnd} className="catalog-end" role="status">
            {loadingMore && (
              <>
                <span className="catalog-loading-ring" aria-hidden="true" />
                <span className="sr-only">Carregando mais produtos…</span>
              </>
            )}
          </div>
        )}
      </section>

      <ScrollToTopButton />
    </div>
  )
}

/* ─── Detalhe Produto ────────────────────────────────────────────── */
function DetalheProduto() {
  const { id }                        = useParams()
  const navigate                      = useNavigate()

  const voltarParaVitrine = () => {
    const veioDaVitrine = sessionStorage.getItem(CATALOG_RESTORE_KEY) === 'true'
    if (veioDaVitrine) {
      navigate(-1)
      return
    }

    navigate('/catalogo')
  }

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  const { products, status } = useCatalog()
  const produto = products.find(product => String(product.id) === id)
  const navigationSlot = useRef<HTMLDivElement>(null)
  const [backPinned, setBackPinned] = useState(false)

  useEffect(() => {
    const slot = navigationSlot.current
    if (!slot) return

    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    const headerInset = 4.7 * rem + 1
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.rootBounds) setBackPinned(entry.boundingClientRect.top < entry.rootBounds.top)
    }, { rootMargin: '-' + headerInset + 'px 0px 0px', threshold: 1 })

    observer.observe(slot)
    return () => observer.disconnect()
  }, [produto])

  const [optionId, setOptionId] = useState('')
  const stockOptions = produto?.opcoesEstoque ?? []
  const chosenOption = stockOptions.find(option => option.id === optionId) ??
    stockOptions.find(option => option.price === produto?.preco) ?? stockOptions[0]
  const [imgAtiva, setImgAtiva]       = useState(0)
  const [direction, setDirection]     = useState(0)
  const [selecoes, setSelecoes]       = useState<Record<string, string>>({})
  const [zoomAberto, setZoomAberto]   = useState(false)
  const [zoomIn, setZoomIn]           = useState(false)
  const [mouse, setMouse]             = useState({ x: 50, y: 50 })

  const variacoes = useMemo(() => {
    if (!produto?.variacoes) return []
    return Object.entries(produto.variacoes).map(([nome, opcoes]) => ({
      nome,
      opcoes: Array.isArray(opcoes) ? opcoes : [String(opcoes)],
    }))
  }, [produto])

  const nomeCor     = variacoes.find(v => v.nome.toLowerCase().includes('cor'))?.nome
  const nomeTamanho = variacoes.find(v => v.nome.toLowerCase().includes('tamanho'))?.nome
  const nomeLente   = variacoes.find(v => v.nome.toLowerCase().includes('lente'))?.nome

  const corAtual = nomeCor
    ? (selecoes[nomeCor] || variacoes.find(v => v.nome === nomeCor)?.opcoes[0] || null)
    : null

  const variacoesExibidas = useMemo(() =>
    variacoes.map(v => {
      if (v.nome === nomeTamanho && corAtual && produto?.tamanhosPorCor?.[corAtual])
        return { ...v, opcoes: produto.tamanhosPorCor[corAtual] }
      if (v.nome === nomeLente && corAtual && produto?.lentesPorCor?.[corAtual])
        return { ...v, opcoes: produto.lentesPorCor[corAtual] }
      return v
    }), [variacoes, corAtual, nomeTamanho, nomeLente, produto])

  useEffect(() => {
    if (nomeTamanho && corAtual && produto?.tamanhosPorCor?.[corAtual]) {
      const validos  = produto.tamanhosPorCor[corAtual]
      const atual    = selecoes[nomeTamanho] || variacoes.find(v => v.nome === nomeTamanho)?.opcoes[0]
      if (atual && !validos.includes(atual))
        setSelecoes(p => ({ ...p, [nomeTamanho]: validos[0] }))
    }
    if (nomeLente && corAtual && produto?.lentesPorCor?.[corAtual]) {
      const validos  = produto.lentesPorCor[corAtual]
      const atual    = selecoes[nomeLente] || variacoes.find(v => v.nome === nomeLente)?.opcoes[0]
      if (atual && !validos.includes(atual))
        setSelecoes(p => ({ ...p, [nomeLente]: validos[0] }))
    }
  }, [corAtual, id]) // eslint-disable-line

  const variantImages = corAtual ? produto?.imagensPorCor?.[corAtual] : undefined
  const imagens = (variantImages ?? produto?.imagens ?? []).filter(src => src && !src.includes('via.placeholder.com'))
  const activeImage = imagens[imgAtiva] ?? imagens[0]

  useEffect(() => { setImgAtiva(0) }, [corAtual])

  if (!produto && status === 'loading') {
    return <div className="catalog-detail-status" role="status">Carregando produto…</div>
  }

  if (status === 'unavailable') {
    return <div className="catalog-detail-status" role="status">Estoque em atualização. Volte em alguns instantes.</div>
  }

  if (!produto || produto.disponivel === false) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: '#F7F7F5' }}>
        <h2 className="display" style={{ fontSize: '2.5rem', color: '#0A0A0A' }}>PRODUTO INDISPONÍVEL</h2>
        <p style={{ color: '#777' }}>Este produto foi removido ou está fora de estoque.</p>
        <button onClick={voltarParaVitrine} className="btn-outline">Voltar para o catálogo</button>
      </main>
    )
  }

  const mudarImagem = (acao: 'next' | 'prev' | number) => {
    setZoomIn(false)
    if (acao === 'next')      { setDirection(1);  setImgAtiva(p => (p + 1) % imagens.length) }
    else if (acao === 'prev') { setDirection(-1); setImgAtiva(p => (p - 1 + imagens.length) % imagens.length) }
    else { setDirection(acao > imgAtiva ? 1 : -1); setImgAtiva(acao) }
  }

  const waBase = produto.linkwhatsapp || produto.linkWhatsapp || 'https://wa.me/5511964467000'
  let variaveisTexto = ''
  if (corAtual) variaveisTexto += ` na cor ${corAtual}`
  const tamSel   = selecoes[nomeTamanho || ''] || variacoesExibidas.find(v => v.nome === nomeTamanho)?.opcoes[0] || ''
  const lenteSel = selecoes[nomeLente   || ''] || variacoesExibidas.find(v => v.nome === nomeLente)?.opcoes[0]   || ''
  if (tamSel && tamSel !== 'Único') variaveisTexto += `, tamanho ${tamSel}`
  if (lenteSel) variaveisTexto += `, lente ${lenteSel}`
  if (chosenOption) variaveisTexto = ' — ' + chosenOption.label
  const selectedPrice = chosenOption ? chosenOption.price : produto.preco
  const consultPrice = selectedPrice === null
  const intent = consultPrice ? 'Gostaria de consultar o preço de' : 'Tenho interesse no produto:'
  const waLink = `${waBase}${waBase.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Olá! ${intent} ${produto.nome}${variaveisTexto}`)}`
  const mlLink = consultPrice ? undefined : produto.linkMercadoLivre

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
    center: { x: 0, opacity: 1, zIndex: 1 },
    exit:   (d: number) => ({ x: d < 0 ? 36 : -36, opacity: 0, zIndex: 0 }),
  }

  return (
    <>
      <main className="catalog-detail-page">
        <div className="wrap">
          <div ref={navigationSlot} className="catalog-detail-navigation-slot">
            <nav className="catalog-detail-navigation" data-pinned={backPinned} aria-label="Navegação do produto">
              <button type="button" className="catalog-back-button" onClick={voltarParaVitrine}>
                <ArrowLeft size={17} aria-hidden="true" />
                <span>Voltar à vitrine</span>
              </button>
              <div className="catalog-breadcrumb" aria-label="Localização atual">
                <span>Catálogo</span>
                <span aria-hidden="true">/</span>
                <span>{Array.isArray(produto.categoria) ? produto.categoria[0] : produto.categoria}</span>
              </div>
            </nav>
          </div>

          <div className="catalog-detail-grid">

            {/* Galeria */}
            <motion.div
              className="catalog-detail-gallery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="catalog-thumbnail-list" aria-label="Imagens do produto">
                {imagens.map((src, i) => (
                  <button
                    className={`catalog-thumbnail${i === imgAtiva ? ' is-active' : ''}`}
                    key={i}
                    onMouseEnter={() => mudarImagem(i)}
                    onClick={() => mudarImagem(i)}
                    aria-label={`Ver imagem ${i + 1} de ${imagens.length}`}
                    aria-pressed={i === imgAtiva}
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
                  </button>
                ))}
              </div>

              <div
                className="catalog-detail-media"
              >
                {activeImage ? (
                  <>
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.img
                        className="catalog-detail-main-image"
                        key={activeImage}
                        src={activeImage}
                        alt={produto.nome}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: 0 }}
                        draggable={false}
                      />
                    </AnimatePresence>

                    <button
                      type="button"
                      className="catalog-media-zoom-target"
                      onClick={() => setZoomAberto(true)}
                      aria-label={`Ampliar imagem de ${produto.nome}`}
                    />
                  </>
                ) : (
                  <div className="catalog-detail-photo-missing">
                    <ImageOff size={30} strokeWidth={1.4} aria-hidden="true" />
                    Foto indisponível
                  </div>
                )}

                {imagens.length > 1 && (
                  <div className="catalog-gallery-controls" aria-label="Navegação da galeria">
                    <button
                      type="button"
                      aria-label="Imagem anterior"
                      onClick={event => {
                        event.stopPropagation()
                        mudarImagem('prev')
                      }}
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <span>{imgAtiva + 1} / {imagens.length}</span>
                    <button
                      type="button"
                      aria-label="Próxima imagem"
                      onClick={event => {
                        event.stopPropagation()
                        mudarImagem('next')
                      }}
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                )}

                {activeImage && (
                  <span className="catalog-zoom-hint" aria-hidden="true">
                    <ZoomIn size={15} />
                    Ampliar
                  </span>
                )}
              </div>
            </motion.div>

            {/* Info produto */}
            <motion.div
              className="catalog-detail-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="catalog-detail-category">
                {Array.isArray(produto.categoria) ? produto.categoria[0] : produto.categoria}
              </span>

              <h1 className="catalog-detail-title">
                {produto.nome}
              </h1>

              <p className="catalog-detail-price">
                {formatCatalogPrice(selectedPrice)}
              </p>

              {chosenOption && (
                <label className="catalog-stock-option">
                  Variações disponíveis
                  <select value={chosenOption.id} onChange={event => setOptionId(event.target.value)}>
                    {stockOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </label>
              )}

              {!chosenOption && variacoesExibidas.length > 0 && (
                <div className="catalog-variations">
                  {variacoesExibidas.map(v => {
                    const sel = selecoes[v.nome] || v.opcoes[0]
                    return (
                      <div className="catalog-variation-group" key={v.nome}>
                        <p className="catalog-variation-label">
                          <span>{v.nome}</span>
                          <strong>{sel}</strong>
                        </p>
                        <div className="catalog-variation-options">
                          {v.opcoes.map((opcao: string) => {
                            const ativo = sel === opcao
                            return (
                              <button
                                className={`catalog-variation-option${ativo ? ' is-active' : ''}`}
                                key={opcao}
                                onClick={() => setSelecoes(p => ({ ...p, [v.nome]: opcao }))}
                                aria-pressed={ativo}
                              >
                                {opcao}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <section className="catalog-purchase-panel" aria-labelledby="catalog-purchase-title">
                <div className="catalog-purchase-heading">
                  <span className="catalog-purchase-kicker">{consultPrice ? 'Atendimento' : 'Comprar agora'}</span>
                  <h2 id="catalog-purchase-title">{consultPrice ? 'Consulte o preço pelo WhatsApp' : 'Escolha onde comprar.'}</h2>
                </div>

                <div className="catalog-purchase-options">
                  <a
                    href={waLink} target="_blank" rel="noopener noreferrer"
                    className="catalog-purchase-card catalog-purchase-card-whatsapp"
                    aria-label={consultPrice ? 'Consultar preço pelo WhatsApp' :
                      mlLink ? 'Comprar pelo WhatsApp com até 8% OFF no PIX' : 'Consultar e comprar pelo WhatsApp'}
                  >
                    <span className="catalog-purchase-brand catalog-purchase-brand-whatsapp" aria-hidden="true">
                      <WhatsappIcon />
                    </span>
                    <strong>WhatsApp</strong>
                    {mlLink && (
                      <span className="catalog-purchase-offer">
                        <BadgePercent size={13} aria-hidden="true" />
                        <span>Até 8% OFF no PIX</span>
                      </span>
                    )}
                    <span className="catalog-purchase-arrow" aria-hidden="true">
                      <ExternalLink size={17} />
                    </span>
                  </a>

                  {mlLink && (
                    <a
                      href={mlLink} target="_blank" rel="noopener noreferrer"
                      className="catalog-purchase-card catalog-purchase-card-marketplace"
                      aria-label="Comprar pelo Mercado Livre"
                    >
                      <span className="catalog-purchase-brand catalog-purchase-brand-marketplace" aria-hidden="true">
                        <img
                          src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__small@2x.png"
                          alt=""
                        />
                      </span>
                      <strong>Mercado Livre</strong>
                      <span className="catalog-purchase-arrow" aria-hidden="true">
                        <ExternalLink size={17} />
                      </span>
                    </a>
                  )}
                </div>
              </section>
            </motion.div>
          </div>

          <motion.section
            className="catalog-product-description"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="catalog-product-content-grid">
              <article className="catalog-content-block">
                <span className="catalog-content-index">01</span>
                <h2>Sobre o produto</h2>
                <p className="catalog-description-copy">
                  {produto.descricao || 'Nenhuma descrição disponível.'}
                </p>
              </article>

              {produto.fichaTecnica && Object.keys(produto.fichaTecnica).length > 0 && (
                <article className="catalog-content-block catalog-specifications">
                  <span className="catalog-content-index">02</span>
                  <h2>Especificações técnicas</h2>
                  <dl className="catalog-spec-list">
                    {Object.entries(produto.fichaTecnica).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value as React.ReactNode}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              )}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Modal zoom */}
      {zoomAberto && activeImage && (
        <div
          onClick={() => { setZoomAberto(false); setZoomIn(false) }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button
            onClick={e => { e.stopPropagation(); setZoomAberto(false); setZoomIn(false) }}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              width: '2.5rem', height: '2.5rem',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FF7B00' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)' }}
          >
            <X size={16} />
          </button>

          {(['prev', 'next'] as const).map(acao => (
            <button key={acao}
              onClick={e => { e.stopPropagation(); mudarImagem(acao) }}
              style={{
                position: 'absolute', top: '50%',
                [acao === 'prev' ? 'left' : 'right']: '1.5rem',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.5rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)' }}
            >
              {acao === 'prev' ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
            </button>
          ))}

          <div
            onClick={e => { e.stopPropagation(); setZoomIn(p => !p) }}
            onMouseMove={e => {
              if (!zoomIn) return
              const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
              setMouse({ x: ((e.pageX - left) / width) * 100, y: ((e.pageY - top) / height) * 100 })
            }}
            style={{
              width: '90vw', maxWidth: '900px', height: '85vh',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', cursor: zoomIn ? 'zoom-out' : 'zoom-in',
              position: 'relative',
            }}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={activeImage}
                src={activeImage}
                alt={produto.nome}
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  position: 'absolute',
                  transform: zoomIn ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${mouse.x}% ${mouse.y}%`,
                  transition: 'transform 0.3s ease-out',
                }}
                draggable={false}
              />
            </AnimatePresence>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </>
  )
}

/* ─── Export ─────────────────────────────────────────────────────── */
export default function Catalog() {
  return (
    <Routes>
      <Route index element={<Vitrine />} />
      <Route path="produto/:id" element={<DetalheProduto />} />
    </Routes>
  )
}
