import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Heart, LogOut, MapPin, Package, Plus } from 'lucide-react'
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCatalog } from '../catalog/catalogContext'
import { formatCatalogPrice } from '../catalog/formatCatalogPrice'
import { useShop } from './ShopProvider'
import type { Address, AddressDraft, Order } from './types'
import './account.css'

const tabs = [
  { path: '/conta/pedidos', title: 'Meus pedidos', label: 'Pedidos', icon: Package },
  { path: '/conta/favoritos', title: 'Favoritos', label: 'Favoritos', icon: Heart },
  { path: '/conta/enderecos', title: 'Meus endereços', label: 'Endereços', icon: MapPin },
] as const
const defaultDestination = tabs[0].path
const reviewPath = '/carrinho?etapa=revisao'
const loginPath = '/conta/entrar'
const unavailableMessage = 'O acesso à conta está temporariamente indisponível. Tente novamente mais tarde.'
const brazilianStates = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dates = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' })

type AccessMode = 'login' | 'signup' | 'recover'
type ConfirmType = 'email' | 'signup' | 'recovery'

function safeDestination(value: string | null) {
  if (value === reviewPath) return value
  if (value === '/carrinho' || value === '/catalogo' || tabs.some(tab => tab.path === value)) return value
  if (value && /^\/catalogo\/produto\/[a-zA-Z0-9_-]{1,128}$/.test(value)) return value
  return null
}

function accessPath(destination: string, recover = false) {
  const params = new URLSearchParams({ voltar: destination })
  if (recover) params.set('modo', 'recuperar')
  return loginPath + '?' + params
}

function failureMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : 'Não foi possível concluir. Tente novamente.'
}

function useAccountAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)

  async function run(operation: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setError('')
    try {
      await operation()
    } catch (error) {
      setError(failureMessage(error))
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  return { pending, error, setError, run }
}

function AccountFeedback({ error, message }: { error: string; message?: string }) {
  if (error) return <p className="account-feedback account-feedback-error" role="alert">{error}</p>
  if (message) return <p className="account-feedback" role="status">{message}</p>
  return null
}

function AccessLayout({ title, children }: { title: string; children: ReactNode }) {
  const headline = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headline.current?.focus({ preventScroll: true })
  }, [title])

  return (
    <section className="account-access" aria-labelledby="account-access-title">
      <div className="account-access-frame">
        <figure className="account-access-image">
          <figcaption>Expedição Angra × Paraty</figcaption>
        </figure>
        <div className="account-access-panel">
          <div className="account-access-body">
            <Link className="account-back" to="/catalogo"><ArrowLeft size={16} aria-hidden="true" />Voltar ao catálogo</Link>
            <h1 id="account-access-title" ref={headline} tabIndex={-1}>{title}</h1>
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

function PasswordField({ create = false, disabled = false, label = 'Senha' }: { create?: boolean; disabled?: boolean; label?: string }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  const hint = id + '-hint'

  return (
    <div className="account-field">
      <label htmlFor={id}>{label}</label>
      <span className="account-password">
        <input id={id} name="password" type={visible ? 'text' : 'password'} required minLength={create ? 8 : undefined}
          maxLength={72} disabled={disabled} autoComplete={create ? 'new-password' : 'current-password'}
          aria-describedby={create ? hint : undefined} />
        <button type="button" className="account-password-toggle" disabled={disabled} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </span>
      {create && <small id={hint}>Use pelo menos 8 caracteres.</small>}
    </div>
  )
}

const accessCopy = {
  login: { title: 'Minha conta', description: 'Acesse seus pedidos, favoritos e endereços.', button: 'Entrar' },
  signup: { title: 'Criar conta', description: 'Use seu e-mail para criar uma conta na Usina do Jet.', button: 'Criar conta' },
  recover: { title: 'Recuperar senha', description: 'Informe o e-mail da sua conta para receber um link de recuperação.', button: 'Enviar link' },
}

function AccessForm({ destination }: { destination: string }) {
  const { action, enabled, googleEnabled, user } = useShop()
  const { search } = useLocation()
  const [mode, setMode] = useState<AccessMode>(() => (
    new URLSearchParams(search).get('modo') === 'recuperar' ? 'recover' : 'login'
  ))
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { pending, error, setError, run } = useAccountAction()
  const copy = accessCopy[mode]
  const showGoogle = enabled && googleEnabled && mode !== 'recover'
  const [googleError, setGoogleError] = useState(() => new URLSearchParams(search).get('google') === 'erro')

  function signInWithGoogle() {
    setGoogleError(false)
    setMessage('')
    void run(async () => {
      const response = await action({ action: 'google', destination })
      if (!response.redirectTo) throw new Error('Não foi possível entrar com o Google. Tente novamente.')
      window.location.assign(response.redirectTo)
    })
  }

  function switchMode(next: AccessMode) {
    setGoogleError(false)
    setMode(next)
    setMessage('')
    setError('')
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!enabled) return
    setGoogleError(false)
    const password = new FormData(event.currentTarget).get('password')
    void run(async () => {
      setMessage('')
      const response = await action({ action: mode, email: email.trim(), ...(mode !== 'recover' ? { password } : {}) })
      if (mode === 'recover') {
        setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.')
      } else if (mode === 'signup' && response.needsConfirmation) {
        setMessage('Confira seu e-mail e siga o link para confirmar a conta.')
      }
    })
  }

  if (user && !pending && mode !== 'recover') return <Navigate to={destination} replace />

  return (
    <AccessLayout title={copy.title}>
      <p className="account-description">{copy.description}</p>
      <AccountFeedback error={error || (googleError ? 'Não foi possível entrar com o Google. Tente novamente.' : '')} message={message} />
      {showGoogle && (
        <div className="account-oauth">
          <button className="account-button account-button-plain account-google" type="button" disabled={pending} onClick={signInWithGoogle}>
            <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.24 5.47-4.78 7.15l7.73 6C44.4 38 46.98 31.87 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.42 14.42 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.83l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.88l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            Entrar com Google
          </button>
          <span className="account-oauth-divider">ou use seu e-mail</span>
        </div>
      )}
      <form className="account-form" onSubmit={submit}>
        <label className="account-field">
          <span>E-mail</span>
          <input type="email" name="email" autoComplete={mode === 'login' ? 'username' : 'email'} autoCapitalize="none" required maxLength={254}
            disabled={!enabled} value={email} onChange={event => setEmail(event.target.value)} />
        </label>
        {mode !== 'recover' && <PasswordField key={mode} create={mode === 'signup'} disabled={!enabled} />}
        {mode === 'login' && (
          <button className="account-text-action account-recover" type="button" disabled={pending}
            onClick={() => switchMode('recover')}>Esqueci minha senha</button>
        )}
        {!enabled && <p className="account-availability" role="status">{unavailableMessage}</p>}
        <button className="account-button account-button-primary account-submit" disabled={pending || !enabled}>
          {pending ? 'Aguarde…' : copy.button}<ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
      <div className="account-access-switch">
        {mode === 'login' ? (
          <>Ainda não tem conta?{' '}
            <button className="account-text-action" type="button" disabled={pending} onClick={() => switchMode('signup')}>
              Criar conta
            </button>
          </>
        ) : (
          <button className="account-text-action" type="button" disabled={pending} onClick={() => switchMode('login')}>
            Voltar para entrar
          </button>
        )}
      </div>
    </AccessLayout>
  )
}

