import assert from 'node:assert/strict'
import { test } from 'node:test'
import { handleShop } from './handler.mjs'

const origin = 'https://loja.example'
const subject = '558d77fe-5740-44ee-8b1e-d55152dd354e'
const config = {
  LOJA_SUPABASE_URL: 'https://example.supabase.co',
  LOJA_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
}
const post = (data, headers = {}, credentials = config) => handleShop(new Request(origin + '/api/loja', {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(data),
}), credentials)

test('account endpoint stays private and usable when Supabase is not configured', async () => {
  const response = await handleShop(new Request(origin + '/api/loja'), {})
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.deepEqual(await response.json(), {
    enabled: false, user: null, cart: [], favorites: [], addresses: [], orders: [],
  })
  assert.equal((await post({ action: 'logout' }, {}, {})).status, 503)
})

test('mutations reject missing, foreign and lookalike origins before contacting Supabase', async () => {
  for (const [headers, body] of [
    [{ 'Content-Type': 'application/json' }, '{}'],
    [{ Origin: 'https://elsewhere.example', 'Content-Type': 'application/json' }, '{}'],
    [{ Origin: origin + '.elsewhere.example', 'Content-Type': 'application/json' }, '{}'],
    [{ Origin: origin, 'Sec-Fetch-Site': 'cross-site', 'Content-Type': 'application/json' }, '{}'],
  ]) {
    const response = await handleShop(new Request(origin + '/api/loja', { method: 'POST', headers, body }), config)
    assert.equal(response.status, 403)
  }
})

test('rejects non-JSON, malformed JSON, large bodies, and out-of-bounds quantities', async () => {
  const cart = { action: 'cart', accountId: subject, line: { productId: '1', optionId: null, quantity: 100 } }
  assert.equal((await post(cart, { 'Content-Type': 'text/plain' })).status, 415)
  assert.equal((await post({ action: 'mergeCart', lines: 'a'.repeat(33_000) })).status, 413)
  assert.equal((await post(cart)).status, 400)
  const malformed = await handleShop(new Request(origin + '/api/loja', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{',
  }), config)
  assert.equal(malformed.status, 400)
})

test('only an authenticated customer may mutate cart and address data', async () => {
  const response = await post({ action: 'cart', accountId: subject, line: { productId: 'ca-fixture', optionId: null, quantity: 1 } })
  assert.equal(response.status, 401)
})

test('secure cookie sessions authorize database requests and expose only account summary', async t => {
  const email = 'fake@example.com'
  const user = { id: subject, email, aud: 'authenticated', app_metadata: {}, user_metadata: { server_only: true } }
  const token = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ sub: subject, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'),
    'bW9jaw',
  ].join('.')
  const received = []
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const request = new Request(input, options)
    const { pathname, search } = new URL(request.url)
    received.push({ pathname, search, authorization: request.headers.get('authorization'), body: await request.text() })
    if (pathname === '/auth/v1/token') {
      return Response.json({ access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, user })
    }
    if (pathname === '/auth/v1/verify') {
      return Response.json({ access_token: token, refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, user })
    }
    if (pathname === '/auth/v1/user') {
      const entry = received.at(-1)
      if (request.method === 'PUT' && JSON.parse(entry.body).password === 'Repeated password') {
        return Response.json({ code: 'same_password', message: 'Password already used' }, { status: 422 })
      }
      return Response.json(user)
    }
    if (pathname === '/auth/v1/logout') return new Response(null, { status: 204 })
    if (pathname === '/rest/v1/shop_cart' && request.method === 'GET') {
      return Response.json([{ product_id: '7', option_id: '', quantity: 2 }])
    }
    if (pathname === '/rest/v1/rpc/shop_merge_cart') return Response.json(null)
    if (pathname === '/rest/v1/shop_orders') {
      return Response.json([{ id: 'pedido-1', reference: 'US-1', status: 'shipped', created_at: '2026-11-01T10:00:00Z', total_cents: 13990, tracking_code: null }])
    }
    return Response.json([])
  })
  const fixtures = config
  const login = await post({ action: 'login', email, password: 'Senha segura!' }, {}, fixtures)
  assert.equal(login.status, 200)
  assert.deepEqual(await login.json(), { ok: true })
  const sessionCookies = login.headers.getSetCookie()
  assert.ok(sessionCookies.length)
  for (const cookie of sessionCookies) {
    assert.match(cookie, /^__Host-loja-session/)
    assert.match(cookie, /HttpOnly/i)
    assert.match(cookie, /Secure/i)
    assert.match(cookie, /SameSite=Lax/i)
    assert.doesNotMatch(cookie, /Domain=/i)
  }
  const Cookie = sessionCookies.map(cookie => cookie.split(';')[0]).join('; ')
  const response = await handleShop(new Request(origin + '/api/loja', { headers: { Cookie } }), fixtures)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    enabled: true, user: { id: subject, email }, cart: [{ productId: '7', optionId: null, quantity: 2 }],
    favorites: [], addresses: [], orders: [
      { id: 'pedido-1', reference: 'US-1', status: 'shipped', createdAt: '2026-11-01T10:00:00Z', total: 13990, trackingCode: null },
    ],
  })

  const stale = await post({
    action: 'cart', accountId: 'fe77928f-7e68-45a8-b10b-53bf80ec56d7',
    line: { productId: '7', optionId: null, quantity: 0 },
  }, { Cookie }, fixtures)
  assert.equal(stale.status, 409)

  const merged = await post({ action: 'mergeCart', accountId: subject, lines: [
    { productId: '7', optionId: null, quantity: 3, price: 1 },
    { productId: '8', optionId: 'ca-variant', quantity: 5 },
  ] }, { Cookie }, fixtures)
  assert.equal(merged.status, 200)
  const dbCalls = received.filter(call => call.pathname.startsWith('/rest/v1/'))
  assert.equal(dbCalls.length, 5)
  assert.ok(dbCalls.every(call => call.authorization === 'Bearer ' + token))
  assert.deepEqual(JSON.parse(dbCalls.find(call => call.pathname.endsWith('shop_merge_cart')).body), {
    lines: [{ product_id: '7', option_id: '', quantity: 3 }, { product_id: '8', option_id: 'ca-variant', quantity: 5 }],
  })

  const password = 'Senha recuperada!'
  const tokenHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  assert.equal((await post({ action: 'reset', password }, { Cookie }, fixtures)).status, 400)
  assert.equal((await post({ action: 'confirm', type: 'recovery', tokenHash }, {}, fixtures)).status, 400)
  assert.equal(received.filter(call => call.pathname === '/auth/v1/verify').length, 0)

  const successfulReset = await post({ action: 'reset', tokenHash, password }, {}, fixtures)
  assert.equal(successfulReset.status, 200)
  assert.match(successfulReset.headers.getSetCookie()[0], /HttpOnly/i)
  const otp = received.find(call => call.pathname === '/auth/v1/verify')
  const { type, token_hash } = JSON.parse(otp.body)
  assert.equal(type, 'recovery')
  assert.equal(token_hash, tokenHash)
  const change = received.find(call => call.pathname === '/auth/v1/user' && call.body)
  assert.equal(change.authorization, 'Bearer ' + token)
  assert.equal(JSON.parse(change.body).password, password)

  const failedReset = await post({ action: 'reset', tokenHash, password: 'Repeated password' }, {}, fixtures)
  assert.equal(failedReset.status, 400)
  assert.deepEqual(failedReset.headers.getSetCookie(), [])
  assert.equal(received.at(-1).pathname, '/auth/v1/logout')
  assert.equal(received.at(-1).search, '?scope=local')
})


