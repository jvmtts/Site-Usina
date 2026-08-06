import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface HeroMediaProps {
  videoSrc: string
  posterSrc: string
  posterAlt: string
}

interface NetworkInformation {
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

const VIDEO_START_TIMEOUT = 12_000

export default function HeroMedia({ videoSrc, posterSrc, posterAlt }: HeroMediaProps) {
  const reduceMotion = useReducedMotion()
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const saveData = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return Boolean((navigator as NavigatorWithConnection).connection?.saveData)
  }, [])
  const allowVideo = !reduceMotion && !saveData && !videoFailed

  useEffect(() => {
    if (!allowVideo || videoReady) return

    const timeout = window.setTimeout(() => {
      setVideoFailed(true)
    }, VIDEO_START_TIMEOUT)

    return () => window.clearTimeout(timeout)
  }, [allowVideo, videoReady, videoSrc])

  const startVideo = async (video: HTMLVideoElement) => {
    try {
      await video.play()
      setVideoReady(true)
    } catch {
      setVideoReady(false)
      setVideoFailed(true)
    }
  }

  return (
    <div className="hero-media-stack">
      {posterFailed ? (
        <div
          className="hero-poster hero-poster-fallback is-visible"
          role="img"
          aria-label={posterAlt}
        />
      ) : (
        <img
          src={posterSrc}
          alt={posterAlt}
          className="hero-poster is-visible"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => setPosterFailed(true)}
        />
      )}

      {allowVideo && (
        <video
          className={`hero-video${videoReady ? ' is-ready' : ''}`}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={(event) => void startVideo(event.currentTarget)}
          onPlaying={() => setVideoReady(true)}
          onError={() => {
            setVideoReady(false)
            setVideoFailed(true)
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
    </div>
  )
}
