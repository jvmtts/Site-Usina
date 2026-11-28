import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  BrowserRouter as Router,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  type Location,
} from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { CatalogProvider } from './catalog/CatalogProvider'
import { ShopProvider } from './shop/ShopProvider'
import RouteSweep, { ROUTE_SWEEP_LOGO } from './components/RouteSweep'
import Home from './pages/Home'
import { EXPEDITION_PATH, MONTE_VERDE_ARCHIVE, MONTE_VERDE_PATH, REGISTRATION_PATH } from './config/routes'
import { scrollToSection } from './utils/scrollToSection'

const pageImports = {
  '/expedicoes': () => import('./pages/Expeditions'),
  '/catalogo': () => import('./pages/Catalog'),
  '/contato': () => import('./pages/Contact'),
  [EXPEDITION_PATH]: () => import('./pages/UpcomingExpedition'),
}

const Expeditions = lazy(pageImports['/expedicoes'])
const Catalog = lazy(pageImports['/catalogo'])
const Contact = lazy(pageImports['/contato'])
const AccountPage = lazy(() => import('./shop/AccountPage'))
const CartPage = lazy(() => import('./shop/CartPage'))
const UpcomingExpedition = lazy(pageImports[EXPEDITION_PATH])
const MAIN_ROUTES = new Set(['/', '/expedicoes', '/catalogo', '/contato', EXPEDITION_PATH])

type RoutePhase = 'idle' | 'covering' | 'revealing'

function routeSection(pathname: string) {
  return pathname.split('/')[1]
}
const CATALOG_SCROLL_KEY = 'catalogScrollY'
const CATALOG_RESTORE_KEY = 'catalogRestorePending'

function ScrollToTop({ pathname, hash }: Pick<Location, 'pathname' | 'hash'>) {
  useLayoutEffect(() => {
    const shouldRestoreCatalog =
      pathname === '/catalogo' &&
      sessionStorage.getItem(CATALOG_RESTORE_KEY) === 'true'

    if (shouldRestoreCatalog) return

    if (!pathname.startsWith('/catalogo')) {
      sessionStorage.removeItem(CATALOG_SCROLL_KEY)
      sessionStorage.removeItem(CATALOG_RESTORE_KEY)
    }

    if (hash && pathname !== '/conta/confirmar') {
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

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
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
  location: Location
  insideSweep: boolean
  introActive: boolean
  heroContentVisible: boolean
  onIntroContentReveal: () => void
  onIntroComplete: () => void
}

function AnimatedRoutes({
  location,
  insideSweep,
  introActive,
  heroContentVisible,
  onIntroContentReveal,
  onIntroComplete,
}: AnimatedRoutesProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      key={location.pathname}
      className="route-frame"
      initial={reduceMotion || insideSweep ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
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
          <Route path={EXPEDITION_PATH} element={<UpcomingExpedition />} />
          <Route path={MONTE_VERDE_PATH} element={<Navigate to={MONTE_VERDE_ARCHIVE} replace />} />
          <Route path={REGISTRATION_PATH} element={<Navigate to={MONTE_VERDE_ARCHIVE} replace />} />
          <Route path="/inscricao" element={<Navigate to={EXPEDITION_PATH} replace />} />
          <Route path="/expedicoes/campos-do-jordao-2026" element={<Navigate to="/expedicoes#campos-do-jordao-2026" replace />} />
          <Route path="/expedicoes/campos-do-jordao-2026/inscricao" element={<Navigate to="/expedicoes#campos-do-jordao-2026" replace />} />
          <Route path="/catalogo/*" element={<Catalog />} />
          <Route path="/conta/*" element={<AccountPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </motion.div>
  )
}

function AppShell() {
  const location = useLocation()
  const { pathname, search } = location
  const reduceMotion = useReducedMotion()
  const [displayedLocation, setDisplayedLocation] = useState(location)
  const [routePhase, setRoutePhase] = useState<RoutePhase>('idle')
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

  useLayoutEffect(() => {
    if (reduceMotion) {
      setDisplayedLocation(location)
      setRoutePhase('idle')
      return
    }

    if (routePhase !== 'idle' || location === displayedLocation) return

    if (
      introPhase === 'complete' &&
      MAIN_ROUTES.has(location.pathname) &&
      routeSection(location.pathname) !== routeSection(displayedLocation.pathname)
    ) {
      setRoutePhase('covering')
      return
    }

    setDisplayedLocation(location)
  }, [displayedLocation, introPhase, location, reduceMotion, routePhase])

  useEffect(() => {
    if (reduceMotion) return
    const logo = new Image()
    logo.fetchPriority = 'low'
    logo.src = ROUTE_SWEEP_LOGO
  }, [reduceMotion])

  useEffect(() => {
    if (routePhase !== 'covering') return
    const preload = pageImports[pathname as keyof typeof pageImports]
    if (preload) void preload().catch(() => undefined)
  }, [pathname, routePhase])

  const commitDestination = () => {
    setDisplayedLocation(location)
    setRoutePhase('revealing')
  }

  const transitioning = routePhase !== 'idle' && !reduceMotion

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <ScrollToTop pathname={displayedLocation.pathname} hash={displayedLocation.hash} />
      <Navbar revealed={homeContentVisible} />
      {transitioning && (
        <RouteSweep
          phase={routePhase === 'covering' ? 'covering' : 'revealing'}
          onCovered={commitDestination}
          onRevealed={() => setRoutePhase('idle')}
        />
      )}
      <main id="main-content" className="app-main" tabIndex={-1}>
        <AnimatedRoutes
          location={displayedLocation}
          insideSweep={transitioning}
          introActive={homeIntroActive}
          heroContentVisible={homeContentVisible}
          onIntroContentReveal={revealHomeContent}
          onIntroComplete={completeHomeIntro}
        />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <CatalogProvider>
        <ShopProvider>
          <AppShell />
        </ShopProvider>
      </CatalogProvider>
    </Router>
  )
}
