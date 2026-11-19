import type { CSSProperties } from 'react'
import { motion, type Variants } from 'framer-motion'

export const ROUTE_SWEEP_LOGO = '/images/Usina-logo-Preto.png'

const logoStyle = { '--route-sweep-logo': 'url("' + ROUTE_SWEEP_LOGO + '")' } as CSSProperties
const easeOut = [0.18, 0.72, 0.26, 1] as const
const fadeOut = [0.35, 0, 0.54, 1] as const
const fragments = [
  { clip: 'inset(0 0 58% 0)', offset: 42 },
  { clip: 'inset(41.75% 0 31.75% 0)', offset: -54 },
  { clip: 'inset(68% 0 0 0)', offset: 33 },
]

const scene = {
  start: { opacity: 0 },
  covering: {
    opacity: 1,
    transition: { duration: 0.39, ease: easeOut },
  },
  revealing: {
    opacity: [1, 1, 0],
    transition: { duration: 0.44, times: [0, 0.17, 1], ease: fadeOut },
  },
}

const camera = {
  start: { scale: 1.48, y: 10, rotate: -3, opacity: 0 },
  covering: {
    scale: 1, y: 0, rotate: 0, opacity: 1,
    transition: { duration: 0.37, ease: easeOut },
  },
  revealing: {
    scale: 1.24, y: -12, opacity: 0,
    transition: { duration: 0.41, ease: fadeOut },
  },
}

const slices = {
  start: (offset: number) => ({ x: offset, opacity: 0 }),
  covering: {
    x: 0, opacity: 1,
    transition: { duration: 0.36, ease: easeOut },
  },
}

const light = {
  start: { x: '-31%', opacity: 0 },
  covering: {
    x: '3%', opacity: 0.85,
    transition: { duration: 0.39, ease: easeOut },
  },
  revealing: {
    x: '27%', opacity: 0,
    transition: { duration: 0.40, ease: easeOut },
  },
}

const glint: Variants = {
  start: { backgroundPosition: '100% 0', opacity: 0 },
  covering: {
    backgroundPosition: '49% 0', opacity: 0.83,
    transition: { duration: 0.39, ease: 'linear' },
  },
  revealing: {
    backgroundPosition: '0% 0', opacity: 0,
    transition: { duration: 0.34, ease: 'easeOut' },
  },
}

interface RouteSweepProps {
  phase: 'covering' | 'revealing'
  onCovered: () => void
  onRevealed: () => void
}

export default function RouteSweep({ phase, onCovered, onRevealed }: RouteSweepProps) {
  return (
    <div className="route-sweep" aria-hidden="true" style={logoStyle}>
      <motion.div
        className="route-sweep-scene"
        initial="start"
        animate={phase}
        variants={scene}
        onAnimationComplete={(animation) => {
          if (animation === 'covering') onCovered()
          if (animation === 'revealing') onRevealed()
        }}
      >
        <motion.div className="route-sweep-light" variants={light} />
        <motion.div className="route-sweep-mark" variants={camera}>
          {fragments.map(({ clip, offset }) => (
            <motion.div
              key={clip}
              className="route-sweep-fragment"
              style={{ clipPath: clip }}
              custom={offset}
              variants={slices}
            />
          ))}
          <motion.div className="route-sweep-glint" variants={glint} />
        </motion.div>
      </motion.div>
    </div>
  )
}
