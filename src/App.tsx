import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import { EXPEDITION_PATH, REGISTRATION_PATH } from './config/routes'
import { scrollToSection } from './utils/scrollToSection'

const Expeditions = lazy(() => import('./pages/Expeditions'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Contact = lazy(() => import('./pages/Contact'))
const ExpedicaoLanding = lazy(() => import('./pages/ExpedicaoLanding'))
const ExpedicaoForm = lazy(() => import('./pages/ExpedicaoForm'))

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const targetId = decodeURIComponent(hash.slice(1))
      let observer: MutationObserver | null = null
      let frameId = 0
      let settleTimeoutId = 0

      const scrollToTarget = () => {
        if (scrollToSection(targetId, 'auto')) {
          frameId = window.requestAnimationFrame(() => {
            scrollToSection(targetId, 'auto')

            settleTimeoutId = window.setTimeout(() => {
              scrollToSection(targetId, 'auto')
            }, 400)
          })
          observer?.disconnect()
          return true
        }

        return false
      }

      if (!scrollToTarget()) {
        observer = new MutationObserver(scrollToTarget)
        observer.observe(document.body, { childList: true, subtree: true })
      }

      const timeoutId = window.setTimeout(() => observer?.disconnect(), 5000)

      return () => {
        observer?.disconnect()
        window.cancelAnimationFrame(frameId)
        window.clearTimeout(settleTimeoutId)
        window.clearTimeout(timeoutId)
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [hash, pathname])

  return null
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Carregando página">
      <span className="sr-only">Carregando página</span>
      <div className="route-loader-mark" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <section className="route-not-found" aria-labelledby="not-found-title">
      <div className="wrap">
        <span className="eyebrow">Erro 404</span>
        <h1 id="not-found-title" className="display">Este caminho não existe.</h1>
        <p>O endereço pode ter mudado ou a página não está mais disponível.</p>
        <Link to="/" className="btn-dark">Voltar para a Home</Link>
      </div>
    </section>
  )
}

interface AnimatedRoutesProps {
  introActive: boolean
  heroContentVisible: boolean
  onIntroContentReveal: () => void
  onIntroComplete: () => void
}

function AnimatedRoutes({
  introActive,
  heroContentVisible,
  onIntroContentReveal,
  onIntroComplete,
}: AnimatedRoutesProps) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="route-frame"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<RouteLoading />}>
          <Routes location={location}>
            <Route
              path="/"
              element={(
                <Home
                  introActive={introActive}
                  heroContentVisible={heroContentVisible}
                  onIntroContentReveal={onIntroContentReveal}
                  onIntroComplete={onIntroComplete}
                />
              )}
            />
            <Route path="/expedicoes" element={<Expeditions />} />
            <Route path={EXPEDITION_PATH} element={<ExpedicaoLanding />} />
            <Route path={REGISTRATION_PATH} element={<ExpedicaoForm />} />
            <Route path="/inscricao" element={<ExpedicaoForm />} />
            <Route path="/catalogo/*" element={<Catalog />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function AppShell() {
  const { pathname, search } = useLocation()
  const [introPhase, setIntroPhase] = useState<'intro' | 'content' | 'complete'>(() => {
    if (pathname !== '/') return 'complete'

    try {
      const forceReplay = new URLSearchParams(search).get('intro') === '1'
      const hasSeenIntro = window.sessionStorage.getItem('usina-home-intro-seen') === '1'
      return forceReplay || !hasSeenIntro ? 'intro' : 'complete'
    } catch {
      return 'intro'
    }
  })
  const isExpeditionFlow =
    pathname === EXPEDITION_PATH ||
    pathname === REGISTRATION_PATH ||
    pathname === '/inscricao'

  const revealHomeContent = useCallback(() => {
    setIntroPhase((current) => current === 'intro' ? 'content' : current)
  }, [])

  const completeHomeIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem('usina-home-intro-seen', '1')
    } catch {
      // A introdução continua funcional mesmo com o armazenamento bloqueado.
    }

    setIntroPhase('complete')
  }, [])

  useEffect(() => {
    if (pathname !== '/' && introPhase !== 'complete') {
      completeHomeIntro()
    }
  }, [completeHomeIntro, introPhase, pathname])

  const homeIntroActive = pathname === '/' && introPhase !== 'complete'
  const homeContentVisible = pathname !== '/' || introPhase !== 'intro'

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <ScrollToTop />
      <Navbar revealed={homeContentVisible} />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <AnimatedRoutes
          introActive={homeIntroActive}
          heroContentVisible={homeContentVisible}
          onIntroContentReveal={revealHomeContent}
          onIntroComplete={completeHomeIntro}
        />
      </main>
      {!isExpeditionFlow && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}
