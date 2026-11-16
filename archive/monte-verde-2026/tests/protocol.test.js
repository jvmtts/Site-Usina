import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import handler from '../api/protocol.js'

const originalFetch = globalThis.fetch
const originalUrl = process.env.KV_REST_API_URL
const originalToken = process.env.KV_REST_API_TOKEN
const originalUpstashUrl = process.env.UPSTASH_REDIS_REST_URL
const originalUpstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const requestId = '01234567-89ab-4cde-8fab-0123456789ab'

afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalUrl === undefined) delete process.env.KV_REST_API_URL
  else process.env.KV_REST_API_URL = originalUrl
  if (originalToken === undefined) delete process.env.KV_REST_API_TOKEN
  else process.env.KV_REST_API_TOKEN = originalToken
  if (originalUpstashUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL
  else process.env.UPSTASH_REDIS_REST_URL = originalUpstashUrl
  if (originalUpstashToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN
  else process.env.UPSTASH_REDIS_REST_TOKEN = originalUpstashToken
})

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
  }
}

test('rejects methods other than POST', async () => {
  const response = createResponse()
  await handler({ method: 'GET', headers: {} }, response)
  assert.equal(response.statusCode, 405)
  assert.equal(response.headers.Allow, 'POST')
})

test('rejects an invalid request ID before accessing Redis', async () => {
  const response = createResponse()
  await handler({ method: 'POST', body: { requestId: 'invalid' }, headers: {} }, response)
  assert.equal(response.statusCode, 400)
})

test('requires a configured Redis connection', async () => {
  delete process.env.KV_REST_API_URL
  delete process.env.KV_REST_API_TOKEN
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  const response = createResponse()
  await handler({ method: 'POST', body: { requestId }, headers: {} }, response)
  assert.equal(response.statusCode, 503)
})

test('returns 001 for the first new registration in a Monte Verde 2026 namespace', async () => {
  process.env.KV_REST_API_URL = 'https://example.upstash.io'
  process.env.KV_REST_API_TOKEN = 'test-token'
  let command
  globalThis.fetch = async (_url, options) => {
    command = JSON.parse(options.body)
    return new Response(JSON.stringify({ result: 1 }), { status: 200 })
  }

  const response = createResponse()
  await handler({ method: 'POST', body: { requestId }, headers: { 'x-forwarded-for': '192.0.2.1' } }, response)

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body, { protocol: '001' })
  assert.equal(command[0], 'EVAL')
  assert.equal(command[2], 3)
  assert.match(command[3], /usina:protocolo:monte-verde-2026:sequencia$/)
  assert.match(command[4], /solicitacao:01234567-89ab-4cde-8fab-0123456789ab$/)
})

test('limits excessive reservation attempts', async () => {
  process.env.KV_REST_API_URL = 'https://example.upstash.io'
  process.env.KV_REST_API_TOKEN = 'test-token'
  globalThis.fetch = async () => new Response(JSON.stringify({ result: -1 }), { status: 200 })
  const response = createResponse()
  await handler({ method: 'POST', body: { requestId }, headers: {} }, response)
  assert.equal(response.statusCode, 429)
})
