import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { CartContents } from './CartContents'

const ease = [0.16, 1, 0.3, 1] as const

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const element = dialog.current
    if (!element) return
    const root = document.documentElement
    const overflow = root.style.overflow
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    root.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })

    return () => {
      element.close()
      root.style.overflow = overflow
      if (focused?.isConnected) focused.focus({ preventScroll: true })
    }
  }, [])

  return createPortal((
    <dialog
      ref={dialog}
      id="shop-cart-drawer"
      className="shop-cart-drawer"
      aria-labelledby="shop-cart-drawer-title"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <motion.div
        className="shop-cart-shade"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.23 }}
      />
      <motion.div
        className="shop-cart-drawer-panel"
        initial={reduced ? false : { x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: reduced ? 0 : 0.36, ease }}
      >
        <header className="shop-cart-drawer-header">
          <h2 id="shop-cart-drawer-title">Carrinho</h2>
          <button ref={closeButton} type="button" className="shop-cart-close" aria-label="Fechar carrinho" onClick={onClose}>
            <X size={23} strokeWidth={1.65} aria-hidden="true" />
          </button>
        </header>
        <CartContents onClose={onClose} />
      </motion.div>
    </dialog>
  ), document.body)
}
