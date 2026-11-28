import { createHmac, randomBytes } from 'node:crypto'
import { adminPage, secureHeaders } from './admin-page.mjs'
import { safeEqual } from './settings.mjs'

const path = '/api/catalogo-admin'
const cookieName = '__Secure-usina-admin'
const cookieOptions = 'Path=' + path + '; Secure; HttpOnly; SameSite=Lax'
const sessionSeconds = 3600
const nonce = /^[A-Za-z0-9_-]{43}$/
const credential = /^[\x21-\x7e]{1,300}$/
const signature = (value, key) => createHmac('sha256', key).update(value).digest('base64url')

function cookie(value, maxAge) {
  return cookieName + '=' + value + '; Max-Age=' + maxAge + '; ' + cookieOptions
}

function redirect(location, setCookie) {
  return new Response(null, { status: 303, headers: {
    ...secureHeaders, Location: location, ...(setCookie && { 'Set-Cookie': setCookie }),
  } })
}

function back(notice) {
  return redirect(path + '?status=' + notice)
}

function sessionCookie(config) {
  const value = randomBytes(32).toString('base64url') + '.' + (Date.now() + sessionSeconds * 1000)
  return cookie(value + '.' + signature(value, config.adminKey), sessionSeconds)
}

function loggedIn(request, config) {
  const raw = request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1) ?? ''
  const [id, until, mac, extra] = raw.split('.')
  if (extra !== undefined || !nonce.test(id) || !/^\d{13}$/.test(until ?? '') || Number(until) <= Date.now() ||
      !nonce.test(mac ?? '') || !safeEqual(signature(id + '.' + until, config.adminKey), mac)) return null
  return id
}

async function formOf(request) {
  const max = 4096
  if (!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded') ||
      Number(request.headers.get('content-length') || 0) > max || !request.body) return null
  const reader = request.body.getReader()
  const parts = []
  let length = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    length += value.length
    if (length > max) {
      await reader.cancel()
      return null
    }
    parts.push(value)
  }
  return new URLSearchParams(Buffer.concat(parts, length).toString('utf8'))
}

export function catalogAdmin(service, config) {
  return async request => {
    try {
      const url = new URL(request.url)
      const session = loggedIn(request, config)

      if (request.method === 'GET') {
        if (['code','state','error'].some(key => url.searchParams.has(key))) {
          const state = url.searchParams.get('state') ?? ''
          const code = url.searchParams.get('code') ?? ''
          if (!session || !nonce.test(state) || !code || code.length > 4096) return back('invalid')
          return back(await service.connect(session, state, code) ?? 'busy')
        }
        const status = session ? await service.status() : null
        return adminPage({ status, redirectUri: config.redirectUri, notice: url.searchParams.get('status') })
      }

      if (request.method !== 'POST') {
        return new Response(null, { status: 405, headers: { ...secureHeaders, Allow: 'GET, POST' } })
      }
      if (request.headers.get('origin') !== config.origin) return back('invalid')
      const form = await formOf(request)
      if (!form) return back('invalid')
      const action = form.get('action')

      if (action === 'login') {
        const key = form.get('key')
        return key?.length <= 128 && safeEqual(key, config.adminKey)
          ? redirect(path, sessionCookie(config)) : back('bad_key')
      }
      if (!session) return redirect(path)
      if (action === 'logout') return redirect(path, cookie('', 0))
      if (action === 'save') {
        const clientId = form.get('clientId')?.trim() ?? ''
        const clientSecret = form.get('clientSecret')?.trim() ?? ''
        if (clientId.length > 200 || !credential.test(clientId) ||
            (clientSecret && !credential.test(clientSecret))) return back('invalid')
        return back(await service.save(clientId, clientSecret || null) ?? 'busy')
      }
      if (action === 'authorize') {
        const location = await service.authorization(session, randomBytes(32).toString('base64url'))
        return location ? redirect(location) : back('disconnected')
      }
      if (action === 'sync') return back(await service.synchronize() ?? 'busy')
      return back('invalid')
    } catch {
      return adminPage({ unavailable: true })
    }
  }
}

