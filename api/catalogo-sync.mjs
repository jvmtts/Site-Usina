import { catalogService } from '../server/catalog/service.mjs'
import { catalogSettings, safeEqual, storage } from '../server/catalog/settings.mjs'
import { produtos } from '../src/data/produtos.ts'

const headers = { 'Cache-Control': 'no-store' }

export default {
  async fetch(request) {
    if (!['GET', 'POST'].includes(request.method)) {
      return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET, POST' } })
    }
    try {
      const config = catalogSettings()
      if (!config.cronKey || !safeEqual(request.headers.get('authorization'), 'Bearer ' + config.cronKey)) {
        return new Response(null, { status: 401, headers })
      }
      const result = await catalogService(storage(), config, produtos).synchronize()
      if (result === 'updated' || result === null) return new Response(null, { status: 204, headers })
      return Response.json({ status: result }, { status: result === 'sync_failed' ? 502 : 409, headers })
    } catch {
      return new Response(null, { status: 503, headers })
    }
  },
}
