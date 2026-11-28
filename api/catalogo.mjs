import { publicCatalog } from '../server/catalog/service.mjs'
import { storage } from '../server/catalog/settings.mjs'

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }

export default {
  async fetch(request) {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } })
    try {
      const data = await publicCatalog(storage())
      if (data) return Response.json(data, { headers: {
        ...headers, 'Vercel-CDN-Cache-Control': 'public, s-maxage=10',
      } })
    } catch { /* A vitrine fica indisponível até receber uma coleta válida. */ }
    return Response.json({ status: 'indisponivel' }, { status: 503, headers })
  },
}

