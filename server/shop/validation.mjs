export class ShopError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const maximumBodySize = 32 * 1024
const invalid = () => new ShopError(400, 'Confira os dados informados e tente novamente.')
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const identifier = /^[a-z0-9_-]{1,128}$/i
const states = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '))

function field(value, max, min = 1) {
  if (typeof value !== 'string') throw invalid()
  const text = value.trim().normalize('NFC')
  if (text.length < min || text.length > max || /\p{Cc}/u.test(text)) throw invalid()
  return text
}

function emailAddress(value) {
  const email = field(value, 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) throw invalid()
  return email
}

function passwordValue(value, minimum) {
  if (typeof value !== 'string' || value.length < minimum || Buffer.byteLength(value, 'utf8') > 72 || value.includes('\0')) {
    throw new ShopError(400, 'Confira a senha. Use de 8 a 72 caracteres, considerando o limite de 72 bytes.')
  }
  return value
}

function otpHash(value) {
  if (typeof value !== 'string' || !/^[a-z0-9_-]{16,256}$/i.test(value)) throw invalid()
  return value
}

function uuid(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)) throw invalid()
  return value.toLowerCase()
}

function productId(value) {
  if (typeof value !== 'string' || !identifier.test(value)) throw invalid()
  return value
}

function cartLine(value, minimum) {
  if (!object(value) || !Number.isInteger(value.quantity) || value.quantity < minimum || value.quantity > 99) throw invalid()
  return {
    product_id: productId(value.productId),
    option_id: value.optionId == null ? '' : productId(value.optionId),
    quantity: value.quantity,
  }
}

function addressFields(value) {
  if (!object(value) || typeof value.isDefault !== 'boolean') throw invalid()
  const postalCode = field(value.postalCode, 9)
  const state = field(value.state, 2).toUpperCase()
  if (!/^\d{5}-?\d{3}$/.test(postalCode) || !states.has(state)) throw invalid()

  return {
    id: value.id == null ? null : uuid(value.id),
    label: field(value.label, 60),
    recipient: field(value.recipient, 120),
    postal_code: postalCode.replace('-', ''),
    street: field(value.street, 160),
    number: field(value.number, 32),
    complement: field(value.complement ?? '', 100, 0),
    district: field(value.district, 100),
    city: field(value.city, 100),
    state,
    is_default: value.isDefault,
  }
}

export async function readAction(request) {
  const tooLarge = () => new ShopError(413, 'A solicitação excede o tamanho permitido.')
  if (Number(request.headers.get('content-length')) > maximumBodySize) throw tooLarge()
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/json') throw new ShopError(415, 'Envie os dados em JSON.')
  if (!request.body) throw invalid()

  let payload
  const reader = request.body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let text = ''
  let bytes = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maximumBodySize) {
        void reader.cancel().catch(() => {})
        throw tooLarge()
      }
      text += decoder.decode(value, { stream: true })
    }
    payload = JSON.parse(text + decoder.decode())
  } catch (error) {
    if (error instanceof ShopError) throw error
    throw invalid()
  } finally {
    reader.releaseLock()
  }
  if (!object(payload)) throw invalid()

  const { action } = payload
  switch (action) {
    case 'login':
    case 'signup':
      return { action, email: emailAddress(payload.email), password: passwordValue(payload.password, action === 'signup' ? 8 : 1) }
    case 'google':
      return { action, destination: payload.destination }
    case 'recover':
      return { action, email: emailAddress(payload.email) }
    case 'confirm':
      if (!['email', 'signup'].includes(payload.type)) throw invalid()
      return { action, token_hash: otpHash(payload.tokenHash) }
    case 'reset':
      return { action, token_hash: otpHash(payload.tokenHash), password: passwordValue(payload.password, 8) }
    case 'logout':
      return { action }
    case 'favorite':
      if (typeof payload.value !== 'boolean') throw invalid()
      return { action, accountId: uuid(payload.accountId), product_id: productId(payload.productId), value: payload.value }
    case 'cart':
      return { action, accountId: uuid(payload.accountId), line: cartLine(payload.line, 0) }
    case 'mergeCart':
      if (!Array.isArray(payload.lines) || payload.lines.length > 100) throw invalid()
      return { action, accountId: uuid(payload.accountId), lines: payload.lines.map(line => cartLine(line, 1)) }
    case 'saveAddress':
      return { action, accountId: uuid(payload.accountId), address: addressFields(payload.address) }
    case 'removeAddress':
      return { action, accountId: uuid(payload.accountId), id: uuid(payload.id) }
    default:
      throw invalid()
  }
}

