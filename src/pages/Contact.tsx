import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

type ContactTone = 'whatsapp' | 'instagram' | 'youtube' | 'email'

interface ContactChannel {
  name: string
  value: string
  description: string
  action: string
  href: string
  tone: ContactTone
  icon: ReactNode
  external?: boolean
  featured?: boolean
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.5 11.65a8.35 8.35 0 0 1-12.4 7.3L3 20.55l1.67-4.92a8.35 8.35 0 1 1 15.83-3.98Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 7.85c.2-.43.42-.44.7-.45h.6c.18 0 .35.06.45.34l.73 1.79c.08.2.05.38-.08.56l-.57.72c-.12.14-.12.3-.03.46.5.84 1.16 1.5 2 1.98.16.09.32.08.45-.04l.82-.94c.14-.16.34-.2.53-.12l1.8.85c.21.1.33.26.31.48-.06.64-.36 1.25-.82 1.68-.48.44-1.1.7-1.76.55-3.38-.73-5.94-3.27-6.72-6.64-.13-.55.03-.86.29-1.22Z"
        fill="currentColor"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="contact-instagram-gradient" x1="3" y1="21" x2="21" y2="3">
          <stop offset="0" stopColor="#ffb000" />
          <stop offset="0.48" stopColor="#f02968" />
          <stop offset="1" stopColor="#6c35d5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#contact-instagram-gradient)" />
      <circle cx="12" cy="12" r="4.25" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.65" cy="6.45" r="1.15" fill="#fff" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#ff0033" />
      <path d="m10 8.75 5.5 3.25-5.5 3.25v-6.5Z" fill="#fff" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="4" fill="#ff7b00" />
      <path
        d="m5.5 8 6.5 5 6.5-5"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    name: 'WhatsApp',
    value: '(11) 96446-7000',
    description: 'Para tirar dúvidas, falar sobre expedições ou conversar com a equipe agora.',
    action: 'Conversar agora',
    href: 'https://wa.me/5511964467000?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Usina%20do%20Jet.',
    tone: 'whatsapp',
    icon: <WhatsAppIcon />,
    external: true,
    featured: true,
  },
  {
    name: 'Instagram',
    value: '@usinadojet',
    description: 'Acompanhe os bastidores, os destinos e o dia a dia da Usina.',
    action: 'Abrir Instagram',
    href: 'https://instagram.com/usinadojet',
    tone: 'instagram',
    icon: <InstagramIcon />,
    external: true,
  },
  {
    name: 'YouTube',
    value: '@usinadojet',
    description: 'Assista às histórias, aos testes e às experiências completas.',
    action: 'Assistir ao canal',
    href: 'https://www.youtube.com/@usinadojet',
    tone: 'youtube',
    icon: <YouTubeIcon />,
    external: true,
  },
  {
    name: 'E-mail',
    value: 'usinadojet@gmail.com',
    description: 'Para propostas, imprensa, marcas e novas parcerias.',
    action: 'Enviar e-mail',
    href: 'mailto:usinadojet@gmail.com',
    tone: 'email',
    icon: <EmailIcon />,
  },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function Contact() {
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <main className="contact-v2-page">
      <section className="contact-v2-channels contact-v2-channels-standalone" aria-labelledby="contact-channels-title">
        <div className="wrap">
          <motion.div
            className="contact-v2-section-heading contact-v2-section-heading-simple"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.78, ease }}
          >
            <h1 id="contact-channels-title" className="display">Nossas redes sociais</h1>
          </motion.div>

          <div className="contact-v2-grid">
            {CONTACT_CHANNELS.map((channel, index) => (
              <motion.a
                className={`contact-v2-card contact-v2-card-${channel.tone}${channel.featured ? ' contact-v2-card-featured' : ''}`}
                href={channel.href}
                key={channel.name}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noreferrer' : undefined}
                aria-label={`${channel.action}: ${channel.value}`}
                initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.985 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.72,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease,
                }}
              >
                <span className="contact-v2-card-glow" aria-hidden="true" />
                <span className="contact-v2-icon" aria-hidden="true">{channel.icon}</span>
                <span className="mono contact-v2-card-index">0{index + 1}</span>

                <span className="contact-v2-card-copy">
                  <strong>{channel.name}</strong>
                  <small>{channel.description}</small>
                </span>

                <span className="contact-v2-card-footer">
                  <span className="contact-v2-value">{channel.value}</span>
                  <span className="contact-v2-action">
                    {channel.action}
                    <ArrowUpRight size={20} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </span>
              </motion.a>
            ))}
          </div>

        </div>
      </section>
    </main>
  )
}
