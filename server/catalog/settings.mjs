import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { redisCatalog } from './redis.mjs'

const strongKey = /^[A-Za-z0-9_-]{43,128}$/
export const snapshotLifetime = 45 * 60_000

export function storage(env = process.env) {
  return redisCatalog({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
    namespace: env.CATALOG_NAMESPACE || 'site-usina',
  })
}

export function catalogSettings(env = process.env) {
  const origin = new URL(env.CATALOG_ORIGIN)
  if (origin.origin !== env.CATALOG_ORIGIN || origin.protocol !== 'https:' ||
      !strongKey.test(env.CATALOG_ADMIN_KEY ?? '') || !strongKey.test(env.CATALOG_ENCRYPTION_KEY ?? '')) {
    throw new Error('Controle do catálogo indisponível.')
  }
  const expectedTaxId = (env.CATALOG_EMPRESA_CNPJ || '').replace(/\D/g, '')
  if (env.CATALOG_EMPRESA_CNPJ && expectedTaxId.length !== 14) throw new Error('CNPJ da vitrine inválido.')
  return {
    origin: origin.origin,
    redirectUri: origin.origin + '/api/catalogo-admin',
    adminKey: env.CATALOG_ADMIN_KEY,
    encryptionKey: env.CATALOG_ENCRYPTION_KEY,
    cronKey: strongKey.test(env.CRON_SECRET ?? '') ? env.CRON_SECRET : undefined,
    expectedTaxId,
    bindings: JSON.parse(env.CATALOG_CONTAAZUL_BINDINGS || '{}'),
  }
}

const digest = text => createHash('sha256').update(text).digest()

export function safeEqual(value, expected) {
  return typeof value === 'string' && typeof expected === 'string' && timingSafeEqual(digest(value), digest(expected))
}

function key(settings) {
  return digest('site-usina:catalogo:oauth:' + settings.encryptionKey)
}

export function protect(config, value) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(config), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()])
  return [iv, cipher.getAuthTag(), body].map(part => part.toString('base64url')).join('.')
}

export function reveal(config, record) {
  if (!record) return null
  const [iv, tag, body] = record.split('.').map(value => Buffer.from(value, 'base64url'))
  const cipher = createDecipheriv('aes-256-gcm', key(config), iv)
  cipher.setAuthTag(tag)
  return JSON.parse(Buffer.concat([cipher.update(body), cipher.final()]).toString('utf8'))
}
