import { isIP } from 'node:net'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import { readAction, ShopError } from './validation.mjs'

const emptyAccount = { user: null, cart: [], favorites: [], addresses: [], orders: [] }
const noCache = {
  'Cache-Control': 'private, no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
}
const googleFailure = 'Não foi possível entrar com o Google. Tente novamente.'
const googleCallback = '/api/loja'
const googleReturnPaths = new Set([
  '/carrinho', '/carrinho?etapa=revisao', '/catalogo', '/conta/pedidos', '/conta/favoritos', '/conta/enderecos',
])
const unavailable = 'A conta da loja está temporariamente indisponível. Tente novamente.'
const authActions = new Set(['login', 'signup', 'recover', 'confirm', 'reset'])
const attempts = new Map()
const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

function trustedTransport(url) {
  return url.protocol === 'https:' || (url.protocol === 'http:' && loopback.has(url.hostname))
}

function providerConfig(env) {
  const address = env.LOJA_SUPABASE_URL ?? ''
  if (!URL.canParse(address)) return null
  const url = new URL(address)
  const key = env.LOJA_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!trustedTransport(url) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
  if (!key?.startsWith('sb_publishable_')) return null
  return { url: url.origin, key, googleEnabled: env.LOJA_GOOGLE_LOGIN === 'true' }
}

function throttleAuth(request, env) {
  const ip = env.VERCEL === '1' && request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim()
  const source = ip && isIP(ip) ? ip : 'local'
  const now = Date.now()
  for (const [key, attempt] of attempts) {
    if (attempt.expires <= now) attempts.delete(key)
  }
  let attempt = attempts.get(source)
  if (!attempt) {
    if (attempts.size >= 2048) attempts.delete(attempts.keys().next().value)
    attempt = { count: 0, expires: now + 60_000 }
    attempts.set(source, attempt)
  }
  if (attempt.count++ >= 12) throw new ShopError(429, 'Muitas tentativas. Aguarde um minuto e tente novamente.')
}

function clientForRequest({ url, key }, request, secure, headers) {
  const name = secure ? '__Host-loja-session' : 'loja-local-session'
  const sessionCookie = new RegExp(`^${name}(?:-flow-[a-zA-Z0-9_-]{8,64}-code-verifier|-flows-code-verifier|-code-verifier)?(?:\\.\\d+)?$`)
  const currentCookies = new Map(parseCookieHeader(request.headers.get('cookie') ?? '')
    .filter(cookie => sessionCookie.test(cookie.name))
    .map(cookie => [cookie.name, cookie.value]))
  const outgoing = new Map()
  return {
    client: createServerClient(url, key, {
      cookieOptions: { name, path: '/', sameSite: 'lax', httpOnly: true, secure },
      cookies: {
        getAll: () => Array.from(currentCookies, ([name, value]) => ({ name, value })),
        setAll(cookies) {
          for (const { name, value, options } of cookies) {
            if (options.maxAge === 0) currentCookies.delete(name)
            else currentCookies.set(name, value)
            outgoing.set(name, serializeCookieHeader(name, value, options))
          }
          headers.delete('Set-Cookie')
          for (const cookie of outgoing.values()) headers.append('Set-Cookie', cookie)
        },
      },
      global: {
        fetch(resource, init) {
          const timeout = AbortSignal.timeout(8_000)
          return fetch(resource, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout })
        },
      },
    }),
  }
}

function authFailure(error, status, message) {
  if (error.status === 429) throw new ShopError(429, 'Muitas tentativas. Aguarde antes de tentar novamente.')
  if (!error.status || error.status >= 500) throw new ShopError(503, unavailable)
  throw new ShopError(status, message)
}

async function signedUser(client) {
  const { data, error } = await client.auth.getUser()
  if (!error) return data.user
  if (error.name === 'AuthSessionMissingError' || [401, 403].includes(error.status) ||
      ['bad_jwt', 'session_not_found', 'user_not_found', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code)) return null
  authFailure(error, 503, unavailable)
}

function rows(result) {
  if (result.error?.code === 'P0002') throw new ShopError(404, 'Endereço não encontrado.')
  if (result.error?.code === '23505') throw new ShopError(409, 'Já existe um endereço com esses dados.')
  if (result.error) throw new ShopError(503, unavailable)
  return result.data
}

