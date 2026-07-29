import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Plus, Minus, Trash2, Check,
  User, ChevronDown, Upload, X, AlertCircle
} from 'lucide-react'

/* ── Tipos ───────────────────────────────────────────────────────── */
interface Acompanhante {
  nome: string
  rg: string
  idade: string
  tamanhoCamiseta: string
  sexo: string
  whatsapp: string
  email: string
}

interface DadosFormulario {
  tipoInscricao: 'individual' | 'dupla' | ''
  nome: string
  email: string
  whatsapp: string
  nacionalidade: string
  cpf: string
  estadoCivil: string
  rg: string
  orgaoEmissor: string
  tamanhoCamiseta: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  cep: string
  acompanhante: Acompanhante
  acompanhantesAdicionais: Acompanhante[]
  comoChegou: string
  comoChegouOutro: string
  temVeiculo: 'sim' | 'nao' | ''
  numeroCnh: string
  modeloVeiculo: string
  anoVeiculo: string
  docCnh: File | null
  docVeiculo: File | null
  tipoLocacao: 'quadriciclo' | 'utv' | 'personalizado' | ''
  qtdQuadriciclos: number
  qtdUtvs: number
  observacaoLocacao: string
  confirmacao: boolean
}

type Errors = Record<string, string>

const acompanhanteVazio = (): Acompanhante => ({
  nome: '', rg: '', idade: '', tamanhoCamiseta: '', sexo: '', whatsapp: '', email: '',
})

const initialData: DadosFormulario = {
  tipoInscricao: '',
  nome: '', email: '', whatsapp: '', nacionalidade: 'Brasil',
  cpf: '', estadoCivil: '', rg: '', orgaoEmissor: '', tamanhoCamiseta: '',
  endereco: '', numero: '', complemento: '', bairro: '', estado: '', cep: '',
  acompanhante: acompanhanteVazio(),
  acompanhantesAdicionais: [],
  comoChegou: '', comoChegouOutro: '',
  temVeiculo: '',
  numeroCnh: '', modeloVeiculo: '', anoVeiculo: '',
  docCnh: null, docVeiculo: null,
  tipoLocacao: '', qtdQuadriciclos: 0, qtdUtvs: 0, observacaoLocacao: '',
  confirmacao: false,
}

/* ── Tamanhos de camiseta disponíveis ──────────────────────────── */
const TAMANHOS_CAMISETA = ['Infantil', 'P', 'M', 'G', 'GG', 'XG']

/* ── Lista de Países (Nacionalidade) com códigos ISO para as bandeiras */
const paises = [
  { nome: 'Brasil', code: 'br' },
  { nome: 'Argentina', code: 'ar' },
  { nome: 'Uruguai', code: 'uy' },
  { nome: 'Paraguai', code: 'py' },
  { nome: 'Chile', code: 'cl' },
  { nome: 'Colômbia', code: 'co' },
  { nome: 'Estados Unidos', code: 'us' },
  { nome: 'Portugal', code: 'pt' },
  { nome: 'Espanha', code: 'es' },
  { nome: 'Itália', code: 'it' },
  { nome: 'França', code: 'fr' },
  { nome: 'Reino Unido', code: 'gb' },
  { nome: 'Canadá', code: 'ca' },
  { nome: 'Japão', code: 'jp' },
  { nome: 'Outro', code: 'un' } // 'un' será tratado para exibir um globo
]

/* ── Lista de Estados brasileiros (UF + nome completo + região, pra
     colorir o "selo" de cada estado e dar uma pista visual a mais) ── */
const estados = [
  { uf: 'AC', nome: 'Acre', regiao: 'norte' },
  { uf: 'AL', nome: 'Alagoas', regiao: 'nordeste' },
  { uf: 'AP', nome: 'Amapá', regiao: 'norte' },
  { uf: 'AM', nome: 'Amazonas', regiao: 'norte' },
  { uf: 'BA', nome: 'Bahia', regiao: 'nordeste' },
  { uf: 'CE', nome: 'Ceará', regiao: 'nordeste' },
  { uf: 'DF', nome: 'Distrito Federal', regiao: 'centro-oeste' },
  { uf: 'ES', nome: 'Espírito Santo', regiao: 'sudeste' },
  { uf: 'GO', nome: 'Goiás', regiao: 'centro-oeste' },
  { uf: 'MA', nome: 'Maranhão', regiao: 'nordeste' },
  { uf: 'MT', nome: 'Mato Grosso', regiao: 'centro-oeste' },
  { uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'centro-oeste' },
  { uf: 'MG', nome: 'Minas Gerais', regiao: 'sudeste' },
  { uf: 'PA', nome: 'Pará', regiao: 'norte' },
  { uf: 'PB', nome: 'Paraíba', regiao: 'nordeste' },
  { uf: 'PR', nome: 'Paraná', regiao: 'sul' },
  { uf: 'PE', nome: 'Pernambuco', regiao: 'nordeste' },
  { uf: 'PI', nome: 'Piauí', regiao: 'nordeste' },
  { uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'sudeste' },
  { uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'nordeste' },
  { uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'sul' },
  { uf: 'RO', nome: 'Rondônia', regiao: 'norte' },
  { uf: 'RR', nome: 'Roraima', regiao: 'norte' },
  { uf: 'SC', nome: 'Santa Catarina', regiao: 'sul' },
  { uf: 'SP', nome: 'São Paulo', regiao: 'sudeste' },
  { uf: 'SE', nome: 'Sergipe', regiao: 'nordeste' },
  { uf: 'TO', nome: 'Tocantins', regiao: 'norte' },
]

/* ── Validações ──────────────────────────────────────────────────── */
function isValidCPF(cpfRaw: string) {
  const cpf = cpfRaw.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev >= 10) rev = 0
  if (rev !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev >= 10) rev = 0
  if (rev !== parseInt(cpf[10])) return false
  return true
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const isValidNomeCompleto = (nome: string) => /^[A-Za-zÀ-ÖØ-öø-ÿ]+(\s[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/.test(nome.trim())

/* ── Estilos base ────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  border: '1.5px solid #DEDEDE',
  background: '#fff',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#0A0A0A',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  borderRadius: 0,
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: '#777',
  display: 'block',
  marginBottom: '0.5rem',
}

const errorTextStyle: React.CSSProperties = {
  marginTop: '0.45rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.72rem',
  color: '#ef4444',
  fontFamily: "'Inter', sans-serif",
}

const requiredStar = <span style={{ color: '#FF7B00' }}>*</span>

/* ── Ícone customizado: UTV / Quadriciclo ───────────────────────── */
function UtvIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M5.5 17.5h3.2l1.6-4.5h3.4l1.6 4.5h3.2" />
      <path d="M9.3 8.5h5.4l1 4.5" />
      <path d="M9.3 8.5l-1 4.5" />
      <path d="M7 6.7h3" />
      <path d="M14 6.7h3" />
    </svg>
  )
}

