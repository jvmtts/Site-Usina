import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'

/**
 * Elemento de assinatura da landing: uma "trilha" vertical pontilhada
 * (referência a trajeto de GPS / mapa topográfico) que corre ao lado
 * do conteúdo. Conforme a pessoa rola a página, a trilha se preenche
 * em laranja e um marcador circular "anda" por ela — como se a rolagem
 * fosse o próprio percurso da expedição.
 *
 * Só aparece em telas grandes (lg:) pra não competir com o conteúdo no mobile.
 * Envolva as seções do meio da página (Sobre / Galeria / Incluso) com este componente.
 */
export default function TrailLine({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] })
  const progress = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.5 })
  const dotTop = useTransform(progress, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`)
  const lineHeight = useTransform(progress, (v) => `${Math.min(Math.max(v, 0), 1) * 100}%`)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trilho pontilhado (trajeto completo, cinza) */}
      <div
        className="hidden lg:block"
        aria-hidden
        style={{
          position: 'absolute', left: 'clamp(1.5rem, 4vw, 3.5rem)', top: 0, bottom: 0, width: '2px',
          backgroundImage: 'repeating-linear-gradient(to bottom, #DEDEDE 0, #DEDEDE 6px, transparent 6px, transparent 15px)',
          zIndex: 0,
        }}
      />
      {/* Trilho percorrido (laranja, cresce com o scroll) */}
      <motion.div
        className="hidden lg:block"
        aria-hidden
        style={{
          position: 'absolute', left: 'clamp(1.5rem, 4vw, 3.5rem)', top: 0,
          width: '2px', height: lineHeight,
          background: '#FF7B00', zIndex: 1,
        }}
      />
      {/* Marcador de posição */}
      <motion.div
        className="hidden lg:block"
        aria-hidden
        style={{
          position: 'absolute', left: 'calc(clamp(1.5rem, 4vw, 3.5rem) - 5px)', top: dotTop,
          width: '12px', height: '12px', borderRadius: '50%', background: '#FF7B00',
          boxShadow: '0 0 0 5px rgba(255,123,0,0.15)', zIndex: 2,
        }}
      />
      {children}
    </div>
  )
}