import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { snapshotLifetime } from './settings.mjs'

const endpoint = '/api/catalogo-imagem?id='
const photoId = /^[a-f0-9]{64}$/
const photoLimit = 4 * 1024 * 1024
const catalogLimit = 64 * 1024 * 1024
const maxCatalogPhotos = 500
const assetLifetime = 48 * 60 * 60
const refreshAfter = 24 * 60 * 60_000
const requestTimeout = 6_000
const storageReserve = 8_000
const contaAzulShortHost = 'conta.click'
const originHost = /^(?:[a-z0-9][a-z0-9.-]*\.)?s3(?:[.-](?:dualstack\.)?[a-z]{2}(?:-[a-z]+)+-\d+)?\.amazonaws\.com$/
const cloudFrontHost = /^d[a-z0-9]+\.cloudfront\.net$/
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex')
const hash = value => createHash('sha256').update(value).digest('hex')
const assetKey = id => 'photo:' + id

function permitted(url) {
  const host = url.hostname
  return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash &&
    (host === contaAzulShortHost || host === 'contaazul.com' || host.endsWith('.contaazul.com') ||
      originHost.test(host) || cloudFrontHost.test(host))
}

function imageType(bytes) {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.subarray(0, 8).equals(pngSignature)) return 'image/png'
  const prefix = bytes.toString('ascii', 0, 6)
  if (prefix === 'GIF87a' || prefix === 'GIF89a') return 'image/gif'
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (bytes.toString('ascii', 4, 8) === 'ftyp' && ['avif', 'avis'].includes(bytes.toString('ascii', 8, 12))) return 'image/avif'
  return null
}

async function readImage(response) {
  const declared = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > photoLimit ||
      (declared && !allowedTypes.has(declared) && declared !== 'application/octet-stream')) {
    await response.body?.cancel()
    return null
  }

  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > photoLimit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = Buffer.concat(chunks, size)
  const type = imageType(bytes)
  return type && (!allowedTypes.has(declared) || type === declared) ? { bytes, type } : null
}

