import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Search } from 'lucide-react'

const CATEGORIES = ['Todos', 'Sea-Doo', 'Polaris', 'Kawasaki', 'Acessórios']

const PRODUCTS = [
  { id: 1, name: 'Sea-Doo RXT-X 300', category: 'Sea-Doo', price: 'Sob consulta', tag: 'Pronta Entrega', image: '/images/RXT300.png' },
  { id: 2, name: 'Polaris RZR Pro R', category: 'Polaris', price: 'Sob consulta', tag: 'Off-Road', image: '/images/Polaris.png' },
  { id: 3, name: 'Kawasaki Ninja ZX-10R', category: 'Kawasaki', price: 'Sob consulta', tag: 'Asfalto', image: '/images/Kawasaki.png' },
  { id: 4, name: 'Colete Prolife Neoprene', category: 'Acessórios', price: 'R$ 680,00', tag: 'Homologado', image: '/images/Colete.png' },
  { id: 5, name: 'Sea-Doo GTI SE 170', category: 'Sea-Doo', price: 'Sob consulta', tag: 'Entrada', image: '/images/GTI170.png' },
  { id: 6, name: 'Óculos Jet Premium', category: 'Acessórios', price: 'R$ 350,00', tag: 'Proteção UV', image: '/images/Oculos.png' },
]

export default function Catalog() {
  const [filter, setFilter] = useState('Todos')

  const filtered = PRODUCTS.filter(p => filter === 'Todos' || p.category === filter)

  return (
    <main style={{ background: '#F7F7F5', minHeight: '100vh', paddingBottom: 'clamp(6rem, 12vh, 10rem)' }}>
      
      {/* ── HEADER CATÁLOGO ── */}
      <section style={{ background: '#fff', paddingTop: 'clamp(8rem,16vh,12rem)', paddingBottom: 'clamp(3rem,6vh,5rem)', borderBottom: '1px solid #EBEBEB' }}>
        <div className="wrap">
          <motion.span 
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ marginBottom: '1.25rem' }}>
            Portfólio de Alta Performance
          </motion.span>
          <motion.h1 
            className="display"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: '#0A0A0A', lineHeight: 0.9 }}>
            CATÁLOGO
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ color: '#777', fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.75, maxWidth: '480px', marginTop: '1.75rem' }}>
            As melhores máquinas para água, asfalto e terra. Encontre seu próximo veículo ou equipamento.
          </motion.p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <div className="wrap" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Search size={18} color="#999" style={{ marginRight: '0.5rem' }} />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="mono"
              style={{
                fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '0.6rem 1.25rem', cursor: 'pointer', transition: 'all 0.25s',
                background: filter === cat ? '#0A0A0A' : 'transparent',
                color: filter === cat ? '#fff' : '#777',
                border: filter === cat ? '1px solid #0A0A0A' : '1px solid #DEDEDE',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID DE PRODUTOS ── */}
      <div className="wrap">
        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filtered.map(product => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={product.id}
                style={{ background: '#fff', border: '1px solid #EBEBEB', overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if (img) img.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if (img) img.style.transform = 'scale(1)'
                }}
              >
                {/* Imagem Container */}
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#F7F7F5' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.35rem 0.85rem', background: '#fff', border: '1px solid #EBEBEB' }}>
                    <span className="mono" style={{ fontSize: '0.55rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0A0A0A' }}>
                      {product.tag}
                    </span>
                  </div>
                </div>

                {/* Info Container */}
                <div style={{ padding: '1.75rem' }}>
                  <span className="mono" style={{ fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '0.4rem' }}>
                    {product.category}
                  </span>
                  <h3 className="display" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.8rem)', color: '#0A0A0A', marginBottom: '1.25rem', lineHeight: 1 }}>
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #EBEBEB' }}>
                    <span style={{ color: '#0A0A0A', fontSize: '1.1rem', fontWeight: 600 }}>{product.price}</span>
                    <a href={`https://wa.me/5511999999999?text=Olá,+tenho+interesse+no+${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF7B00', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                      Consultar <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}