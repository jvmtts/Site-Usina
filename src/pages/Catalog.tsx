import { useState, useEffect, useMemo, useRef } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgePercent, ChevronLeft, ChevronRight, ExternalLink, X, ArrowUp, Search, ZoomIn } from 'lucide-react'
import { produtos, type Produto } from '@/data/produtos'
import { motion, AnimatePresence } from 'framer-motion'
import './Catalog.css'

const CATALOG_BATCH_SIZE = 8
const CATALOG_SCROLL_KEY = 'catalogScrollY'
const CATALOG_RESTORE_KEY = 'catalogRestorePending'

const getInitialCatalogLimit = () => {
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

/* ─── Scroll to top ──────────────────────────────────────────────── */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <button
      className="catalog-scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50,
        width: '3rem', height: '3rem',
        background: '#FF7B00', color: '#fff',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(1rem)',
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: '0 4px 20px rgba(255,123,0,0.4)',
      }}
      aria-label="Voltar ao topo"
    >
      <ArrowUp size={18} />
    </button>
  )
}

/* ─── Card Produto ───────────────────────────────────────────────── */
function CardProduto({ produto }: { produto: Produto }) {
  const navigate                      = useNavigate()
  const [imgIdx, setImgIdx]           = useState(0)
  const [hovered, setHovered]         = useState(false)

  const imagens = useMemo(() => {
    if (produto.imagensPorCor && Object.keys(produto.imagensPorCor).length > 0)
      return Object.values(produto.imagensPorCor).map((f) => (f as string[])[0])
    if (produto.imagens?.length) return produto.imagens
    return ['https://via.placeholder.com/600x600?text=Sem+Foto']
  }, [produto])

  useEffect(() => {
    if (!hovered || imagens.length <= 1) return
    const id = setInterval(() => setImgIdx(p => (p + 1) % imagens.length), 1500)
    return () => clearInterval(id)
  }, [hovered, imagens.length])

  const categoria = Array.isArray(produto.categoria) ? produto.categoria[0] : produto.categoria

  const handleClick = () => {
    sessionStorage.setItem(CATALOG_SCROLL_KEY, window.scrollY.toString())
    sessionStorage.setItem(CATALOG_RESTORE_KEY, 'true')
    navigate(`/catalogo/produto/${produto.id}`)
  }

  return (
    <div
      className="catalog-product-card"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setImgIdx(0) }}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Ver detalhes de ${produto.nome}`}
      style={{
        background: '#fff',
        border: '1px solid #EBEBEB',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Imagem */}
      <div className="catalog-product-media" style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F7F7F5' }}>
        {imagens.map((src, i) => (
          <img
            className="catalog-product-image"
            key={i}
            src={src}
            alt={produto.nome}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'contain',
              objectPosition: 'center',
              padding: 0,
              transition: 'opacity 0.6s ease',
              opacity: i === imgIdx ? 1 : 0,
              zIndex: i === imgIdx ? 1 : 0,
            }}
          />
        ))}

        {/* Dots */}
        {imagens.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '50%',
            transform: `translateX(-50%) translateY(${hovered ? '0' : '0.5rem'})`,
            display: 'flex', gap: '5px',
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
            padding: '5px 10px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s, transform 0.3s',
            zIndex: 2,
          }}>
            {imagens.map((_, i) => (
              <div key={i} style={{
                height: '4px', borderRadius: '2px',
                background: i === imgIdx ? '#FF7B00' : '#DEDEDE',
                width: i === imgIdx ? '1.5rem' : '0.4rem',
                transition: 'all 0.35s',
              }} />
            ))}
          </div>
        )}

        {/* Badge categoria */}
        <div className="catalog-category-badge" style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          background: '#fff', padding: '0.3rem 0.75rem',
          border: '1px solid #EBEBEB', zIndex: 2,
        }}>
          <span className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#777' }}>
            {categoria}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="catalog-product-info" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        <h3 style={{
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
          fontSize: '0.95rem', color: '#0A0A0A', lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {produto.nome}
        </h3>
        <p className="display" style={{ fontSize: '1.5rem', color: '#0A0A0A', marginTop: 'auto', paddingTop: '0.5rem' }}>
          {typeof produto.preco === 'number'
            ? produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : produto.preco}
        </p>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <div className="catalog-card-cta" style={{
          width: '100%', padding: '0.75rem',
          border: '1.5px solid',
          borderColor: hovered ? '#FF7B00' : '#EBEBEB',
          color: hovered ? '#FF7B00' : '#0A0A0A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, color 0.2s',
        }}>
          <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Ver detalhes
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Vitrine ────────────────────────────────────────────────────── */
function Vitrine() {
  const [busca, setBusca]             = useState(() => sessionStorage.getItem('catalogBusca') || '')
  const [categoria, setCategoria]     = useState(() => sessionStorage.getItem('catalogCategoria') || 'Todos')
  const [lupaAberta, setLupaAberta]   = useState(() => sessionStorage.getItem('catalogLupa') === 'true')
  const [limite, setLimite]           = useState(getInitialCatalogLimit)
  const [loadingMais, setLoadingMais] = useState(false)
  const inputRef                      = useRef<HTMLInputElement>(null)

  useEffect(() => { sessionStorage.setItem('catalogBusca', busca) }, [busca])
  useEffect(() => { sessionStorage.setItem('catalogCategoria', categoria) }, [categoria])
  useEffect(() => { sessionStorage.setItem('catalogLupa', lupaAberta.toString()) }, [lupaAberta])
  useEffect(() => { sessionStorage.setItem('catalogLimite', limite.toString()) }, [limite])

  useEffect(() => {
    const shouldRestore = sessionStorage.getItem(CATALOG_RESTORE_KEY) === 'true'
    const savedScrollY = Number.parseInt(sessionStorage.getItem(CATALOG_SCROLL_KEY) || '', 10)

    if (!shouldRestore || !Number.isFinite(savedScrollY)) {
      sessionStorage.removeItem(CATALOG_SCROLL_KEY)
      sessionStorage.removeItem(CATALOG_RESTORE_KEY)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
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
      window.scrollTo({ top: targetScroll, left: 0, behavior: 'auto' })
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
    const set = new Set<string>()
    produtos.forEach((p) => {
      if (p.disponivel === false) return
      const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria]
      cats.forEach((c: string) => set.add(c))
    })
    return ['Todos', ...Array.from(set)]
  }, [])

  const filtrados = useMemo(() =>
    produtos.filter((p) => {
      if (p.disponivel === false) return false
      const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria]
      return (
        p.nome.toLowerCase().includes(busca.toLowerCase()) &&
        (categoria === 'Todos' || cats.includes(categoria))
      )
    }), [busca, categoria])

  const exibidos = filtrados.slice(0, limite)

  useEffect(() => {
    const fn = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 300
        >= document.documentElement.scrollHeight &&
        !loadingMais && limite < filtrados.length
      ) {
        setLoadingMais(true)
        setTimeout(() => { setLimite(p => p + CATALOG_BATCH_SIZE); setLoadingMais(false) }, 500)
      }
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [loadingMais, limite, filtrados.length])

  const handleCategoria = (cat: string) => {
    setCategoria(cat)
    setLimite(CATALOG_BATCH_SIZE)
  }

  const toggleLupa = () => {
    if (lupaAberta) {
      setLupaAberta(false)
      setBusca('')
    } else {
      setLupaAberta(true)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }

  return (
    <main style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Header escuro */}
      <section style={{
        background: '#0A0A0A',
        paddingTop: 'clamp(8rem,14vh,11rem)',
        paddingBottom: 'clamp(3rem,6vh,5rem)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <span className="display" style={{ fontSize: 'clamp(6rem,16vw,14rem)', color: 'rgba(255,255,255,0.025)', letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>
            CATÁLOGO
          </span>
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <motion.span className="eyebrow"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: '1rem' }}>
            Equipamentos de alta performance
          </motion.span>
          <motion.h1 className="display"
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(3.5rem, 9vw, 7.5rem)', color: '#fff', lineHeight: 0.9 }}>
            CATÁLOGO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: '420px', marginTop: '1.5rem', lineHeight: 1.75 }}>
            Âncoras, coletes, roupas e acessórios para sua aventura náutica.
          </motion.p>
        </div>
      </section>

      {/* Filtros + Lupa */}
      <section className="catalog-toolbar" style={{ borderBottom: '1px solid #EBEBEB', background: '#F7F7F5' }}>
        <div className="wrap" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

            {/* Categorias */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoria(cat)}
                  className={`mono catalog-filter-chip${categoria === cat ? ' is-active' : ''}`}
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: categoria === cat ? '#0A0A0A' : 'transparent',
                    color:      categoria === cat ? '#fff' : '#777',
                    border:     categoria === cat ? '1.5px solid #0A0A0A' : '1.5px solid #DEDEDE',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lupa expansível */}
            <div className={`catalog-search${lupaAberta ? ' is-open' : ''}`} style={{
              display: 'flex', alignItems: 'center',
              background: lupaAberta ? '#fff' : 'transparent',
              border: lupaAberta ? '1.5px solid #FF7B00' : '1.5px solid #DEDEDE',
              transition: 'all 0.35s ease',
              height: '2.75rem',
              width: lupaAberta ? 'clamp(200px, 28vw, 320px)' : '2.75rem',
              overflow: 'hidden',
            }}>
              <button
                onClick={toggleLupa}
                style={{
                  width: '2.75rem', height: '2.75rem', flexShrink: 0,
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: lupaAberta ? '#FF7B00' : '#777',
                  transition: 'color 0.2s',
                }}
              >
                {lupaAberta ? <X size={16} /> : <Search size={16} />}
              </button>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar produto..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setLimite(CATALOG_BATCH_SIZE) }}
                tabIndex={lupaAberta ? 0 : -1}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  width: '100%', paddingRight: '0.75rem',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
                  color: '#0A0A0A', opacity: lupaAberta ? 1 : 0,
                  transition: 'opacity 0.25s',
                }}
                onBlur={e => {
                  if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node) && busca === '')
                    setLupaAberta(false)
                }}
              />
            </div>
          </div>

          {/* Contador */}
          <p className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#BBBBBB', marginTop: '0.75rem' }}>
            {filtrados.length} produto{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="wrap" style={{ paddingTop: 'clamp(3rem,6vh,5rem)', paddingBottom: 'clamp(6rem,10vh,8rem)' }}>
        {exibidos.length === 0 ? (
          <div className="catalog-empty" style={{ textAlign: 'center', padding: '5rem 2rem', border: '1px dashed #EBEBEB' }}>
            <p className="display" style={{ fontSize: '2rem', color: '#DEDEDE', marginBottom: '1rem' }}>NENHUM RESULTADO</p>
            <p style={{ color: '#999', fontSize: '0.95rem' }}>Tente outro filtro ou limpe a busca.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="catalog-grid"
          >
            <AnimatePresence>
              {exibidos.map((p, index) => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 18, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.45, delay: Math.min(index % 9, 8) * 0.035, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CardProduto produto={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {loadingMais && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{
              width: '2rem', height: '2rem',
              border: '2px solid #EBEBEB',
              borderTop: '2px solid #FF7B00',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </section>

      <ScrollToTopButton />
    </main>
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

  const produto = produtos.find((p) => p.id === parseInt(id || '0'))

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

  let imagens: string[] = produto?.imagens?.length
    ? produto.imagens
    : ['https://via.placeholder.com/600x600?text=Sem+Foto']
  if (corAtual && produto?.imagensPorCor?.[corAtual])
    imagens = produto.imagensPorCor[corAtual]

  useEffect(() => { setImgAtiva(0) }, [corAtual])

  if (!produto || produto.disponivel === false) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', background: '#F7F7F5' }}>
        <h2 className="display" style={{ fontSize: '2.5rem', color: '#0A0A0A' }}>PRODUTO INDISPONÍVEL</h2>
        <p style={{ color: '#777' }}>Este produto foi removido ou está fora de estoque.</p>
        <button onClick={voltarParaVitrine} className="btn-outline">Voltar para o catálogo</button>
      </main>
    )
  }

  const formatarPreco = (p: string | number) =>
    typeof p === 'number'
      ? p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : p || 'R$ 0,00'

  const mudarImagem = (acao: 'next' | 'prev' | number) => {
    setZoomIn(false)
    if (acao === 'next')      { setDirection(1);  setImgAtiva(p => (p + 1) % imagens.length) }
    else if (acao === 'prev') { setDirection(-1); setImgAtiva(p => (p - 1 + imagens.length) % imagens.length) }
    else { setDirection(acao > imgAtiva ? 1 : -1); setImgAtiva(acao) }
  }

  const waBase = produto.linkwhatsapp || produto.linkWhatsapp || 'https://wa.me/5511999999999'
  let variaveisTexto = ''
  if (corAtual) variaveisTexto += ` na cor ${corAtual}`
  const tamSel   = selecoes[nomeTamanho || ''] || variacoesExibidas.find(v => v.nome === nomeTamanho)?.opcoes[0] || ''
  const lenteSel = selecoes[nomeLente   || ''] || variacoesExibidas.find(v => v.nome === nomeLente)?.opcoes[0]   || ''
  if (tamSel && tamSel !== 'Único') variaveisTexto += `, tamanho ${tamSel}`
  if (lenteSel) variaveisTexto += `, lente ${lenteSel}`
  const waLink = `${waBase}${waBase.includes('?') ? '&' : '?'}text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${produto.nome}${variaveisTexto}`)}`
  const mlLink = produto.linkMercadoLivre || 'https://www.mercadolivre.com.br'

  const slideVariants = {
    enter:  (d: number) => ({ x: d > 0 ? 36 : -36, opacity: 0 }),
    center: { x: 0, opacity: 1, zIndex: 1 },
    exit:   (d: number) => ({ x: d < 0 ? 36 : -36, opacity: 0, zIndex: 0 }),
  }

  return (
    <>
      <main className="catalog-detail-page">
        <div className="wrap">
          <nav className="catalog-detail-navigation" aria-label="Navegação do produto">
            <button className="catalog-back-button" onClick={voltarParaVitrine}>
              <ArrowLeft size={17} aria-hidden="true" />
              <span>Voltar à vitrine</span>
            </button>
            <div className="catalog-breadcrumb" aria-label="Localização atual">
              <span>Catálogo</span>
              <span aria-hidden="true">/</span>
              <span>{Array.isArray(produto.categoria) ? produto.categoria[0] : produto.categoria}</span>
            </div>
          </nav>

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
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    className="catalog-detail-main-image"
                    key={imagens[imgAtiva]}
                    src={imagens[imgAtiva]}
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

                <span className="catalog-zoom-hint" aria-hidden="true">
                  <ZoomIn size={15} />
                  Ampliar
                </span>
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
                {formatarPreco(produto.preco)}
              </p>

              {variacoesExibidas.length > 0 && (
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
                  <span className="catalog-purchase-kicker">Comprar agora</span>
                  <h2 id="catalog-purchase-title">Escolha onde comprar.</h2>
                </div>

                <div className="catalog-purchase-options">
                  <a
                    href={waLink} target="_blank" rel="noopener noreferrer"
                    className="catalog-purchase-card catalog-purchase-card-whatsapp"
                    aria-label="Comprar pelo WhatsApp com até 8% OFF no PIX"
                  >
                    <span className="catalog-purchase-brand catalog-purchase-brand-whatsapp" aria-hidden="true">
                      <WhatsappIcon />
                    </span>
                    <strong>WhatsApp</strong>
                    <span className="catalog-purchase-offer">
                      <BadgePercent size={13} aria-hidden="true" />
                      <span>Até 8% OFF no PIX</span>
                    </span>
                    <span className="catalog-purchase-arrow" aria-hidden="true">
                      <ExternalLink size={17} />
                    </span>
                  </a>

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
      {zoomAberto && (
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
                key={imagens[imgAtiva]}
                src={imagens[imgAtiva]}
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