function Confirmation({ destination }: { destination: string }) {
  const { action, enabled } = useShop()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(hash.slice(1))
  const tokenHash = params.get('token_hash')
  const validToken = tokenHash && /^[a-z0-9_-]{16,256}$/i.test(tokenHash) ? tokenHash : null
  const type = params.get('type')
  const allowedType: ConfirmType | null = type === 'email' || type === 'signup' || type === 'recovery' ? type : null
  const recovery = allowedType === 'recovery'
  const [recoveryToken, showReset] = useState<string | null>(null)
  const { pending, error, run } = useAccountAction()

  function confirm() {
    if (!enabled || !validToken || !allowedType) return
    if (recovery) {
      showReset(validToken)
      return
    }
    void run(async () => {
      await action({ action: 'confirm', tokenHash: validToken, type: allowedType })
      void navigate(destination, { replace: true })
    })
  }

  function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!enabled || !recoveryToken || validToken !== recoveryToken) return
    const password = new FormData(event.currentTarget).get('password')
    void run(async () => {
      await action({ action: 'reset', tokenHash: recoveryToken, password })
      void navigate(destination, { replace: true })
    })
  }

  if (recovery && recoveryToken && recoveryToken === validToken) {
    return (
      <AccessLayout title="Redefinir senha">
        <p className="account-description">Escolha uma nova senha para a sua conta.</p>
        <form className="account-form" onSubmit={reset}>
          <PasswordField create label="Nova senha" />
          <AccountFeedback error={error} />
          <button className="account-button account-button-primary account-submit" disabled={pending || !enabled}>
            {pending ? 'Aguarde…' : 'Salvar nova senha'}<ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>
        <div className="account-access-switch">
          <Link className="account-text-action" to={accessPath(destination, true)}>Pedir outro link</Link>
        </div>
      </AccessLayout>
    )
  }

  return (
    <AccessLayout title={recovery ? 'Recuperar senha' : 'Confirmar e-mail'}>
      <p className="account-description">
        {!validToken || !allowedType
          ? 'O link está incompleto ou já foi usado. Volte ao acesso da conta para continuar.'
          : recovery ? 'Continue para escolher uma nova senha.' : 'Confirme seu e-mail para acessar sua conta.'}
      </p>
      <AccountFeedback error={error} />
      {!enabled && <p className="account-availability" role="status">{unavailableMessage}</p>}
      {validToken && allowedType && (
        <button className="account-button account-button-primary account-submit" disabled={pending || !enabled} onClick={confirm}>
          {pending ? 'Aguarde…' : recovery ? 'Continuar' : 'Confirmar e-mail'}<ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
      <div className="account-access-switch">
        <Link className="account-text-action" to={accessPath(destination, recovery)}>
          {recovery ? 'Pedir outro link' : 'Voltar para entrar'}
        </Link>
      </div>
    </AccessLayout>
  )
}

function EmptyAccountState({ icon: Icon, title, description, children }: {
  icon: typeof Package
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="account-empty">
      <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  )
}

const orderStatus: Record<Order['status'], string> = {
  pending: 'Aguardando pagamento',
  paid: 'Pagamento aprovado',
  preparing: 'Em preparação',
  packed: 'Pronto para envio',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

function Orders() {
  const { orders } = useShop()
  if (!orders.length) {
    return (
      <EmptyAccountState icon={Package} title="Você ainda não fez pedidos"
        description="Seus pedidos feitos pelo site aparecerão aqui.">
        <Link className="account-button account-button-dark" to="/catalogo">Explorar catálogo<ArrowRight size={17} aria-hidden="true" /></Link>
      </EmptyAccountState>
    )
  }

  return (
    <ul className="account-order-list">
      {orders.map(order => (
        <li className="account-order" key={order.id}>
          <div>
            <h2>Pedido {order.reference}</h2>
            {Number.isFinite(Date.parse(order.createdAt)) && <time dateTime={order.createdAt}>{dates.format(new Date(order.createdAt))}</time>}
            {order.trackingCode && <p>Rastreio <strong>{order.trackingCode}</strong></p>}
          </div>
          <div className="account-order-summary">
            <strong>{currency.format(order.total / 100)}</strong>
            <span data-status={order.status}>{orderStatus[order.status] ?? 'Status em atualização'}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Favorites() {
  const { favorites, toggleFavorite } = useShop()
  const { products, status } = useCatalog()
  const { pending, error, run } = useAccountAction()
  if (!favorites.length && !error) {
    return (
      <EmptyAccountState icon={Heart} title="Sua lista de favoritos está vazia"
        description="Toque no coração de um produto para guardar aqui.">
        <Link className="account-button account-button-dark" to="/catalogo">Explorar catálogo<ArrowRight size={17} aria-hidden="true" /></Link>
      </EmptyAccountState>
    )
  }

  return (
    <>
      <AccountFeedback error={error} />
      <ul className="account-favorite-list">
        {favorites.map(id => {
          const product = products.find(item => String(item.id) === id) ?? products.find(item => item.aliases?.includes(id))
          const image = product?.imagens.find(src => src && !src.includes('via.placeholder.com'))
          const name = product?.nome ?? (status === 'loading' ? 'Carregando produto…' : 'Produto indisponível')

          return (
            <li className="account-favorite" key={id}>
              <div className="account-favorite-image">
                {image ? <img src={image} alt="" loading="lazy" /> : <Package size={24} aria-hidden="true" />}
              </div>
              <div>
                <h2>
                  {product?.disponivel ? <Link to={'/catalogo/produto/' + encodeURIComponent(product.id)}>{name}</Link> : name}
                </h2>
                {product?.disponivel ? <p>{formatCatalogPrice(product.preco)}</p> : (
                  status !== 'loading' && <p>{status === 'unavailable' ? 'Catálogo temporariamente indisponível' : 'Fora do catálogo no momento'}</p>
                )}
              </div>
              <button className="account-favorite-remove" type="button" disabled={pending}
                aria-label={'Remover dos favoritos: ' + name} onClick={() => void run(() => toggleFavorite(id))}>
                <Heart size={20} fill="currentColor" aria-hidden="true" />
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

function AddressFields({ draft, pending, onCancel, onSave }: {
  draft: AddressDraft
  pending: boolean
  onCancel: () => void
  onSave: (next: AddressDraft) => void
}) {
  const headline = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headline.current?.focus()
  }, [])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const field = (name: string) => String(data.get(name) ?? '').trim()
    onSave({
      id: draft.id,
      label: field('label'),
      recipient: field('recipient'),
      postalCode: field('postalCode').replace(/\D/g, ''),
      street: field('street'),
      number: field('number'),
      complement: field('complement'),
      district: field('district'),
      city: field('city'),
      state: field('state'),
      isDefault: data.has('isDefault'),
    })
  }

  return (
    <form className="account-address-form" onSubmit={submit} aria-labelledby="account-address-form-title">
      <h2 ref={headline} id="account-address-form-title" tabIndex={-1}>{draft.id ? 'Editar endereço' : 'Novo endereço'}</h2>
      <div className="account-address-fields">
        <label className="account-field">Nome do endereço<input name="label" required maxLength={60} placeholder="Ex.: Casa" defaultValue={draft.label} /></label>
        <label className="account-field">Destinatário<input name="recipient" autoComplete="name" required maxLength={120} defaultValue={draft.recipient} /></label>
        <label className="account-field">CEP<input name="postalCode" inputMode="numeric" autoComplete="postal-code" required
          pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} placeholder="00000-000" defaultValue={draft.postalCode} /></label>
        <label className="account-field">Bairro<input name="district" autoComplete="address-level3" required maxLength={100} defaultValue={draft.district} /></label>
        <label className="account-field">Rua ou avenida<input name="street" autoComplete="address-line1" required maxLength={160} defaultValue={draft.street} /></label>
        <label className="account-field">Número<input name="number" required maxLength={32} defaultValue={draft.number} /></label>
        <label className="account-field">Cidade<input name="city" autoComplete="address-level2" required maxLength={100} defaultValue={draft.city} /></label>
        <label className="account-field">Estado<select name="state" autoComplete="address-level1" required defaultValue={draft.state}>
          <option value="">Selecione</option>
          {brazilianStates.map(state => <option value={state} key={state}>{state}</option>)}
        </select></label>
        <label className="account-field account-field-full">Complemento (opcional)
          <input name="complement" autoComplete="address-line2" maxLength={100} defaultValue={draft.complement} />
        </label>
      </div>
      <label className="account-checkbox"><input type="checkbox" name="isDefault" defaultChecked={draft.isDefault} /> Usar como endereço principal</label>
      <div className="account-form-actions">
        <button className="account-button account-button-primary" disabled={pending}>{pending ? 'Salvando…' : 'Salvar endereço'}</button>
        <button className="account-button account-button-plain" type="button" disabled={pending} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}

function Addresses({ review }: { review: boolean }) {
  const { addresses, action } = useShop()
  const [draft, setDraft] = useState<AddressDraft | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const { pending, error, setError, run } = useAccountAction()
  const addButton = useRef<HTMLButtonElement>(null)
  const confirmationButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const feedback = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (removeId) confirmationButton.current?.focus({ preventScroll: true })
  }, [removeId])

  useEffect(() => {
    if (error) feedback.current?.focus()
  }, [error])

  function open(next: Address | null, initiator: HTMLButtonElement) {
    opener.current = initiator
    setMessage('')
    setError('')
    setRemoveId(null)
    setDraft(next ?? {
      label: '', recipient: '', postalCode: '', street: '', number: '',
      complement: '', district: '', city: '', state: '', isDefault: !addresses.length,
    })
  }

  function cancelEdit() {
    setDraft(null)
    setError('')
    const origin = opener.current
    window.requestAnimationFrame(() => (origin?.isConnected ? origin : addButton.current)?.focus())
  }

  function save(next: AddressDraft) {
    void run(async () => {
      await action({ action: 'saveAddress', address: next })
      setDraft(null)
      setMessage('Endereço salvo.')
      window.requestAnimationFrame(() => feedback.current?.focus())
    })
  }

  function remove(address: Address) {
    void run(async () => {
      await action({ action: 'removeAddress', id: address.id })
      setRemoveId(null)
      setMessage('Endereço removido.')
      window.requestAnimationFrame(() => feedback.current?.focus())
    })
  }

  function setPrimaryAddress(address: Address) {
    void run(async () => {
      await action({ action: 'saveAddress', address: { ...address, isDefault: true } })
      setMessage('Endereço principal atualizado.')
      window.requestAnimationFrame(() => feedback.current?.focus())
    })
  }

  return (
    <>
      <div className="account-address-toolbar">
        {review && <Link className="account-back" to={reviewPath}><ArrowLeft size={17} aria-hidden="true" />Voltar à revisão</Link>}
        <button className="account-button account-button-dark" type="button" ref={addButton} disabled={pending || draft !== null}
          onClick={event => open(null, event.currentTarget)}><Plus size={17} aria-hidden="true" />Adicionar endereço</button>
      </div>
      <div className="account-address-feedback" tabIndex={-1} ref={feedback}>
        <AccountFeedback error={error} message={message} />
      </div>
      {draft && <AddressFields key={draft.id ?? 'new'} draft={draft} pending={pending} onCancel={cancelEdit} onSave={save} />}
      {!addresses.length && !draft && (
        <EmptyAccountState icon={MapPin} title="Nenhum endereço cadastrado"
          description="Salve um endereço para usar nas próximas compras." />
      )}
      {addresses.length > 0 && (
        <ul className="account-address-list">
          {addresses.map(address => (
            <li className="account-address" key={address.id}>
              <div className="account-address-heading">
                <h2>{address.label}</h2>
                {address.isDefault && <span><Check size={15} aria-hidden="true" />Principal</span>}
              </div>
              <p><strong>{address.recipient}</strong></p>
              <p>{address.street}, {address.number}{address.complement ? ' · ' + address.complement : ''}</p>
              <p>{address.district}, {address.city} – {address.state}</p>
              <p>CEP {address.postalCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>
              {removeId === address.id ? (
                <div className="account-address-actions">
                  <span>Remover este endereço?</span>
                  <button className="account-text-action" type="button" disabled={pending} ref={confirmationButton} onClick={() => remove(address)}>Confirmar remoção</button>
                  <button className="account-text-action" type="button" disabled={pending} onClick={() => {
                    setRemoveId(null)
                    window.requestAnimationFrame(() => document.getElementById('account-remove-' + address.id)?.focus())
                  }}>Cancelar</button>
                </div>
              ) : (
                <div className="account-address-actions">
                  <button className="account-text-action" type="button" disabled={pending || draft !== null}
                    onClick={event => open(address, event.currentTarget)}>Editar</button>
                  {!address.isDefault && (
                    <button className="account-text-action" type="button" disabled={pending || draft !== null}
                      onClick={() => setPrimaryAddress(address)}>Tornar principal</button>
                  )}
                  <button className="account-text-action" type="button" disabled={pending || draft !== null}
                    id={'account-remove-' + address.id}
                    onClick={() => {
                      setMessage('')
                      setError('')
                      setRemoveId(address.id)
                    }}>Remover</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Profile({ active, review }: { active: (typeof tabs)[number]; review: boolean }) {
  const { user, action } = useShop()
  const navigate = useNavigate()
  const { pending, error, run } = useAccountAction()
  const headline = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    headline.current?.focus({ preventScroll: true })
  }, [active])

  function logout() {
    void run(async () => {
      await action({ action: 'logout' })
      void navigate(loginPath, { replace: true })
    })
  }

  return (
    <section className="account-profile" aria-labelledby="account-profile-title">
      <header className="account-profile-header">
        <div>
          <p>Minha conta</p>
          <h1 id="account-profile-title" ref={headline} tabIndex={-1}>{active.title}</h1>
        </div>
        <Link className="account-back" to="/catalogo">Ir para o catálogo<ArrowRight size={17} aria-hidden="true" /></Link>
      </header>
      <div className="account-profile-body">
        <aside className="account-profile-sidebar">
          <p className="account-email">{user?.email}</p>
          <nav aria-label="Minha conta">
            {tabs.map(({ icon: Icon, label, path }) => (
              <NavLink to={path} key={path} end><Icon size={19} strokeWidth={1.7} aria-hidden="true" />{label}</NavLink>
            ))}
          </nav>
          <button className="account-logout" type="button" disabled={pending} onClick={logout}>
            <LogOut size={18} aria-hidden="true" />{pending ? 'Saindo…' : 'Sair da conta'}
          </button>
          <AccountFeedback error={error} />
        </aside>
        <div className="account-profile-content">
          {active.path === '/conta/pedidos' && <Orders />}
          {active.path === '/conta/favoritos' && <Favorites />}
          {active.path === '/conta/enderecos' && <Addresses review={review} />}
        </div>
      </div>
    </section>
  )
}

export default function AccountPage() {
  const { pathname, search } = useLocation()
  const { accountError, enabled, ready, retryAccount, user } = useShop()
  const { pending, run } = useAccountAction()
  const returnTo = safeDestination(new URLSearchParams(search).get('voltar'))
  const destination = returnTo ?? defaultDestination
  const page = pathname.replace(/\/+$/, '')
  const tab = tabs.find(item => item.path === page)

  if (!ready) {
    return <AccessLayout title="Minha conta"><p className="account-description" role="status">Carregando sua conta…</p></AccessLayout>
  }
  if (page === '/conta/confirmar' && (enabled || !accountError)) return <Confirmation destination={destination} />
  if (accountError) {
    return (
      <AccessLayout title="Minha conta">
        <AccountFeedback error={accountError} />
        <button type="button" className="account-button account-button-primary" disabled={pending} onClick={() => void run(retryAccount)}>
          {pending ? 'Aguarde…' : 'Tentar novamente'}
        </button>
      </AccessLayout>
    )
  }
  if (page === loginPath) return <AccessForm destination={destination} />
  if (!enabled) {
    return <Navigate to={accessPath(tab?.path ?? destination)} replace />
  }
  if (!tab) return <Navigate to={user ? defaultDestination : accessPath(destination)} replace />
  if (!user) return <Navigate to={accessPath(tab.path === '/conta/enderecos' && returnTo === reviewPath ? reviewPath : tab.path)} replace />

  return <Profile active={tab} review={returnTo === reviewPath} />
}