test('Google OAuth exchanges the code with the verifier from the initiating browser', async t => {
  const credentials = { ...config, LOJA_GOOGLE_LOGIN: 'true' }
  const callback = origin + '/api/loja'
  const user = { id: subject, email: 'oauth@example.com', app_metadata: {}, user_metadata: {} }
  let exchanged = 0
  t.mock.method(globalThis, 'fetch', async (input, init) => {
    assert.equal(String(input), config.LOJA_SUPABASE_URL + '/auth/v1/token?grant_type=pkce')
    const { auth_code, code_verifier } = JSON.parse(init.body)
    assert.equal(auth_code, 'example-oauth-code')
    assert.ok(code_verifier.length >= 43)
    exchanged++
    return Response.json({ access_token: 'fixture', refresh_token: 'fixture', token_type: 'bearer', expires_in: 3600, user })
  })

  assert.equal((await post({ action: 'google' })).status, 403)
  const start = await post({ action: 'google', destination: '/carrinho?etapa=revisao' }, {}, credentials)
  assert.equal(start.status, 200)
  const authorization = new URL((await start.json()).redirectTo)
  assert.equal(authorization.searchParams.get('provider'), 'google')
  assert.equal(authorization.searchParams.get('redirect_to'), callback)
  assert.equal(authorization.searchParams.get('code_challenge_method'), 's256')
  const cookies = start.headers.getSetCookie()
  assert.ok(cookies.some(value => /^__Host-loja-session-flow-/.test(value)))
  assert.ok(cookies.every(value => /HttpOnly/i.test(value) && /Secure/i.test(value)))

  const unaffiliated = await handleShop(new Request(callback + '?code=example-oauth-code'), credentials)
  assert.equal(exchanged, 0)
  assert.match(unaffiliated.headers.get('location'), /^https:\/\/loja\.example\/conta\/entrar\?google=erro/)
  const request = new Request(callback + '?code=example-oauth-code', {
    headers: { cookie: cookies.map(value => value.split(';', 1)[0]).join('; ') },
  })
  const finished = await handleShop(request, credentials)
  assert.equal(exchanged, 1)
  assert.equal(finished.status, 303)
  assert.equal(finished.headers.get('location'), origin + '/carrinho?etapa=revisao')
  assert.ok(finished.headers.getSetCookie().some(value => /^__Host-loja-session=/.test(value)))
  assert.ok(finished.headers.getSetCookie().some(value => /^__Host-loja-google-return=.*Max-Age=0/.test(value)))
})
