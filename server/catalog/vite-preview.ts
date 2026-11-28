import { readFile } from 'node:fs/promises'
import type { Connect, Plugin } from 'vite'

export function localCatalog(): Plugin {
  const file = new URL('../../.catalogo-local/estoque.json', import.meta.url)
  const serve: Connect.NextHandleFunction = async (request, response, next) => {
    const image = request.url?.match(/^\/api\/catalogo-imagem-local\/([a-f0-9]{64})\.(jpg|png|webp|avif|gif)$/)
    if (image) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD')
        response.statusCode = 405
        response.end()
        return
      }

      const [, id, extension] = image
      const mime = extension === 'jpg' ? 'jpeg' : extension
      try {
        const bytes = await readFile(new URL('../../.catalogo-local/fotos/' + id + '.' + extension, import.meta.url))
        response.setHeader('Content-Type', 'image/' + mime)
        response.setHeader('Cache-Control', 'no-store')
        response.setHeader('X-Content-Type-Options', 'nosniff')
        response.end(request.method === 'HEAD' ? undefined : bytes)
      } catch (error) {
        response.statusCode = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT' ? 404 : 500
        response.end()
      }
      return
    }

    if (request.url?.split('?')[0] !== '/api/catalogo') return next()
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET')
      response.statusCode = 405
      response.end()
      return
    }
    try {
      const snapshot = JSON.parse(await readFile(file, 'utf8'))
      if (!Array.isArray(snapshot.catalog) || !Number.isFinite(Date.parse(snapshot.updatedAt))) {
        throw new Error('Prévia de estoque inválida.')
      }
      response.end(JSON.stringify({ products: snapshot.catalog, updatedAt: snapshot.updatedAt }))
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
        response.statusCode = 404
        response.end(JSON.stringify({ status: 'previsualizacao_desativada' }))
        return
      }
      response.statusCode = 503
      response.end(JSON.stringify({ status: 'indisponivel' }))
    }
  }

  return {
    name: 'usina-estoque-local',
    config: () => ({ server: { fs: { deny: ['**/.env', '**/.env.*', '**/*.{crt,pem}', '**/.git/**', '**/.catalogo-local/**'] } } }),
    configureServer(server) {
      server.middlewares.use(serve)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve)
    },
  }
}
