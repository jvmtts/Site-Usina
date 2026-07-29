import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface BrandIntroProps {
  onContentReveal: () => void
  onComplete: () => void
}

const INTRO_TIMING = {
  contentReveal: 3850,
  complete: 4120,
  reducedComplete: 180,
} as const

export default function BrandIntro({ onContentReveal, onComplete }: BrandIntroProps) {
  const reduceMotion = useReducedMotion()
  const finishedRef = useRef(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const finish = () => {
      if (finishedRef.current) return
      finishedRef.current = true
      onContentReveal()
      onComplete()
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }

    window.addEventListener('keydown', handleEscape)

    if (reduceMotion) {
      onContentReveal()
      const completeTimer = window.setTimeout(finish, INTRO_TIMING.reducedComplete)

      return () => {
        window.clearTimeout(completeTimer)
        window.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = previousOverflow
      }
    }

    const contentTimer = window.setTimeout(onContentReveal, INTRO_TIMING.contentReveal)
    const completeTimer = window.setTimeout(finish, INTRO_TIMING.complete)

    return () => {
      window.clearTimeout(contentTimer)
      window.clearTimeout(completeTimer)
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onComplete, onContentReveal, reduceMotion])

  if (reduceMotion) {
    return (
      <motion.div
        className="brand-intro brand-intro-reduced"
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
    )
  }

  return (
    <div className="brand-intro" aria-hidden="true">
      <motion.div
        className="brand-intro-curtain"
        initial={{ y: '0%' }}
        animate={{ y: '-122%' }}
        transition={{
          duration: 1.08,
          delay: 2.38,
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        <motion.div
          className="brand-intro-lockup"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.42, delay: 2.24, ease: 'easeOut' }}
        >
          <div className="brand-intro-logo-mask">
            <motion.img
              src="/images/Usina-logo-Preto.png"
              alt=""
              initial={{ opacity: 0, y: '105%', scale: 0.93 }}
              animate={{ opacity: 1, y: '0%', scale: 1 }}
              transition={{ duration: 0.98, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <motion.span
            className="brand-intro-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.72, delay: 0.92, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.p
            className="mono"
            initial={{ opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 1.18 }}
          >
            Expedições pelo Brasil · Desde 2018
          </motion.p>
        </motion.div>

        <div className="brand-intro-curve" />
      </motion.div>
    </div>
  )
}