async function accountSnapshot(client, user) {
  if (!user) return emptyAccount
  const [cart, favors, addresses, orders] = await Promise.all([
    client.from('shop_cart').select('product_id,option_id,quantity').order('created_at'),
    client.from('shop_favorites').select('product_id').order('created_at', { ascending: false }),
    client.from('shop_addresses').select('id,label,recipient,postal_code,street,number,complement,district,city,state,is_default')
      .order('is_default', { ascending: false }).order('created_at'),
    client.from('shop_orders').select('id,reference,status,created_at,total_cents,tracking_code')
      .order('created_at', { ascending: false }).limit(100),
  ])
  return {
    user: { id: user.id, email: user.email ?? '' },
    cart: rows(cart).map(({ product_id, option_id, quantity }) => ({ productId: product_id, optionId: option_id || null, quantity })),
    favorites: rows(favors).map(({ product_id }) => product_id),
    addresses: rows(addresses).map(({ postal_code, is_default, ...address }) => ({ ...address, postalCode: postal_code, isDefault: is_default })),
    orders: rows(orders).map(({ total_cents, created_at, tracking_code, ...order }) => ({
      ...order, createdAt: created_at, total: total_cents, trackingCode: tracking_code,
    })),
  }
}

function googleDestination(value) {
  if (typeof value === 'string' && (googleReturnPaths.has(value) || /^\/catalogo\/produto\/[a-zA-Z0-9_-]{1,128}$/.test(value))) return value
  return '/conta/pedidos'
}

function googleCookieName(location) {
  return location.protocol === 'https:' ? '__Host-loja-google-return' : 'loja-local-google-return'
}

function setGoogleCookie(headers, location, value, maxAge) {
  headers.append('Set-Cookie', serializeCookieHeader(googleCookieName(location), value, {
    path: '/', httpOnly: true, secure: location.protocol === 'https:', sameSite: 'lax', maxAge,
  }))
}

async function startGoogle(client, command, location, config, headers) {
  if (!config.googleEnabled) throw new ShopError(403, 'O acesso com Google ainda está indisponível.')
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + googleCallback, skipBrowserRedirect: true },
  })
  if (error) authFailure(error, 400, googleFailure)
  const url = data.url && new URL(data.url)
  if (!url || url.origin !== config.url || url.pathname !== '/auth/v1/authorize' || !data.flowId) {
    throw new ShopError(503, googleFailure)
  }
  setGoogleCookie(headers, location, data.flowId + ':' + googleDestination(command.destination), 600)
  return { ok: true, redirectTo: url.href }
}

async function finishGoogle(client, request, location, config, headers) {
  const value = parseCookieHeader(request.headers.get('cookie') ?? '')
    .find(cookie => cookie.name === googleCookieName(location))?.value ?? ''
  const match = /^([a-zA-Z0-9_-]{8,64}):(.+)$/.exec(value)
  const destination = googleDestination(match?.[2])
  const code = location.searchParams.get('code')
  let redirectTo = '/conta/entrar?' + new URLSearchParams({ google: 'erro', voltar: destination })
  if (config.googleEnabled && match && !location.searchParams.has('error') && code && /^[a-zA-Z0-9_-]{8,256}$/.test(code)) {
    try {
      const { data, error } = await client.auth.exchangeCodeForSession(code, { flowId: match[1] })
      if (!error && data.session) redirectTo = destination
    } catch {
      // An interrupted OAuth exchange returns to the same sign-in screen.
    }
  }
  setGoogleCookie(headers, location, '', 0)
  headers.set('Location', location.origin + redirectTo)
  headers.set('Referrer-Policy', 'no-referrer')
  return new Response(null, { status: 303, headers })
}

