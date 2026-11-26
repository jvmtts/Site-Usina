import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogPhotoCache, publicCatalogPhoto } from '../server/catalog/photos.mjs'
import { catalogService, publicCatalog } from '../server/catalog/service.mjs'
import { protect, snapshotLifetime } from '../server/catalog/settings.mjs'

const timestamp = Date.parse('2026-11-26T10:00:00Z')
const product = {
  id: '00000000-0000-4000-8000-000000000011', nome: 'Colete de teste',
  ativo: true, estoque: { quantidade_disponivel: 2, valor_venda: 149 }, versao: 1,
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jSucAAAAASUVORK5CYII=', 'base64')
const photo = {
  id: '00000000-0000-4000-8000-000000000012', nome: 'colete.png', tamanho: png.byteLength,
  url_imagem: 'https://catalogo-contaazul.s3.sa-east-1.amazonaws.com/colete.png?X-Amz-Signature=first',
}

function memoryStore(now = () => timestamp) {
  const records = new Map()
  const write = async values => {
    for (const [name, value] of Object.entries(values)) {
      if (value === null) records.delete(name)
      else records.set(name, { value, expiresAt: Infinity })
    }
  }
  return {
    write,
    exclusive: work => work(write),
    read: async (...names) => names.map(name => {
      const record = records.get(name)
      return record?.expiresAt > now() ? record.value : null
    }),
    setTemporary: async (name, value, seconds) => {
      records.set(name, { value, expiresAt: now() + seconds * 1000 })
    },
  }
}

const imageResponse = () => new Response(png, { headers: { 'Content-Type': 'application/octet-stream' } })
const snapshotWith = (...paths) => ({ updatedAt: new Date(timestamp).toISOString(), catalog: [{ imagens: paths }] })

test('the collection publishes photo bytes under a current catalog URL and reuses them across signed URLs', async () => {
  const store = memoryStore()
  const config = { encryptionKey: 'test-only', bindings: {} }
  const credentials = { refreshToken: 'mock-refresh', accessToken: 'mock-access', expiresAt: timestamp + 3_600_000 }
  await store.write({ connection: protect(config, credentials) })
  let currentPhoto = photo
  const requests = []
  const service = catalogService(store, config, [], {
    now: () => timestamp,
    inventoryFor: () => ({
      list: async () => [product],
      detail: async () => ({ ...product, imagens: currentPhoto ? [currentPhoto] : [] }),
    }),
    photoFetcher: async (url, options) => {
      assert.equal(new URL(url).hostname, 'catalogo-contaazul.s3.sa-east-1.amazonaws.com')
      assert.equal(new Headers(options.headers).has('authorization'), false)
      assert.equal(options.redirect, 'error')
      requests.push(url)
      return imageResponse()
    },
  })

  assert.equal(await service.synchronize(), 'updated')
  const published = await publicCatalog(store, timestamp)
  const [path] = published.products[0].imagens
  assert.match(path, /^\/api\/catalogo-imagem\?id=[a-f0-9]{64}$/)
  const id = path.split('=')[1]
  const response = await publicCatalogPhoto(store, id, timestamp)
  assert.equal(response.headers.get('content-type'), 'image/png')
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), png)

  currentPhoto = { ...photo, url_imagem: photo.url_imagem.replace('first', 'second') }
  assert.equal(await service.synchronize(), 'updated')
  assert.deepEqual((await publicCatalog(store, timestamp)).products[0].imagens, [path])
  assert.equal(requests.length, 1)

  currentPhoto = null
  assert.equal(await service.synchronize(), 'updated')
  assert.deepEqual((await publicCatalog(store, timestamp)).products[0].imagens, [])
  assert.equal(await publicCatalogPhoto(store, id, timestamp), null)
})

test('a new product version checks the image again when the signed object path stays the same', async () => {
  const store = memoryStore()
  const changed = Buffer.concat([png, Buffer.from([0])])
  const first = catalogPhotoCache(store, null, timestamp + 60_000, { now: () => timestamp, fetcher: imageResponse })
  const oldPath = await first.cache(photo, product)
  const oldPublication = first.publication(snapshotWith(oldPath))
  await store.write(oldPublication)
  const second = catalogPhotoCache(store, oldPublication.photos, timestamp + 60_000, {
    now: () => timestamp, fetcher: () => new Response(changed, { headers: { 'Content-Type': 'image/png' } }),
  })
  const newPath = await second.cache(photo, { ...product, versao: 2 })
  assert.match(newPath, /^\/api\/catalogo-imagem\?id=[a-f0-9]{64}$/)
  assert.notEqual(newPath, oldPath)
  await store.write(second.publication(snapshotWith(newPath)))
  assert.equal(await publicCatalogPhoto(store, oldPath.split('=')[1], timestamp), null)
  const response = await publicCatalogPhoto(store, newPath.split('=')[1], timestamp)
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), changed)
})