/* ── Shake wrapper (usado por Input/Select para indicar erro) ─────── */
function ShakeWrap({ error, shakeNonce, children }: { error?: boolean; shakeNonce?: number; children: React.ReactNode }) {
  return (
    <motion.div
      key={error ? `err-${shakeNonce ?? 0}` : 'ok'}
      animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: 'relative', width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

/* ── Componentes de campo ────────────────────────────────────────── */
function Field({ label, required = false, error, fieldRef, children }: {
  label: string; required?: boolean; error?: string; fieldRef?: (el: HTMLDivElement | null) => void; children: React.ReactNode
}) {
  return (
    <div ref={fieldRef} style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label} {required && requiredStar}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={errorTextStyle}>
            <AlertCircle size={11} /> {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function Input({ value, onChange, placeholder = '', type = 'text', mask, icon, error, shakeNonce }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
  mask?: 'whatsapp' | 'cpf' | 'rg' | 'cep' | 'nome' | 'ano' | 'cnh' | 'idade'; icon?: React.ReactNode;
  error?: boolean; shakeNonce?: number
}) {
  const [focused, setFocused] = useState(false)

  const handleChange = (rawValue: string) => {
    if (mask === 'whatsapp') {
      let v = rawValue.replace(/\D/g, '').slice(0, 11)
      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
      if (v.length > 7) v = `${v.slice(0, 10)}-${v.slice(10)}`
      onChange(v)
      return
    }
    if (mask === 'cpf') {
      let v = rawValue.replace(/\D/g, '').slice(0, 11)
      if (v.length > 9) v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
      else if (v.length > 6) v = `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
      else if (v.length > 3) v = `${v.slice(0, 3)}.${v.slice(3)}`
      onChange(v)
      return
    }
    if (mask === 'rg') {
      let v = rawValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 9).toUpperCase()
      if (v.length > 8) v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}-${v.slice(8)}`
      else if (v.length > 5) v = `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`
      else if (v.length > 2) v = `${v.slice(0, 2)}.${v.slice(2)}`
      onChange(v)
      return
    }
    if (mask === 'cep') {
      let v = rawValue.replace(/\D/g, '').slice(0, 8)
      if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`
      onChange(v)
      return
    }
    if (mask === 'nome') {
      onChange(rawValue.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, ''))
      return
    }
    if (mask === 'ano') {
      onChange(rawValue.replace(/\D/g, '').slice(0, 4))
      return
    }
    if (mask === 'cnh') {
      onChange(rawValue.replace(/\D/g, '').slice(0, 11))
      return
    }
    if (mask === 'idade') {
      onChange(rawValue.replace(/\D/g, '').slice(0, 3))
      return
    }
    onChange(rawValue)
  }

  const borderColor = error ? '#ef4444' : focused ? '#FF7B00' : '#DEDEDE'
  const boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.08)' : focused ? '0 0 0 3px rgba(255,123,0,0.08)' : 'none'

  return (
    <ShakeWrap error={error} shakeNonce={shakeNonce}>
      {icon && (
        <div style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10
        }}>
          {icon}
        </div>
      )}
      <input
        type={type} value={value} onChange={e => handleChange(e.target.value)}
        placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          paddingLeft: icon ? '2.5rem' : '1rem',
          borderColor,
          boxShadow,
        }}
      />
    </ShakeWrap>
  )
}

function Select({ value, onChange, options, placeholder = 'Selecione', error, shakeNonce }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; error?: boolean; shakeNonce?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false); setFocused(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const borderColor = error ? '#ef4444' : (focused || isOpen) ? '#FF7B00' : '#DEDEDE'
  const boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.08)' : (focused || isOpen) ? '0 0 0 3px rgba(255,123,0,0.08)' : 'none'

  return (
    <ShakeWrap error={error} shakeNonce={shakeNonce}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div
          tabIndex={0} onFocus={() => setFocused(true)}
          onBlur={(e) => { if (!containerRef.current?.contains(e.relatedTarget as Node)) { setFocused(false); setIsOpen(false) } }}
          onClick={() => setIsOpen(o => !o)}
          style={{
            ...inputStyle, cursor: 'pointer',
            borderColor, boxShadow,
            color: value ? '#0A0A0A' : '#999',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none'
          }}
        >
          <span>{value || placeholder}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronDown size={14} style={{ color: '#999' }} />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff',
                border: '1.5px solid #FF7B00', borderTop: 'none', margin: 0, padding: 0, listStyle: 'none',
                maxHeight: '210px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              {options.map(o => (
                <li key={o} onClick={() => { onChange(o); setIsOpen(false); setFocused(false) }}
                  style={{
                    padding: '0.85rem 1rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                    color: '#0A0A0A', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,123,0,0.06)'; e.currentTarget.style.color = '#FF7B00' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A0A0A' }}
                >
                  {o}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </ShakeWrap>
  )
}

function CountrySelect({ value, onChange, error, shakeNonce }: { value: string, onChange: (v: string) => void; error?: boolean; shakeNonce?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = paises.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))
  const currentCountry = paises.find(p => p.nome === value)
  const borderColor = error ? '#ef4444' : isOpen ? '#FF7B00' : '#DEDEDE'
  const boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.08)' : isOpen ? '0 0 0 3px rgba(255,123,0,0.08)' : 'none'

  return (
    <ShakeWrap error={error} shakeNonce={shakeNonce}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        {/* Botão principal de exibição */}
        <div
          onClick={() => setIsOpen(o => { const next = !o; if (o) setSearch(''); return next })}
          style={{
            ...inputStyle, cursor: 'pointer',
            borderColor, boxShadow,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}
        >
          {currentCountry && currentCountry.code !== 'un' ? (
            <img src={`https://flagcdn.com/w20/${currentCountry.code}.png`} alt={currentCountry.nome} style={{ width: '20px', borderRadius: '2px', display: 'block' }} />
          ) : (
            <span style={{ fontSize: '1.1rem', display: 'block', lineHeight: 1 }}>🌎</span>
          )}
          <span style={{ flex: 1, color: value ? '#0A0A0A' : '#999' }}>{value || 'Selecione...'}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronDown size={14} style={{ color: '#999', pointerEvents: 'none' }} />
          </motion.div>
        </div>

        {/* Dropdown com busca */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#fff', border: '1.5px solid #FF7B00', borderTop: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid #EBEBEB' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar país..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem',
                    border: '1px solid #DEDEDE', background: '#FAFAFA',
                    outline: 'none', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif"
                  }}
                />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxHeight: '180px', overflowY: 'auto' }}>
                {filtered.length > 0 ? filtered.map(p => (
                  <li
                    key={p.nome}
                    onClick={() => { onChange(p.nome); setIsOpen(false); setSearch('') }}
                    style={{
                      padding: '0.85rem 1rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                      color: '#0A0A0A', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,123,0,0.06)'; e.currentTarget.style.color = '#FF7B00' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A0A0A' }}
                  >
                    {p.code !== 'un' ? (
                      <img src={`https://flagcdn.com/w20/${p.code}.png`} alt={p.nome} style={{ width: '20px', borderRadius: '2px', display: 'block' }} />
                    ) : <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🌎</span>}
                    {p.nome}
                  </li>
                )) : (
                  <li style={{ padding: '0.85rem 1rem', color: '#999', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    Nenhum país encontrado
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ShakeWrap>
  )
}

/* ── Selo colorido por região, usado no lugar da "bandeira" pro estado.
     Evita depender de imagens externas de bandeiras estaduais (que não têm
     uma fonte confiável e padronizada como as de país) mantendo, ainda
     assim, uma pista visual rápida por região do Brasil. ── */
const CORES_REGIAO: Record<string, string> = {
  norte: '#2F9E44',
  nordeste: '#E8590C',
  'centro-oeste': '#C9A227',
  sudeste: '#FF7B00',
  sul: '#1971C2',
}

function SeloEstado({ uf, regiao, size = 34 }: { uf: string; regiao: string; size?: number }) {
  return (
    <span
      style={{
        width: size, height: size, flexShrink: 0, borderRadius: '6px',
        background: CORES_REGIAO[regiao] ?? '#777',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: size * 0.34,
        color: '#fff', letterSpacing: '0.02em',
      }}
    >
      {uf}
    </span>
  )
}

/* ── Seletor de Estado (UF) com busca — mesmo padrão do CountrySelect,
     mas com um selo colorido por região no lugar da bandeira. Busca
     tanto pela sigla (ex: "sp") quanto pelo nome (ex: "são paulo"). ── */
function StateSelect({ value, onChange, error, shakeNonce }: { value: string; onChange: (v: string) => void; error?: boolean; shakeNonce?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const termo = search.trim().toLowerCase()
  const filtered = estados.filter(s => s.nome.toLowerCase().includes(termo) || s.uf.toLowerCase().includes(termo))
  const current = estados.find(s => s.uf === value)
  const borderColor = error ? '#ef4444' : isOpen ? '#FF7B00' : '#DEDEDE'
  const boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.08)' : isOpen ? '0 0 0 3px rgba(255,123,0,0.08)' : 'none'

  return (
    <ShakeWrap error={error} shakeNonce={shakeNonce}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <div
          onClick={() => setIsOpen(o => { const next = !o; if (o) setSearch(''); return next })}
          style={{
            ...inputStyle, cursor: 'pointer',
            borderColor, boxShadow,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}
        >
          {current ? (
            <SeloEstado uf={current.uf} regiao={current.regiao} size={26} />
          ) : (
            <span style={{
              width: 26, height: 26, flexShrink: 0, borderRadius: '6px', border: '1.5px dashed #DEDEDE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BBB', fontSize: '0.9rem',
            }}>
              —
            </span>
          )}
          <span style={{ flex: 1, color: value ? '#0A0A0A' : '#999' }}>
            {current ? `${current.nome} (${current.uf})` : 'Selecione o estado...'}
          </span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center' }}>
            <ChevronDown size={14} style={{ color: '#999', pointerEvents: 'none' }} />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#fff', border: '1.5px solid #FF7B00', borderTop: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '0.5rem', borderBottom: '1px solid #EBEBEB' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar estado ou sigla (ex: SP)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.75rem',
                    border: '1px solid #DEDEDE', background: '#FAFAFA',
                    outline: 'none', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif"
                  }}
                />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxHeight: '220px', overflowY: 'auto' }}>
                {filtered.length > 0 ? filtered.map(s => (
                  <li
                    key={s.uf}
                    onClick={() => { onChange(s.uf); setIsOpen(false); setSearch('') }}
                    style={{
                      padding: '0.6rem 1rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
                      color: '#0A0A0A', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,123,0,0.06)'; e.currentTarget.style.color = '#FF7B00' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0A0A0A' }}
                  >
                    <SeloEstado uf={s.uf} regiao={s.regiao} size={26} />
                    {s.nome}
                  </li>
                )) : (
                  <li style={{ padding: '0.85rem 1rem', color: '#999', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>
                    Nenhum estado encontrado
                  </li>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ShakeWrap>
  )
}

function FileInput({ label, required = false, value, onChange, error }: {
  label: string; required?: boolean; value: File | null; onChange: (f: File | null) => void; error?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [hover, setHover] = useState(false)
  const borderColor = error ? '#ef4444' : (hover || value) ? '#FF7B00' : '#DEDEDE'
  return (
    <Field label={label} required={required}>
      <div
        onClick={() => ref.current?.click()} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          border: `1.5px dashed ${borderColor}`, padding: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
          background: value ? 'rgba(255,123,0,0.04)' : error ? 'rgba(239,68,68,0.03)' : '#FAFAFA',
        }}
      >
        {value ? (
          <>
            <Check size={16} style={{ color: '#FF7B00', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#0A0A0A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.name}</span>
            <button type="button" onClick={e => { e.stopPropagation(); onChange(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0, display: 'flex' }}><X size={14} /></button>
          </>
        ) : (
          <>
            <Upload size={16} style={{ color: '#999', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: '#999' }}>Clique para enviar ou arraste o arquivo</span>
          </>
        )}
      </div>
      <input ref={ref} type="file" style={{ display: 'none' }} onChange={e => onChange(e.target.files?.[0] || null)} />
    </Field>
  )
}

function QuantityStepper({ label, value, onChange, min = 0, max = 10 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #DEDEDE', width: 'fit-content' }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: '2.5rem', height: '2.5rem', border: 'none', borderRight: '1.5px solid #DEDEDE', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
          <Minus size={14} />
        </button>
        <span style={{ width: '2.75rem', textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: '#0A0A0A' }}>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: '2.5rem', height: '2.5rem', border: 'none', borderLeft: '1.5px solid #DEDEDE', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

/* ── Bloco de acompanhante ───────────────────────────────────────── */
function BlocoAcompanhante({ titulo, data, onChange, onRemove, rgObrigatorio = false }: {
  titulo: string; data: Acompanhante; onChange: (field: keyof Acompanhante, value: string) => void; onRemove?: () => void; rgObrigatorio?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ border: '1px solid #EBEBEB', padding: '1.75rem', background: '#F7F7F5' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#FF7B00' }}>
          {titulo}
        </span>
        {onRemove && (
          <button type="button" onClick={onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#999' }}
          >
            <Trash2 size={13} /> Remover
          </button>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        <Field label="Nome Completo" required><Input value={data.nome} onChange={v => onChange('nome', v)} placeholder="Nome completo" mask="nome" /></Field>
        <Field label="RG" required={rgObrigatorio}><Input value={data.rg} onChange={v => onChange('rg', v)} placeholder="00.000.000-0" mask="rg" /></Field>
        <Field label="Idade" required><Input value={data.idade} onChange={v => onChange('idade', v)} placeholder="Ex: 32" mask="idade" /></Field>
        <Field label="Sexo"><Select value={data.sexo} onChange={v => onChange('sexo', v)} options={['Masculino', 'Feminino', 'Prefiro não informar']} /></Field>
        <Field label="Tamanho da Camiseta" required><Select value={data.tamanhoCamiseta} onChange={v => onChange('tamanhoCamiseta', v)} options={TAMANHOS_CAMISETA} /></Field>
        <Field label="WhatsApp"><Input value={data.whatsapp} onChange={v => onChange('whatsapp', v)} placeholder="(11) 99999-9999" mask="whatsapp" /></Field>
        <Field label="Email" required><Input value={data.email} onChange={v => onChange('email', v)} type="email" placeholder="email@exemplo.com" /></Field>
      </div>
    </motion.div>
  )
}

/* ── Step indicator e Linhas de Revisão ──────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { icon: <User size={14} />, label: 'Dados Pessoais' },
    { icon: <UtvIcon size={16} />, label: 'Veículo' },
    { icon: <Check size={14} />, label: 'Revisão' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <motion.div
              animate={{ background: i < current ? '#FF7B00' : i === current ? '#0A0A0A' : '#F0F0F0', color: i <= current ? '#fff' : '#999' }}
              transition={{ duration: 0.3 }}
              style={{ width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {i < current ? <Check size={14} /> : step.icon}
            </motion.div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, color: i === current ? '#0A0A0A' : i < current ? '#FF7B00' : '#BBB' }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && <motion.div animate={{ background: i < current ? '#FF7B00' : '#EBEBEB' }} transition={{ duration: 0.4 }} style={{ width: 'clamp(3rem, 8vw, 6rem)', height: '1.5px', marginBottom: '1.4rem' }} />}
        </div>
      ))}
    </div>
  )
}

function RevisaoLinha({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', padding: '0.6rem 0' }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#999', width: '45%', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: '#0A0A0A', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function BtnVoltar({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button" onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1.5px solid #DEDEDE',
        padding: '0.875rem 1.75rem', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem',
        fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#555', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#0A0A0A'; el.style.color = '#0A0A0A' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#DEDEDE'; el.style.color = '#555' }}
    >
      <ArrowLeft size={14} /> Voltar
    </motion.button>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function ExpedicaoForm() {
  const [step, setStep]       = useState(0)
  const [data, setData]       = useState<DadosFormulario>(initialData)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState(false)
  const [erroValidacao, setErroValidacao] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [shakeNonce, setShakeNonce] = useState(0)
  const topRef = useRef<HTMLDivElement>(null)
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // SCROLL FIX: Joga a tela pro topo sempre que a página for aberta
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const set = (field: keyof DadosFormulario, value: unknown) =>
    setData(p => ({ ...p, [field]: value }))

  const setAcomp = (field: keyof Acompanhante, value: string) =>
    setData(p => ({ ...p, acompanhante: { ...p.acompanhante, [field]: value } }))

  const LIMITE_ACOMPANHANTES_ADICIONAIS = 3

  const addAdicional = () =>
    setData(p => p.acompanhantesAdicionais.length >= LIMITE_ACOMPANHANTES_ADICIONAIS
      ? p
      : { ...p, acompanhantesAdicionais: [...p.acompanhantesAdicionais, acompanhanteVazio()] })

  const removeAdicional = (i: number) =>
    setData(p => ({ ...p, acompanhantesAdicionais: p.acompanhantesAdicionais.filter((_, idx) => idx !== i) }))

  const setAdicional = (i: number, field: keyof Acompanhante, value: string) =>
    setData(p => {
      const list = [...p.acompanhantesAdicionais]
      list[i] = { ...list[i], [field]: value }
      return { ...p, acompanhantesAdicionais: list }
    })

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)

  const scrollToFirstError = (errs: Errors, order: string[]) => {
    const firstKey = order.find(k => errs[k])
    if (firstKey) {
      setTimeout(() => {
        fieldRefs.current[firstKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 80)
    }
  }

  /* ── Validação Step 0 — Dados Pessoais ──────────────────────────── */
  const validarStep0 = (): Errors => {
    const e: Errors = {}
    if (!data.tipoInscricao) e.tipoInscricao = 'Selecione o tipo de inscrição.'

    if (!data.nome.trim()) e.nome = 'Informe seu nome completo.'
    else if (!isValidNomeCompleto(data.nome)) e.nome = 'Informe nome e sobrenome, apenas letras.'

    if (!data.email.trim()) e.email = 'Informe seu email.'
    else if (!isValidEmail(data.email)) e.email = 'Digite um email válido.'

    if (data.whatsapp.replace(/\D/g, '').length !== 11) e.whatsapp = 'Informe um WhatsApp válido, com DDD.'

    if (!data.nacionalidade) e.nacionalidade = 'Selecione sua nacionalidade.'

    if (!isValidCPF(data.cpf)) e.cpf = 'Informe um CPF válido.'

    if (!data.estadoCivil) e.estadoCivil = 'Selecione o estado civil.'

    if (data.rg.replace(/[^a-zA-Z0-9]/g, '').length < 7) e.rg = 'Informe um RG válido.'

    if (!data.orgaoEmissor.trim()) e.orgaoEmissor = 'Informe o órgão emissor.'

    if (!data.tamanhoCamiseta) e.tamanhoCamiseta = 'Selecione o tamanho da camiseta.'

    if (!data.endereco.trim()) e.endereco = 'Informe o endereço.'
    if (!data.numero.trim()) e.numero = 'Informe o número.'
    if (!data.bairro.trim()) e.bairro = 'Informe o bairro.'
    if (!data.estado) e.estado = 'Selecione o estado.'
    if (data.cep.replace(/\D/g, '').length !== 8) e.cep = 'Informe um CEP válido.'

    if (!data.comoChegou) e.comoChegou = 'Selecione uma opção.'
    if (data.comoChegou === 'Outro' && !data.comoChegouOutro.trim()) e.comoChegouOutro = 'Especifique como chegou até nós.'

    if (data.tipoInscricao === 'dupla') {
      const p = data.acompanhante
      if (!p.nome.trim() || !p.email.trim()) {
        e.acompanhante = 'Preencha nome e email do acompanhante principal.'
      } else if (!isValidEmail(p.email)) {
        e.acompanhante = 'Email do acompanhante principal inválido.'
      } else if (p.rg.replace(/[^a-zA-Z0-9]/g, '').length < 7) {
        e.acompanhante = 'Informe o RG do acompanhante principal.'
      } else if (!p.idade.trim()) {
        e.acompanhante = 'Informe a idade do acompanhante principal.'
      } else if (!p.tamanhoCamiseta) {
        e.acompanhante = 'Selecione o tamanho da camiseta do acompanhante principal.'
      }

      for (const ac of data.acompanhantesAdicionais) {
        if (!ac.nome.trim() || !ac.email.trim() || !isValidEmail(ac.email)) {
          e.acompanhante = 'Verifique nome e email de todos os acompanhantes adicionados.'
          break
        }
        if (!ac.idade.trim()) {
          e.acompanhante = 'Informe a idade de todos os acompanhantes adicionados.'
          break
        }
        if (!ac.tamanhoCamiseta) {
          e.acompanhante = 'Selecione o tamanho da camiseta de todos os acompanhantes adicionados.'
          break
        }
      }
    }
    return e
  }

  /* ── Validação Step 1 — Veículo ─────────────────────────────────── */
  const validarStep1 = (): Errors => {
    const e: Errors = {}
    if (!data.temVeiculo) e.temVeiculo = 'Selecione uma opção.'

    // CNH é exigida em ambos os casos (tendo veículo próprio ou precisando alugar)
    if (data.temVeiculo === 'sim' || data.temVeiculo === 'nao') {
      if (data.numeroCnh.replace(/\D/g, '').length !== 11) e.numeroCnh = 'Informe um número de CNH válido (11 dígitos).'
      if (!data.docCnh) e.docCnh = 'Envie o documento da CNH.'
    }

    if (data.temVeiculo === 'sim') {
      if (!data.modeloVeiculo.trim() || data.modeloVeiculo.trim().length < 2) e.modeloVeiculo = 'Informe o modelo do UTV ou Quadriciclo.'
      const anoNum = parseInt(data.anoVeiculo, 10)
      const anoAtual = new Date().getFullYear()
      if (data.anoVeiculo.length !== 4 || isNaN(anoNum) || anoNum < 1980 || anoNum > anoAtual + 1) e.anoVeiculo = 'Informe um ano de fabricação válido.'
    }

    if (data.temVeiculo === 'nao') {
      if (!data.tipoLocacao) e.tipoLocacao = 'Selecione o que você precisa alugar.'
      else if (data.tipoLocacao === 'personalizado' && (data.qtdQuadriciclos + data.qtdUtvs) < 1) {
        e.tipoLocacao = 'Informe ao menos 1 veículo na opção personalizada.'
      }
    }

    if (!data.confirmacao) e.confirmacao = 'Confirme que as informações são verdadeiras para continuar.'
    return e
  }

  const nextStep = () => {
    if (step === 0) {
      const errs = validarStep0()
      if (Object.keys(errs).length) {
        setErrors(errs)
        setShakeNonce(n => n + 1)
        setErroValidacao('Alguns campos precisam da sua atenção antes de continuar.')
        scrollToFirstError(errs, ['tipoInscricao', 'nome', 'email', 'whatsapp', 'nacionalidade', 'cpf', 'estadoCivil', 'rg', 'orgaoEmissor', 'tamanhoCamiseta', 'acompanhante', 'endereco', 'numero', 'bairro', 'cep', 'estado', 'comoChegou', 'comoChegouOutro'])
        return
      }
    }
    if (step === 1) {
      const errs = validarStep1()
      if (Object.keys(errs).length) {
        setErrors(errs)
        setShakeNonce(n => n + 1)
        setErroValidacao('Verifique os campos destacados antes de continuar.')
        scrollToFirstError(errs, ['temVeiculo', 'numeroCnh', 'modeloVeiculo', 'anoVeiculo', 'docCnh', 'tipoLocacao', 'confirmacao'])
        return
      }
    }
    setErrors({})
    setErroValidacao('')
    setStep(p => p + 1)
    scrollTop()
  }

  const prevStep = () => { setErrors({}); setErroValidacao(''); setStep(p => p - 1); scrollTop() }

  /* ── Envio para o Formspree ──────────────────────────────────── */
  // Monta os campos de texto (sempre enviados)
  const montarCamposTexto = (formData: FormData) => {
    formData.append('_subject', `Nova inscrição — ${data.nome} (Campos do Jordão)`)

    formData.append('Tipo de Inscrição', data.tipoInscricao === 'individual' ? 'Piloto Individual' : 'Piloto + Acompanhante')
    formData.append('Nome', data.nome)
    formData.append('Email', data.email)
    formData.append('WhatsApp', data.whatsapp)
    formData.append('Nacionalidade', data.nacionalidade)
    formData.append('CPF', data.cpf)
    formData.append('Estado Civil', data.estadoCivil)
    formData.append('RG', data.rg)
    formData.append('Órgão Emissor', data.orgaoEmissor)
    formData.append('Tamanho Camiseta', data.tamanhoCamiseta)

    formData.append('Endereço', `${data.endereco}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''}, ${data.bairro}, ${data.estado} - CEP ${data.cep}`)

    formData.append('Como chegou', data.comoChegou === 'Outro' ? `Outro: ${data.comoChegouOutro}` : data.comoChegou)

    if (data.tipoInscricao === 'dupla') {
      formData.append('Acompanhante Principal - Nome', data.acompanhante.nome)
      formData.append('Acompanhante Principal - RG', data.acompanhante.rg)
      formData.append('Acompanhante Principal - Idade', data.acompanhante.idade)
      formData.append('Acompanhante Principal - Tamanho Camiseta', data.acompanhante.tamanhoCamiseta)
      formData.append('Acompanhante Principal - Sexo', data.acompanhante.sexo)
      formData.append('Acompanhante Principal - WhatsApp', data.acompanhante.whatsapp)
      formData.append('Acompanhante Principal - Email', data.acompanhante.email)

      data.acompanhantesAdicionais.forEach((ac, i) => {
        formData.append(`Acompanhante Adicional ${i + 1} - Nome`, ac.nome)
        formData.append(`Acompanhante Adicional ${i + 1} - RG`, ac.rg)
        formData.append(`Acompanhante Adicional ${i + 1} - Idade`, ac.idade)
        formData.append(`Acompanhante Adicional ${i + 1} - Tamanho Camiseta`, ac.tamanhoCamiseta)
        formData.append(`Acompanhante Adicional ${i + 1} - Sexo`, ac.sexo)
        formData.append(`Acompanhante Adicional ${i + 1} - WhatsApp`, ac.whatsapp)
        formData.append(`Acompanhante Adicional ${i + 1} - Email`, ac.email)
      })
    }

    formData.append('Possui veículo próprio', data.temVeiculo === 'sim' ? 'Sim' : 'Não')

    // Número da CNH é exigido em ambos os casos
    formData.append('Número CNH', data.numeroCnh)

    if (data.temVeiculo === 'sim') {
      formData.append('Modelo do veículo', data.modeloVeiculo)
      formData.append('Ano do veículo', data.anoVeiculo)
    } else if (data.temVeiculo === 'nao') {
      formData.append('Tipo de Locação', data.tipoLocacao)
      if (data.tipoLocacao === 'personalizado') {
        formData.append('Qtd. Quadriciclos', String(data.qtdQuadriciclos))
        formData.append('Qtd. UTVs', String(data.qtdUtvs))
        formData.append('Observações Locação', data.observacaoLocacao)
      }
    }
  }

  const BASIN_ENDPOINT = 'https://usebasin.com/f/80e03fc53775'

  const handleEnviar = async () => {
    setEnviando(true)
    setErroEnvio(false)

    try {
      const formData = new FormData()
      montarCamposTexto(formData)
      if (data.docCnh) formData.append('Documento CNH', data.docCnh)
      if (data.docVeiculo) formData.append('Documento do Veículo', data.docVeiculo)

      const resp = await fetch(BASIN_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })

      if (!resp.ok) throw new Error('Falha no envio')

      setEnviando(false)
      setEnviado(true)
      scrollTop()
    } catch (err) {
      console.error(err)
      setEnviando(false)
      setErroEnvio(true)
    }
  }

  const totalAcomp = data.tipoInscricao === 'dupla' ? 1 + data.acompanhantesAdicionais.length : 0

  /* ── Tela de sucesso ─────────────────────────────────────────── */
  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ position: 'relative', width: '5rem', height: '5rem', margin: '0 auto 2rem' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: [0.8, 1.6, 1.8], opacity: [0.35, 0.12, 0] }}
              transition={{ duration: 2.2, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, background: '#FF7B00', borderRadius: '2px' }}
            />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }} style={{ position: 'relative', width: '100%', height: '100%', background: '#FF7B00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={28} color="#fff" />
            </motion.div>
          </div>
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,5vw,3rem)', color: '#0A0A0A', lineHeight: 0.95, letterSpacing: '-0.025em', marginBottom: '1.25rem' }}>INSCRIÇÃO ENVIADA!</motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ color: '#777', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem' }}>Recebemos sua inscrição para a expedição de <strong style={{ color: '#0A0A0A' }}>Campos do Jordão</strong>. Nossa equipe entrará em contato em breve com os detalhes e o valor final conforme o número de acompanhantes.</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.75 }} style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#BBB' }}>Você já pode fechar esta guia</motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }} ref={topRef}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', paddingTop: 'clamp(4rem,10vh,7rem)', paddingBottom: 'clamp(3rem,6vh,5rem)', overflow: 'hidden', background: '#0A0A0A', minHeight: '300px', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src="/images/CamposFormulario.png" alt="Campos do Jordão" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.5) 60%, rgba(10,10,10,0.15) 100%)' }} />
        </div>

        <Link
          to="/"
          className="mono"
          style={{
            position: 'absolute', top: 'clamp(1.25rem, 3vh, 2rem)', left: 'clamp(1.25rem, 4vw, 2.5rem)', zIndex: 2,
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)',
            fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
        >
          <ArrowLeft size={13} /> Voltar
        </Link>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 7rem)', display: 'flex', justifyContent: 'center' }}>
          
          {/* Container Flex para alinhar Logo Esquerda, Texto e Logo Direita */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'clamp(1.5rem, 4vw, 3rem)', justifyContent: 'center', width: '100%' }}>
            
            {/* Logo da Usina do Jet animado */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.9, x: -40 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              src="/images/logo usina 1000px x 1000px.png" 
              alt="Usina do Jet" 
              style={{ width: 'clamp(140px, 20vw, 220px)', height: 'auto', objectFit: 'contain', flexShrink: 0 }} 
            />

            {/* Bloco de Texto Atualizado - Efeito Sanduíche Laranja com Over-title Maior */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <motion.h2 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} 
                style={{ 
                  fontFamily: "'Space Mono', monospace", 
                  fontWeight: 700, 
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', 
                  letterSpacing: '0.15em', 
                  textTransform: 'uppercase', 
                  color: '#ff7b29', 
                  margin: '0 0 0.5rem 0' 
                }}
              >
                EXPEDIÇÃO - OFF ROAD
              </motion.h2>
              
              <motion.h1 
                initial={{ opacity: 0, y: 32 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} 
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', margin: 0 }}
              >
                CAMPOS DO<br />JORDÃO
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.6, delay: 0.4 }} 
                style={{ 
                  color: '#ff7b29', 
                  fontWeight: 600, 
                  fontSize: '1.05rem', 
                  marginTop: '1.25rem', 
                  fontFamily: "'Inter', sans-serif", 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                }}
              >
                São Paulo · 21–28 Ago 2026
              </motion.p>
            </div>

            {/* Logo do Alisson Guedes Jet animado */}
            <motion.img 
              initial={{ opacity: 0, scale: 0.9, x: 40 }} 
              animate={{ opacity: 1, scale: 1, x: 0 }} 
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              src="/images/logo alisson 1000px x 1000px.png" 
              alt="Alisson Guedes Jet" 
              style={{ width: 'clamp(170px, 26vw, 270px)', height: 'auto', objectFit: 'contain', flexShrink: 0 }} 
            />

          </div>
        </div>
      </section>

      {/* ── FORMULÁRIO ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(3rem,6vh,5rem) clamp(1.5rem,5vw,7rem) clamp(6rem,10vh,8rem)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          <div style={{ marginBottom: '3rem' }}>
            <StepIndicator current={step} />
          </div>

          <AnimatePresence mode="wait">

            {/* ══ STEP 0 — Dados Pessoais ══════════════════════ */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>

                {/* Tipo de inscrição */}
                <div style={{ marginBottom: '2.5rem' }} ref={el => { fieldRefs.current['tipoInscricao'] = el }}>
                  <p style={{ ...labelStyle, marginBottom: '1rem' }}>Tipo de Inscrição {requiredStar}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {[{ value: 'individual', label: 'Piloto Individual', sub: 'Apenas o piloto' }, { value: 'dupla', label: 'Piloto + Acompanhante', sub: 'Piloto e acompanhantes' }].map(opt => (
                      <button key={opt.value} type="button" onClick={() => { set('tipoInscricao', opt.value); setErrors(p => ({ ...p, tipoInscricao: '' })) }} style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s', border: `2px solid ${data.tipoInscricao === opt.value ? '#FF7B00' : errors.tipoInscricao ? '#ef4444' : '#EBEBEB'}`, background: data.tipoInscricao === opt.value ? 'rgba(255,123,0,0.05)' : '#fff' }}>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: data.tipoInscricao === opt.value ? '#FF7B00' : '#0A0A0A', marginBottom: '0.3rem' }}>{opt.label}</p>
                        <p style={{ fontSize: '0.78rem', color: '#999', fontFamily: "'Inter', sans-serif" }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {errors.tipoInscricao && (
                      <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorTextStyle}>
                        <AlertCircle size={11} /> {errors.tipoInscricao}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {data.tipoInscricao && (
                      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: '0.875rem', padding: '0.875rem 1rem', background: 'rgba(255,123,0,0.06)', border: '1px solid rgba(255,123,0,0.2)', fontSize: '0.82rem', color: '#777', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>💡 O valor varia conforme o número de acompanhantes — nossa equipe entrará em contato com o valor final.</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dados do piloto */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ ...labelStyle, color: '#FF7B00', marginBottom: '1.5rem', fontSize: '0.65rem' }}>— Dados do Piloto</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Nome Completo" required error={errors.nome} fieldRef={el => { fieldRefs.current['nome'] = el }}>
                        <Input value={data.nome} onChange={v => set('nome', v)} placeholder="Seu nome completo" mask="nome" error={!!errors.nome} shakeNonce={shakeNonce} />
                      </Field>
                    </div>
                    <Field label="Email" required error={errors.email} fieldRef={el => { fieldRefs.current['email'] = el }}>
                      <Input value={data.email} onChange={v => set('email', v)} type="email" placeholder="email@exemplo.com" error={!!errors.email} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="WhatsApp" required error={errors.whatsapp} fieldRef={el => { fieldRefs.current['whatsapp'] = el }}>
                      <Input value={data.whatsapp} onChange={v => set('whatsapp', v)} placeholder="(11) 99999-9999" mask="whatsapp" error={!!errors.whatsapp} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="Nacionalidade" required error={errors.nacionalidade} fieldRef={el => { fieldRefs.current['nacionalidade'] = el }}>
                      <CountrySelect value={data.nacionalidade} onChange={v => set('nacionalidade', v)} error={!!errors.nacionalidade} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="CPF" required error={errors.cpf} fieldRef={el => { fieldRefs.current['cpf'] = el }}>
                      <Input value={data.cpf} onChange={v => set('cpf', v)} placeholder="000.000.000-00" mask="cpf" error={!!errors.cpf} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="Estado Civil" required error={errors.estadoCivil} fieldRef={el => { fieldRefs.current['estadoCivil'] = el }}>
                      <Select value={data.estadoCivil} onChange={v => set('estadoCivil', v)} options={['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']} error={!!errors.estadoCivil} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="RG" required error={errors.rg} fieldRef={el => { fieldRefs.current['rg'] = el }}>
                      <Input value={data.rg} onChange={v => set('rg', v)} placeholder="00.000.000-0" mask="rg" error={!!errors.rg} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="Órgão Emissor" required error={errors.orgaoEmissor} fieldRef={el => { fieldRefs.current['orgaoEmissor'] = el }}>
                      <Input value={data.orgaoEmissor} onChange={v => set('orgaoEmissor', v)} placeholder="Ex: SSP/SP" error={!!errors.orgaoEmissor} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="Tamanho da Camiseta" required error={errors.tamanhoCamiseta} fieldRef={el => { fieldRefs.current['tamanhoCamiseta'] = el }}>
                      <Select value={data.tamanhoCamiseta} onChange={v => set('tamanhoCamiseta', v)} options={TAMANHOS_CAMISETA} error={!!errors.tamanhoCamiseta} shakeNonce={shakeNonce} />
                    </Field>
                  </div>
                </div>

                {/* Endereço */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ ...labelStyle, color: '#FF7B00', marginBottom: '1.5rem', fontSize: '0.65rem' }}>— Endereço</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Endereço" required error={errors.endereco} fieldRef={el => { fieldRefs.current['endereco'] = el }}>
                        <Input value={data.endereco} onChange={v => set('endereco', v)} placeholder="Rua, Avenida..." error={!!errors.endereco} shakeNonce={shakeNonce} />
                      </Field>
                    </div>
                    <Field label="Número" required error={errors.numero} fieldRef={el => { fieldRefs.current['numero'] = el }}>
                      <Input value={data.numero} onChange={v => set('numero', v)} placeholder="123" error={!!errors.numero} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="Complemento"><Input value={data.complemento} onChange={v => set('complemento', v)} placeholder="Apto, bloco..." /></Field>
                    <Field label="Bairro" required error={errors.bairro} fieldRef={el => { fieldRefs.current['bairro'] = el }}>
                      <Input value={data.bairro} onChange={v => set('bairro', v)} placeholder="Seu bairro" error={!!errors.bairro} shakeNonce={shakeNonce} />
                    </Field>
                    <Field label="CEP" required error={errors.cep} fieldRef={el => { fieldRefs.current['cep'] = el }}>
                      <Input value={data.cep} onChange={v => set('cep', v)} placeholder="00000-000" mask="cep" error={!!errors.cep} shakeNonce={shakeNonce} />
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Estado" required error={errors.estado} fieldRef={el => { fieldRefs.current['estado'] = el }}>
                        <StateSelect value={data.estado} onChange={v => set('estado', v)} error={!!errors.estado} shakeNonce={shakeNonce} />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Acompanhante principal */}
                <AnimatePresence>
                  {data.tipoInscricao === 'dupla' && (
                    <motion.div key="acomp-principal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'visible', marginBottom: '1rem' }} ref={el => { fieldRefs.current['acompanhante'] = el }}>
                      <p style={{ ...labelStyle, color: '#FF7B00', marginBottom: '0.35rem', fontSize: '0.65rem' }}>— Acompanhante</p>
                      <p style={{ fontSize: '0.78rem', color: '#999', fontFamily: "'Inter', sans-serif", marginBottom: '1rem' }}>Você pode adicionar até {LIMITE_ACOMPANHANTES_ADICIONAIS} acompanhantes adicionais, além do principal. O RG do acompanhante principal é obrigatório; para os adicionais, é opcional (ex: filhos que ainda não possuem documento).</p>
                      <BlocoAcompanhante titulo="Acompanhante Principal" data={data.acompanhante} onChange={setAcomp} rgObrigatorio />
                      <AnimatePresence>
                        {errors.acompanhante && (
                          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorTextStyle}>
                            <AlertCircle size={11} /> {errors.acompanhante}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Adicionais */}
                <AnimatePresence>
                  {data.tipoInscricao === 'dupla' && (
                    <motion.div key="adicionais" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: '2rem' }}>
                      <AnimatePresence>
                        {data.acompanhantesAdicionais.map((ac, i) => (
                          <div key={i} style={{ marginTop: '1rem' }}>
                            <BlocoAcompanhante titulo={`Acompanhante Adicional ${i + 1}`} data={ac} onChange={(f, v) => setAdicional(i, f, v)} onRemove={() => removeAdicional(i)} />
                          </div>
                        ))}
                      </AnimatePresence>
                      {data.acompanhantesAdicionais.length < LIMITE_ACOMPANHANTES_ADICIONAIS ? (
                        <motion.button type="button" onClick={addAdicional} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', border: '1.5px dashed #DEDEDE', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'border-color 0.2s, color 0.2s', color: '#999', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const }} onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#FF7B00'; el.style.color = '#FF7B00' }} onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#DEDEDE'; el.style.color = '#999' }}>
                          <Plus size={14} /> Adicionar acompanhante adicional ({data.acompanhantesAdicionais.length}/{LIMITE_ACOMPANHANTES_ADICIONAIS})
                        </motion.button>
                      ) : (
                        <div style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', border: '1.5px dashed #DEDEDE', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#BBB', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
                          Limite de {LIMITE_ACOMPANHANTES_ADICIONAIS} acompanhantes adicionais atingido
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Como chegou */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <p style={{ ...labelStyle, color: '#FF7B00', marginBottom: '1rem', fontSize: '0.65rem' }}>— Outros</p>
                  <Field label="Como chegou até nós" required error={errors.comoChegou} fieldRef={el => { fieldRefs.current['comoChegou'] = el }}>
                    <Select value={data.comoChegou} onChange={v => { set('comoChegou', v); if (v !== 'Outro') set('comoChegouOutro', '') }} options={['Instagram', 'Indicação', 'Outro']} error={!!errors.comoChegou} shakeNonce={shakeNonce} />
                  </Field>
                  <AnimatePresence>
                    {data.comoChegou === 'Outro' && (
                      <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
                        <Field label="Por favor, especifique" required error={errors.comoChegouOutro} fieldRef={el => { fieldRefs.current['comoChegouOutro'] = el }}>
                          <Input value={data.comoChegouOutro} onChange={v => set('comoChegouOutro', v)} placeholder="Ex: Pesquisa no Google" error={!!errors.comoChegouOutro} shakeNonce={shakeNonce} />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Exibição de Erro e Botões */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                  <AnimatePresence>
                    {erroValidacao && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif" }}>
                        <AlertCircle size={14} /> {erroValidacao}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="button" onClick={nextStep} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: '#FF7B00', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, transition: 'background 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E06B00' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF7B00' }}>
                    Próximo <ArrowRight size={15} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 1 — Veículo ═════════════════════════════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <p style={{ ...labelStyle, color: '#FF7B00', marginBottom: '2rem', fontSize: '0.65rem' }}>— Veículo</p>

                {/* Pergunta inicial */}
                <div style={{ marginBottom: '2rem' }} ref={el => { fieldRefs.current['temVeiculo'] = el }}>
                  <p style={{ ...labelStyle, marginBottom: '1rem' }}>Você tem UTV ou Quadriciclo? {requiredStar}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                    {[
                      { value: 'sim', label: 'Sim, tenho UTV/Quadriciclo', sub: 'Vou levar meu próprio veículo' },
                      { value: 'nao', label: 'Não, preciso alugar um', sub: 'Nossa equipe vai te orientar sobre a locação' },
                    ].map(opt => (
                      <button key={opt.value} type="button" onClick={() => { set('temVeiculo', opt.value); setErrors(p => ({ ...p, temVeiculo: '' })) }} style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s', border: `2px solid ${data.temVeiculo === opt.value ? '#FF7B00' : errors.temVeiculo ? '#ef4444' : '#EBEBEB'}`, background: data.temVeiculo === opt.value ? 'rgba(255,123,0,0.05)' : '#fff' }}>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: data.temVeiculo === opt.value ? '#FF7B00' : '#0A0A0A', marginBottom: '0.3rem' }}>{opt.label}</p>
                        <p style={{ fontSize: '0.78rem', color: '#999', fontFamily: "'Inter', sans-serif" }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {errors.temVeiculo && (
                      <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorTextStyle}>
                        <AlertCircle size={11} /> {errors.temVeiculo}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Campos de CNH — aparecem tanto em "Sim" quanto em "Não" (locação também exige CNH) */}
                <AnimatePresence>
                  {(data.temVeiculo === 'sim' || data.temVeiculo === 'nao') && (
                    <motion.div key="cnh-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem', paddingTop: '0.5rem' }}>
                        <Field label="Número da CNH" required error={errors.numeroCnh} fieldRef={el => { fieldRefs.current['numeroCnh'] = el }}>
                          <Input value={data.numeroCnh} onChange={v => set('numeroCnh', v)} placeholder="Número da CNH" mask="cnh" error={!!errors.numeroCnh} shakeNonce={shakeNonce} />
                        </Field>
                        <div ref={el => { fieldRefs.current['docCnh'] = el }}>
                          <FileInput label="Documento da CNH" required value={data.docCnh} onChange={f => set('docCnh', f)} error={!!errors.docCnh} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Campos condicionais — só aparecem se a resposta for "Sim" (dados do veículo próprio) */}
                <AnimatePresence>
                  {data.temVeiculo === 'sim' && (
                    <motion.div key="veiculo-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Field label="Modelo do UTV ou Quadriciclo" required error={errors.modeloVeiculo} fieldRef={el => { fieldRefs.current['modeloVeiculo'] = el }}>
                          <Input value={data.modeloVeiculo} onChange={v => set('modeloVeiculo', v)} placeholder="Ex: Can-Am Maverick X3" error={!!errors.modeloVeiculo} shakeNonce={shakeNonce} />
                        </Field>
                        <Field label="Ano de Fabricação" required error={errors.anoVeiculo} fieldRef={el => { fieldRefs.current['anoVeiculo'] = el }}>
                          <Input value={data.anoVeiculo} onChange={v => set('anoVeiculo', v)} placeholder="Ex: 2023" mask="ano" error={!!errors.anoVeiculo} shakeNonce={shakeNonce} />
                        </Field>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <FileInput label="Documento do UTV ou Quadriciclo" value={data.docVeiculo} onChange={f => set('docVeiculo', f)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Campos condicionais — só aparecem se a resposta for "Não" (locação) */}
                <AnimatePresence>
                  {data.temVeiculo === 'nao' && (
                    <motion.div key="locacao-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginBottom: '1.5rem', paddingTop: '0.5rem' }} ref={el => { fieldRefs.current['tipoLocacao'] = el }}>
                        <p style={{ ...labelStyle, marginBottom: '1rem' }}>Precisa alugar um Quadriciclo ou um UTV? {requiredStar}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                          {[
                            { value: 'quadriciclo', label: 'Quadriciclo', sub: 'Alugar 1 quadriciclo' },
                            { value: 'utv', label: 'UTV', sub: 'Alugar 1 UTV' },
                            { value: 'personalizado', label: 'Personalizado', sub: 'Mais de um, ou os dois tipos' },
                          ].map(opt => (
                            <button key={opt.value} type="button" onClick={() => { set('tipoLocacao', opt.value); setErrors(p => ({ ...p, tipoLocacao: '' })) }} style={{ padding: '1.25rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.25s', border: `2px solid ${data.tipoLocacao === opt.value ? '#FF7B00' : errors.tipoLocacao ? '#ef4444' : '#EBEBEB'}`, background: data.tipoLocacao === opt.value ? 'rgba(255,123,0,0.05)' : '#fff' }}>
                              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: data.tipoLocacao === opt.value ? '#FF7B00' : '#0A0A0A', marginBottom: '0.3rem' }}>{opt.label}</p>
                              <p style={{ fontSize: '0.78rem', color: '#999', fontFamily: "'Inter', sans-serif" }}>{opt.sub}</p>
                            </button>
                          ))}
                        </div>
                        <AnimatePresence>
                          {errors.tipoLocacao && (
                            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorTextStyle}>
                              <AlertCircle size={11} /> {errors.tipoLocacao}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {data.tipoLocacao === 'personalizado' && (
                          <motion.div key="personalizado-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1.25rem', background: '#F7F7F5', border: '1px solid #EBEBEB', marginBottom: '1rem' }}>
                              <QuantityStepper label="Quadriciclos" value={data.qtdQuadriciclos} onChange={v => set('qtdQuadriciclos', v)} />
                              <QuantityStepper label="UTVs" value={data.qtdUtvs} onChange={v => set('qtdUtvs', v)} />
                              <div style={{ flex: 1, minWidth: '220px' }}>
                                <label style={labelStyle}>Observações (opcional)</label>
                                <textarea
                                  value={data.observacaoLocacao}
                                  onChange={e => set('observacaoLocacao', e.target.value)}
                                  placeholder="Ex: preciso de 2 UTVs e 1 quadriciclo para o fim de semana todo"
                                  rows={2}
                                  style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Caixa de confirmação — sempre visível, independente da resposta acima */}
                <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }} ref={el => { fieldRefs.current['confirmacao'] = el }}>
                  <ShakeWrap error={!!errors.confirmacao} shakeNonce={shakeNonce}>
                    <div onClick={() => { set('confirmacao', !data.confirmacao); setErrors(p => ({ ...p, confirmacao: '' })) }} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', cursor: 'pointer', padding: '1.25rem', transition: 'all 0.2s', border: `1.5px solid ${data.confirmacao ? '#FF7B00' : errors.confirmacao ? '#ef4444' : '#EBEBEB'}`, background: data.confirmacao ? 'rgba(255,123,0,0.04)' : '#fff' }}>
                      <div style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0, marginTop: '2px', border: `2px solid ${data.confirmacao ? '#FF7B00' : '#DEDEDE'}`, background: data.confirmacao ? '#FF7B00' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        {data.confirmacao && <Check size={10} color="#fff" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>Confirmo que as informações fornecidas são verdadeiras e que estou ciente das regras do evento.<span style={{ color: '#FF7B00' }}> *</span></span>
                    </div>
                  </ShakeWrap>
                  <AnimatePresence>
                    {errors.confirmacao && (
                      <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={errorTextStyle}>
                        <AlertCircle size={11} /> {errors.confirmacao}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {erroValidacao && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", marginBottom: '1rem', justifyContent: 'flex-end' }}>
                      <AlertCircle size={14} /> {erroValidacao}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <BtnVoltar onClick={prevStep} />
                  <motion.button type="button" onClick={nextStep} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: '#FF7B00', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, transition: 'background 0.2s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E06B00' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FF7B00' }}>
                    Próximo <ArrowRight size={15} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2 — Revisão ══════════════════════════════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ ...labelStyle, color: '#FF7B00', fontSize: '0.65rem', margin: 0 }}>— Dados Pessoais</p>
                    <button type="button" onClick={() => setStep(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textDecoration: 'underline' }}>Editar</button>
                  </div>
                  <div style={{ border: '1px solid #EBEBEB', padding: '1.25rem' }}>
                    <RevisaoLinha label="Tipo" value={data.tipoInscricao === 'individual' ? 'Piloto Individual' : 'Piloto + Acompanhante'} />
                    <RevisaoLinha label="Nome" value={data.nome} />
                    <RevisaoLinha label="Email" value={data.email} />
                    <RevisaoLinha label="WhatsApp" value={data.whatsapp} />
                    <RevisaoLinha label="Nacionalidade" value={data.nacionalidade} />
                    <RevisaoLinha label="CPF" value={data.cpf} />
                    <RevisaoLinha label="RG" value={data.rg} />
                    <RevisaoLinha label="Estado Civil" value={data.estadoCivil} />
                    <RevisaoLinha label="Tamanho da Camiseta" value={data.tamanhoCamiseta} />
                    <RevisaoLinha label="Endereço" value={[data.endereco, data.numero, data.complemento, data.bairro, data.estado, data.cep].filter(Boolean).join(', ')} />
                    {data.tipoInscricao === 'dupla' && <RevisaoLinha label="Acompanhantes" value={`${totalAcomp} pessoa${totalAcomp !== 1 ? 's' : ''}`} />}
                    <RevisaoLinha label="Como nos encontrou" value={data.comoChegou === 'Outro' ? `Outro: ${data.comoChegouOutro}` : data.comoChegou} />
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ ...labelStyle, color: '#FF7B00', fontSize: '0.65rem', margin: 0 }}>— Veículo</p>
                    <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textDecoration: 'underline' }}>Editar</button>
                  </div>
                  <div style={{ border: '1px solid #EBEBEB', padding: '1.25rem' }}>
                    <RevisaoLinha label="Veículo próprio" value={data.temVeiculo === 'sim' ? 'Sim' : data.temVeiculo === 'nao' ? 'Não — locação' : ''} />
                    {(data.temVeiculo === 'sim' || data.temVeiculo === 'nao') && (
                      <>
                        <RevisaoLinha label="CNH" value={data.numeroCnh} />
                        <RevisaoLinha label="Doc. CNH" value={data.docCnh?.name || ''} />
                      </>
                    )}
                    {data.temVeiculo === 'sim' && (
                      <>
                        <RevisaoLinha label="Modelo" value={data.modeloVeiculo} />
                        <RevisaoLinha label="Ano" value={data.anoVeiculo} />
                        <RevisaoLinha label="Doc. Veículo" value={data.docVeiculo?.name || ''} />
                      </>
                    )}
                    {data.temVeiculo === 'nao' && (
                      <>
                        <RevisaoLinha label="Deseja alugar" value={data.tipoLocacao === 'quadriciclo' ? 'Quadriciclo' : data.tipoLocacao === 'utv' ? 'UTV' : data.tipoLocacao === 'personalizado' ? 'Personalizado' : ''} />
                        {data.tipoLocacao === 'personalizado' && (
                          <>
                            {data.qtdQuadriciclos > 0 && <RevisaoLinha label="Qtd. Quadriciclos" value={String(data.qtdQuadriciclos)} />}
                            {data.qtdUtvs > 0 && <RevisaoLinha label="Qtd. UTVs" value={String(data.qtdUtvs)} />}
                            <RevisaoLinha label="Observações" value={data.observacaoLocacao} />
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255,123,0,0.06)', border: '1px solid rgba(255,123,0,0.2)', marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>✅ Ao finalizar, nossa equipe entrará em contato com o <strong style={{ color: '#0A0A0A' }}>valor final</strong> baseado no número de acompanhantes e com as instruções de pagamento.</p>
                </div>

                <AnimatePresence>
                  {erroEnvio && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", marginBottom: '1rem', justifyContent: 'flex-end' }}>
                      <AlertCircle size={14} /> Não foi possível enviar sua inscrição. Verifique sua internet e tente novamente.
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <BtnVoltar onClick={prevStep} />
                  <motion.button type="button" onClick={handleEnviar} disabled={enviando} whileHover={enviando ? {} : { scale: 1.02 }} whileTap={enviando ? {} : { scale: 0.97 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 2.5rem', background: enviando ? '#E06B00' : '#FF7B00', color: '#fff', border: 'none', cursor: enviando ? 'default' : 'pointer', fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, opacity: enviando ? 0.8 : 1, transition: 'background 0.2s' }}>
                    {enviando ? (
                      <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>Enviando...</>
                    ) : <>Finalizar Inscrição <Check size={15} /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}