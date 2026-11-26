import { publicCatalogPhoto } from '../server/catalog/photos.mjs'
import { storage } from '../server/catalog/settings.mjs'

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }

export default {
  async fetch(request) {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...headers, Allow: 'GET' } })
    const ids = new URL(request.url).searchParams.getAll('id')
    if (ids.length === 1) {
      try {
        const photo = await publicCatalogPhoto(storage(), ids[0])
        if (photo) return photo
      } catch {
        return new Response(null, { status: 503, headers })
      }
    }
    return new Response(null, { status: 404, headers })
  },
}