async function authenticate(client, command, origin, headers) {
  const redirectTo = origin + '/conta/confirmar'
  const { action, email, password, token_hash } = command
  switch (action) {
    case 'login': {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error?.code === 'email_not_confirmed') throw new ShopError(403, 'Confirme seu e-mail antes de entrar.')
      if (error) authFailure(error, 401, 'E-mail ou senha incorretos.')
      return { ok: true }
    }
    case 'signup': {
      const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      if (error && error.code !== 'user_already_exists') authFailure(error, 400, 'Confira o e-mail e os requisitos da senha.')
      return { ok: true, needsConfirmation: !data.session }
    }
    case 'recover': {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
      if (error && error.code !== 'user_not_found') authFailure(error, 400, 'Não foi possível iniciar a recuperação. Tente novamente.')
      return { ok: true }
    }
    case 'confirm': {
      const { error } = await client.auth.verifyOtp({ token_hash, type: 'email' })
      if (error) authFailure(error, 400, 'Este link está inválido ou expirou. Solicite um novo e-mail.')
      return { ok: true }
    }
    case 'reset': {
      const { data, error } = await client.auth.verifyOtp({ token_hash, type: 'recovery' })
      if (error) authFailure(error, 400, 'Este link está inválido ou expirou. Solicite um novo e-mail.')
      if (!data.session) throw new ShopError(400, 'Solicite um novo link para redefinir a senha.')
      try {
        const { error: updateError } = await client.auth.updateUser({ password })
        if (updateError) authFailure(updateError, 400, 'Solicite um novo link e escolha uma senha diferente.')
      } catch (failure) {
        await client.auth.signOut({ scope: 'local' }).catch(() => {})
        headers.delete('Set-Cookie')
        throw failure
      }
      return { ok: true }
    }
  }
}

async function changeAccount(client, userId, command) {
  switch (command.action) {
    case 'favorite': {
      const { product_id, value } = command
      const favorites = client.from('shop_favorites')
      rows(await (value
        ? favorites.upsert({ user_id: userId, product_id }, { ignoreDuplicates: true })
        : favorites.delete().eq('user_id', userId).eq('product_id', product_id)))
      break
    }
    case 'cart': {
      const { product_id, option_id, quantity } = command.line
      const cart = client.from('shop_cart')
      rows(await (quantity > 0
        ? cart.upsert({ user_id: userId, product_id, option_id, quantity })
        : cart.delete().eq('user_id', userId).eq('product_id', product_id).eq('option_id', option_id)))
      break
    }
    case 'mergeCart':
      rows(await client.rpc('shop_merge_cart', { lines: command.lines }))
      break
    case 'saveAddress':
      rows(await client.rpc('shop_save_address', { address: command.address }))
      break
    case 'removeAddress':
      rows(await client.rpc('shop_remove_address', { address_id: command.id }))
      break
  }
  return { ok: true }
}

export async function handleShop(request, env = process.env) {
  const headers = new Headers(noCache)
  const json = (data, status = 200) => Response.json(data, { status, headers })
  try {
    const location = new URL(request.url)
    const config = providerConfig(env)
    if (request.method !== 'GET' && request.method !== 'POST') {
      headers.set('Allow', 'GET, POST')
      return json({ error: 'Método não permitido.' }, 405)
    }
    if (request.method === 'POST' && (request.headers.get('origin') !== location.origin ||
      (request.headers.has('sec-fetch-site') && request.headers.get('sec-fetch-site') !== 'same-origin'))) {
      return json({ error: 'Origem não permitida.' }, 403)
    }
    if (request.method === 'GET' && (!config || !trustedTransport(location))) return json({ enabled: false, ...emptyAccount })
    if (!config || !trustedTransport(location)) throw new ShopError(503, unavailable)

    const command = request.method === 'POST' ? await readAction(request) : null
    const { client } = clientForRequest(config, request, location.protocol === 'https:', headers)
    if (!command) {
      if (location.pathname === googleCallback && (location.searchParams.has('code') || location.searchParams.has('error'))) {
        return finishGoogle(client, request, location, config, headers)
      }
      return json({
        enabled: true,
        ...(config.googleEnabled ? { googleEnabled: true } : {}),
        ...await accountSnapshot(client, await signedUser(client)),
      })
    }
    if (command.action === 'google') {
      throttleAuth(request, env)
      return json(await startGoogle(client, command, location, config, headers))
    }
    if (authActions.has(command.action)) {
      throttleAuth(request, env)
      return json(await authenticate(client, command, location.origin, headers))
    }
    if (command.action === 'logout') {
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) authFailure(error, 503, unavailable)
      return json({ ok: true })
    }
    const user = await signedUser(client)
    if (!user) throw new ShopError(401, 'Entre na sua conta para continuar.')
    if (command.accountId !== user.id) {
      throw new ShopError(409, 'A conta mudou em outra aba. Atualize a página e tente novamente.')
    }
    return json(await changeAccount(client, user.id, command))
  } catch (error) {
    if (error instanceof ShopError) {
      if (error.status === 429) headers.set('Retry-After', '60')
      return json({ error: error.message }, error.status)
    }
    return json({ error: unavailable }, 503)
  }
}

