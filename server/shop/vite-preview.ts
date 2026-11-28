import { Readable } from 'node:stream'
import { loadEnv } from 'vite'
import type { Connect, Plugin } from 'vite'
import { handleShop } from './handler.mjs'

export function localShop(): Plugin {
  let env: NodeJS.ProcessEnv
  const serve: Connect.NextHandleFunction = async (request, response, next) => {
    const path = request.url?.split('?')[0]
    if (path !== '/api/loja') return next()

    try {
      const secure = 'encrypted' in request.socket && request.socket.encrypted
      const origin = (secure ? 'https://' : 'http://') + request.headers.host
      const headers = new Headers()
      for (const [name, value] of Object.entries(request.headers)) {
        for (const item of Array.isArray(value) ? value : [value]) {
          if (item !== undefined) headers.append(name, item)
        }
      }
      const method = request.method ?? 'GET'
      const options = {
        method,
        headers,
        ...(method === 'POST' && { body: Readable.toWeb(request), duplex: 'half' as const }),
      }
      const result = await handleShop(new Request(new URL(path, origin), options), env)
      for (const [name, value] of result.headers) {
        if (name !== 'set-cookie') response.setHeader(name, value)
      }
      const cookies = result.headers.getSetCookie()
      if (cookies.length) response.setHeader('set-cookie', cookies)
      response.statusCode = result.status
      response.end(Buffer.from(await result.arrayBuffer()))
    } catch {
      response.statusCode = 503
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Cache-Control', 'private, no-store')
      response.setHeader('X-Content-Type-Options', 'nosniff')
      response.end(JSON.stringify({ error: 'A conta da loja está temporariamente indisponível. Tente novamente.' }))
    }
  }

  return {
    name: 'usina-loja-local',
    config: () => ({ server: { fs: { deny: ['**/server/shop/**', '**/supabase/**'] } } }),
    configResolved(config) {
      env = { ...loadEnv(config.mode, config.envDir ?? config.root, 'LOJA_'), ...process.env }
    },
    configureServer(server) {
      server.middlewares.use(serve)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve)
    },
  }
}
