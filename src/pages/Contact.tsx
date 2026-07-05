import { motion } from 'framer-motion'

export default function Contact() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black pt-32 px-6 md:px-16 lg:px-28"
    >
      <h1 className="font-display font-black tracking-[-0.02em] text-7xl text-white">CONTATO</h1>
      <p className="text-muted font-body mt-4">Em breve — formulário de contato.</p>
    </motion.main>
  )
}