export function catalogPhotoCache(store, previous, deadline, { fetcher = fetch, now = Date.now } = {}) {
  const sources = new Map()
  const assets = new Map()
  const pending = new Map()
  const stored = new Set()
  const origins = new Set()
  const stats = { candidates: 0, missingUrl: 0, blockedOrigin: 0, failed: 0, reused: 0, downloaded: 0 }
  let totalBytes = 0

  function trackOrigin(url) {
    if (url && origins.size < 12 && /^[a-z0-9][a-z0-9.-]{0,252}$/.test(url.hostname) &&
        url.hostname.includes('.') && !isIP(url.hostname)) origins.add(url.hostname)
  }

  async function download(url, signal) {
    if (url.hostname !== contaAzulShortHost) {
      return readImage(await fetcher(url, { redirect: 'error', signal }))
    }
    let destination = url
    for (let hop = 0; hop <= 2; hop++) {
      const response = await fetcher(destination, { redirect: 'manual', signal })
      if (response.status < 300 || response.status >= 400) return readImage(response)
      const location = response.headers.get('location')
      await response.body?.cancel()
      const next = location && location.length <= 8192 && URL.canParse(location, destination)
        ? new URL(location, destination) : null
      trackOrigin(next)
      if (!next || !permitted(next)) {
        stats.blockedOrigin++
        return null
      }
      destination = next
    }
    return null
  }

  function fits(id, size) {
    return assets.has(id) || (assets.size < maxCatalogPhotos && totalBytes + size <= catalogLimit)
  }

  function link(source, record) {
    if (!fits(record.id, record.size)) return null
    if (!assets.has(record.id)) totalBytes += record.size
    assets.set(record.id, record.size)
    sources.set(source, record)
    return endpoint + record.id
  }

  async function load(photo, url, source, version) {
    const previousPhoto = previous?.sources?.[source]
    const usable = photoId.test(previousPhoto?.id ?? '') &&
      Number.isSafeInteger(previousPhoto.size) && previousPhoto.size > 0 && previousPhoto.size <= photoLimit &&
      previousPhoto.expiresAt > now() + snapshotLifetime
    if (usable && previousPhoto.version === version && previousPhoto.expiresAt > now() + refreshAfter) {
      const path = link(source, previousPhoto)
      if (path) stats.reused++
      else stats.failed++
      return path
    }

    const timeout = Math.min(requestTimeout, deadline - now() - storageReserve)
    if (timeout > 0 && !(Number(photo.tamanho) > photoLimit)) {
      try {
        const image = await download(url, AbortSignal.timeout(timeout))
        if (image) {
          const id = hash(image.bytes)
          const size = image.bytes.byteLength
          if (fits(id, size)) {
            const expiresAt = now() + assetLifetime * 1000
            await store.setTemporary(assetKey(id), { type: image.type, data: image.bytes.toString('base64') }, assetLifetime)
            stored.add(id)
            const path = link(source, { id, size, version, expiresAt })
            if (path) {
              stats.downloaded++
              return path
            }
          }
        }
      } catch { /* An unavailable image does not interrupt stock synchronization. */ }
    }

    const path = usable ? link(source, previousPhoto) : null
    if (path) stats.reused++
    else stats.failed++
    return path
  }

  return {
    async cache(photo, product) {
      stats.candidates++
      const value = photo?.url_imagem
      if (typeof value !== 'string' || !value.trim()) {
        stats.missingUrl++
        return null
      }

      const url = value.length <= 8192 && URL.canParse(value) ? new URL(value) : null
      trackOrigin(url)
      if (!url || !permitted(url)) {
        stats.blockedOrigin++
        return null
      }

      const version = String(product?.versao ?? product?.ultima_atualizacao ?? '').slice(0, 64)
      const source = hash(JSON.stringify([
        url.origin, url.pathname, product?.id, photo.id, photo.nome, photo.tamanho,
      ]))
      if (!pending.has(source)) pending.set(source, load(photo, url, source, version))
      return pending.get(source)
    },

    diagnostics() {
      return { ...stats, origins: [...origins].sort() }
    },

    publication(snapshot) {
      const ids = new Set()
      for (const product of snapshot.catalog) {
        const paths = [
          ...(product.imagens ?? []), ...Object.values(product.imagensPorCor ?? {}).flat(),
          ...(product.opcoesEstoque ?? []).flatMap(option => option.images ?? []),
        ]
        for (const path of paths) {
          if (typeof path !== 'string' || !path.startsWith(endpoint)) continue
          const id = path.slice(endpoint.length)
          if (assets.has(id)) ids.add(id)
        }
      }
      const obsolete = [...new Set([...stored, ...(previous?.ids ?? [])])]
        .filter(id => photoId.test(id) && !ids.has(id)).map(id => [assetKey(id), null])
      return {
        photos: {
          updatedAt: snapshot.updatedAt,
          ids: [...ids],
          sources: Object.fromEntries([...sources].filter(([, record]) => ids.has(record.id))),
        },
        ...Object.fromEntries(obsolete),
      }
    },
  }
}

export async function publicCatalogPhoto(store, id, now = Date.now()) {
  if (typeof id !== 'string' || !photoId.test(id)) return null
  const [photos, asset] = await store.read('photos', assetKey(id))
  const collected = Date.parse(photos?.updatedAt)
  if (!Number.isFinite(collected) || collected > now || now - collected >= snapshotLifetime ||
      !Array.isArray(photos.ids) || !photos.ids.includes(id) || !allowedTypes.has(asset?.type) || typeof asset.data !== 'string') return null
  return new Response(Buffer.from(asset.data, 'base64'), { headers: {
    'Cache-Control': 'public, max-age=60',
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
    'Content-Type': asset.type,
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  } })
}
