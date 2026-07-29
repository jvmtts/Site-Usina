import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxImage {
  src: string
  alt: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number | null
  onClose: () => void
  onNavigate: (i: number) => void
}

/**
 * Visualizador em tela cheia para ampliar as imagens da galeria.
 * Navega com as setas do teclado, clicando nas setas na tela, ou arrastando o olhar
 * — fecha com X, Esc, ou clicando fora da imagem.
 */
export default function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, images.length, onClose, onNavigate])

  const arrowBtnStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff',
    width: '2.75rem', height: '2.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
  }

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(10,10,10,0.94)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(1rem, 5vw, 4rem)',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ ...arrowBtnStyle, position: 'absolute', top: 'clamp(1rem,3vw,2rem)', right: 'clamp(1rem,3vw,2rem)', left: 'auto', transform: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FF7B00' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length) }}
              aria-label="Imagem anterior"
              style={{ ...arrowBtnStyle, left: 'clamp(0.5rem,3vw,2rem)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FF7B00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            src={images[index].src}
            alt={images[index].alt}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />

          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); onNavigate((index + 1) % images.length) }}
              aria-label="Próxima imagem"
              style={{ ...arrowBtnStyle, right: 'clamp(0.5rem,3vw,2rem)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FF7B00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          <span
            className="mono"
            style={{
              position: 'absolute', bottom: 'clamp(1rem,3vw,2rem)', left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.15em',
            }}
          >
            {index + 1} / {images.length}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}