test('uncached photos reject unapproved URLs, redirects, fake image bytes and oversized streaming responses', async () => {
  const candidates = [
    ['https://cdn.example.com/colete.png', () => assert.fail('Unapproved origin was fetched')],
    ['https://s3.amazonaws.com.example.com/colete.png', () => assert.fail('Unapproved origin was fetched')],
    ['http://catalogo-contaazul.s3.sa-east-1.amazonaws.com/colete.png', () => assert.fail('Unencrypted URL was fetched')],
    [photo.url_imagem, () => new Response(null, { status: 302, headers: { Location: 'https://cdn.example.com/' } })],
    [photo.url_imagem, () => new Response('<svg/>', { headers: { 'Content-Type': 'image/png' } })],
    [photo.url_imagem, () => new Response(Buffer.alloc(5 * 1024 * 1024), { headers: { 'Content-Type': 'image/png' } })],
  ]
  for (const [url_imagem, fetcher] of candidates) {
    let attempted = false
    const cache = catalogPhotoCache(memoryStore(), null, timestamp + 60_000, {
      now: () => timestamp,
      fetcher: (...args) => { attempted = true; return fetcher(...args) },
    })
    assert.equal(await cache.cache({ ...photo, url_imagem }), null)
    assert.equal(attempted, url_imagem === photo.url_imagem)
  }
})

test('published images are available only while referenced by a fresh catalog', async () => {
  const store = memoryStore()
  const cache = catalogPhotoCache(store, null, timestamp + 60_000, { now: () => timestamp, fetcher: imageResponse })
  const path = await cache.cache(photo)
  const id = path.split('=')[1]
  assert.equal(await publicCatalogPhoto(store, id, timestamp), null)
  await store.write(cache.publication(snapshotWith(path)))
  assert.ok(await publicCatalogPhoto(store, id, timestamp))
  assert.equal(await publicCatalogPhoto(store, id, timestamp + snapshotLifetime), null)
  assert.equal(await publicCatalogPhoto(store, id, timestamp - 1), null)
  assert.equal(await publicCatalogPhoto(store, 'invalid', timestamp), null)
})

test('downloads images from the Conta Azul short domain and follows only an approved photo destination', async () => {
  const store = memoryStore()
  const requests = []
  const cache = catalogPhotoCache(store, null, timestamp + 60_000, {
    now: () => timestamp,
    fetcher: (url, options) => {
      requests.push(url.hostname)
      assert.equal(new Headers(options.headers).has('authorization'), false)
      if (url.hostname !== 'conta.click') return imageResponse()
      const destination = url.pathname === '/foto' ? photo.url_imagem : 'https://images.example.com/'
      return new Response(null, { status: 302, headers: { Location: destination } })
    },
  })
  assert.match(await cache.cache({ ...photo, url_imagem: 'https://conta.click/foto' }), /^\/api\/catalogo-imagem/)
  assert.equal(await cache.cache({ ...photo, url_imagem: 'https://conta.click/fora' }), null)
  assert.deepEqual(requests, ['conta.click', 'catalogo-contaazul.s3.sa-east-1.amazonaws.com', 'conta.click'])
})


test('a photo used only by an in-stock option remains available from the image endpoint', async () => {
  const store = memoryStore()
  const cache = catalogPhotoCache(store, null, timestamp + 60_000, { now: () => timestamp, fetcher: imageResponse })
  const path = await cache.cache(photo)
  const id = path.split('=')[1]
  await store.write(cache.publication({
    updatedAt: new Date(timestamp).toISOString(),
    catalog: [{ imagens: [], opcoesEstoque: [{ label: 'Azul', images: [path] }] }],
  }))
  const response = await publicCatalogPhoto(store, id, timestamp)
  assert.equal(response?.headers.get('content-type'), 'image/png')
})

