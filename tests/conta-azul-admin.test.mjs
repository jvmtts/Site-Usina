import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogAdmin } from '../server/catalog/admin.mjs'
import { connectedCompany } from '../server/catalog/conta-azul.mjs'
import { redisCatalog } from '../server/catalog/redis.mjs'
import { publicCatalog, catalogService } from '../server/catalog/service.mjs'
import { reveal, snapshotLifetime } from '../server/catalog/settings.mjs'

const origin = 'https://vitrine.example'
const config = {
  origin, redirectUri: origin + '/api/catalogo-admin', adminKey: 'a'.repeat(43),
  encryptionKey: 'e'.repeat(43), expectedTaxId: '00000000000191', bindings: {},
}
const item = { id: '00000000-0000-4000-8000-000000000011', nome: 'Colete Jet' }
const company = { id: '123456', name: 'Empresa de Teste', taxId: config.expectedTaxId }
const credential = 'credencial-sintetica'

function fixture() {
  const records = new Map()
  let busy = false
  let expires = Date.now() + 60 * 60_000
  let quantity = 1
  let invalidInventory = false
  let linkedCompany = company
  let calls = 0
  const store = {
    read: async (...keys) => keys.map(key => records.get(key) ?? null),
    setTemporary: async (key, value) => { records.set(key, value) },
    take: async key => {
      const value = records.get(key)
      records.delete(key)
      return value
    },
    async exclusive(work) {
      if (busy) return null
      busy = true
      try {
        return await work(async values => {
          for (const [key, value] of Object.entries(values)) {
            if (value === null) records.delete(key)
            else records.set(key, value)
          }
        })
      } finally {
        busy = false
      }
    },
  }
  const service = catalogService(store, config, [], {
    exchange: async (credentials, params) => {
      assert.equal(credentials.clientSecret, credential)
      calls++
      if (params.grant_type === 'authorization_code') assert.equal(params.redirect_uri, config.redirectUri)
      return { accessToken: 'api-token-' + calls, refreshToken: 'refresh-token-' + calls, expiresAt: expires }
    },
    companyFor: async () => linkedCompany,
    inventoryFor: () => ({
      list: async () => {
        if (invalidInventory) throw new Error('A API falhou.')
        return [item]
      },
      detail: async () => ({ ...item, ativo: true, estoque: { quantidade_disponivel: quantity, valor_venda: 149 } }),
    }),
  })
  return {
    store, service, handler: catalogAdmin(service, config),
    setQuantity: value => { quantity = value },
    failInventory: value => { invalidInventory = value },
    setExpiry: value => { expires = value },
    setCompany: person => { linkedCompany = person },
    exchangeCount: () => calls,
  }
}

function request({ method = 'GET', query = '', form, cookie, originHeader = origin } = {}) {
  return new Request(config.redirectUri + query, {
    method,
    headers: {
      ...(cookie && { cookie }),
      ...(method === 'POST' && { origin: originHeader }),
    },
    ...(form && { body: new URLSearchParams(form) }),
  })
}

async function login(handler) {
  const response = await handler(request({ method: 'POST', form: { action: 'login', key: config.adminKey } }))
  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /Secure; HttpOnly; SameSite=Lax/)
  return cookie.split(';')[0]
}

test('admin completes OAuth without displaying secrets and rejects forged or replayed requests', async () => {
  const { handler, store, exchangeCount } = fixture()
  const save = { action: 'save', clientId: 'app-de-teste', clientSecret: credential }
  const anonymous = await handler(request({ method: 'POST', form: save }))
  assert.equal(anonymous.headers.get('location'), '/api/catalogo-admin')
  const cookie = await login(handler)
  const post = (form, rest = {}) => handler(request({ method: 'POST', form, cookie, ...rest }))
  assert.match((await post(save, { originHeader: 'https://outside.example' })).headers.get('location'), /invalid/)
  assert.match((await post(save)).headers.get('location'), /saved/)
  const [stored] = await store.read('connection')
  assert.equal(stored.includes(credential), false)
  assert.equal(reveal(config, stored).clientSecret, credential)
  const page = await handler(request({ cookie }))
  assert.match(await page.text(), /Autorizar Conta Azul/)
  assert.equal(page.headers.get('cache-control'), 'no-store')

  const auth = new URL((await post({ action: 'authorize' })).headers.get('location'))
  const state = new URLSearchParams(auth.hash.split('?')[1]).get('state')
  assert.equal(auth.origin, 'https://login.contaazul.com')
  assert.match(state, /^[A-Za-z0-9_-]{43}$/)
  const query = '?state=' + state + '&code=example-code'
  const noSession = await handler(request({ query }))
  assert.match(noSession.headers.get('location'), /invalid/)
  const callback = await handler(request({ query, cookie }))
  assert.equal(callback.headers.get('location'), '/api/catalogo-admin?status=connected')
  const replay = await handler(request({ query, cookie }))
  assert.match(replay.headers.get('location'), /invalid/)
  assert.equal(exchangeCount(), 1)

  const connectedPage = await (await handler(request({ cookie }))).text()
  assert.match(connectedPage, /Empresa de Teste/)
  assert.match(connectedPage, /Sincronizar estoque/)
  assert.equal(connectedPage.includes(credential), false)
  assert.equal(connectedPage.includes('refresh-token-1'), false)
  assert.match((await post({ action: 'sync' })).headers.get('location'), /updated/)
  assert.equal((await publicCatalog(store)).products.length, 1)
})

test('rejects another company and removes the catalog atomically when credentials change', async () => {
  const { service, store, setCompany } = fixture()
  await service.save('id-antigo', credential)
  await service.authorization('admin', 'primeira')
  setCompany({ ...company, taxId: '99999999000191' })
  assert.equal(await service.connect('admin', 'primeira', 'code'), 'wrong_company')
  assert.equal(await service.synchronize(), 'disconnected')
  setCompany(company)
  await service.authorization('admin', 'segunda')
  assert.equal(await service.connect('admin', 'segunda', 'code'), 'connected')
  assert.equal(await service.synchronize(), 'updated')
  await service.authorization('admin', 'pendente')
  await service.save('id-novo', 'outro-segredo')
  assert.equal(await publicCatalog(store), null)
  assert.equal(await service.connect('admin', 'pendente', 'code'), 'invalid')
})

test('publishes stock changes, preserves a complete snapshot after errors, and expires stale stock', async () => {
  const { service, store, setExpiry, setQuantity, failInventory, exchangeCount } = fixture()
  setExpiry(Date.now() + 60_000)
  await service.save('id', credential)
  await service.authorization('admin', 'one')
  await service.connect('admin', 'one', 'code')
  setExpiry(Date.now() + 60 * 60_000)
  assert.equal(await service.synchronize(), 'updated')
  assert.equal(exchangeCount(), 2)
  const last = await publicCatalog(store)
  assert.equal(last.products.length, 1)
  assert.deepEqual(Object.keys(last).sort(), ['products', 'updatedAt'])

  failInventory(true)
  assert.equal(await service.synchronize(), 'sync_failed')
  assert.deepEqual(await publicCatalog(store), last)
  assert.equal(await publicCatalog(store, Date.parse(last.updatedAt) + snapshotLifetime), null)

  failInventory(false)
  setQuantity(0)
  assert.equal(await service.synchronize(), 'updated')
  assert.deepEqual((await publicCatalog(store)).products, [])
  setQuantity(3)
  assert.equal(await service.synchronize(), 'updated')
  assert.equal((await publicCatalog(store)).products[0].id, last.products[0].id)
})

test('extracts only company fields used by the admin integration', async () => {
  const actual = await connectedCompany('fake', async (url, request) => {
    assert.match(url, /\/v1\/pessoas\/conta-conectada$/)
    assert.equal(request.redirect, 'error')
    return Response.json({ id_empresa: '123', documento: '00.000.000/0001-91', nome_fantasia: ' Usina ', email: 'ignored@example.org' })
  })
  assert.deepEqual(actual, { id: '123', name: 'Usina', taxId: config.expectedTaxId })
})

test('Redis writes are fenced and a second owner cannot start a concurrent sync', async () => {
  const calls = []
  let owner
  const store = redisCatalog({ url: 'https://cache.example', token: 'not-a-token', namespace: 'test' }, async (_, request) => {
    const args = JSON.parse(request.body)
    calls.push(args)
    if (args[0] === 'SET' && args[3] === 'NX') {
      if (owner) return Response.json({ result: null })
      owner = args[2]
      return Response.json({ result: 'OK' })
    }
    if (args[0] === 'EVAL') {
      assert.equal(args[4 + args[2] - 1], owner)
      return Response.json({ result: 1 })
    }
    assert.fail('Unexpected Redis command')
  })
  await store.exclusive(async commit => {
    assert.equal(await store.exclusive(() => assert.fail('Another writer entered')), null)
    await commit({ sync: { state: 'updated' }, snapshot: null })
  })
  const atomicWrite = calls[2]
  assert.equal(atomicWrite[0], 'EVAL')
  assert.equal(atomicWrite[2], 3)
  assert.deepEqual(atomicWrite.slice(3, 6), ['usina:catalogo:test:lease', 'usina:catalogo:test:sync', 'usina:catalogo:test:snapshot'])
  assert.equal(atomicWrite[7], '{"state":"updated"}')
  assert.equal(atomicWrite[8], '')
})

test('Vercel handlers keep the public feed private and gate scheduled synchronization', async () => {
  const [{ default: publicApi }, { default: adminApi }, { default: syncApi }] = await Promise.all([
    import('../api/catalogo.mjs'), import('../api/catalogo-admin.mjs'), import('../api/catalogo-sync.mjs'),
  ])
  const variables = {
    CATALOG_ORIGIN: origin, CATALOG_ADMIN_KEY: config.adminKey,
    CATALOG_ENCRYPTION_KEY: config.encryptionKey, CATALOG_EMPRESA_CNPJ: '',
    CATALOG_CONTAAZUL_BINDINGS: '{}', CATALOG_NAMESPACE: 'handler-test',
    UPSTASH_REDIS_REST_URL: 'https://cache.example', UPSTASH_REDIS_REST_TOKEN: 'fake',
    CRON_SECRET: 's'.repeat(43),
  }
  const prior = Object.fromEntries(Object.keys(variables).map(name => [name, process.env[name]]))
  Object.assign(process.env, variables)
  const oldFetch = globalThis.fetch
  globalThis.fetch = async (url, request) => {
    assert.equal(String(url), 'https://cache.example/')
    const parts = JSON.parse(request.body)
    assert.deepEqual(parts, ['MGET', 'usina:catalogo:handler-test:snapshot'])
    return Response.json({ result: [JSON.stringify({
      updatedAt: new Date().toISOString(), catalog: [], report: { internal: true },
    })] })
  }
  try {
    const publicResult = await publicApi.fetch(new Request(origin + '/api/catalogo'))
    assert.equal(publicResult.status, 200)
    assert.deepEqual(Object.keys(await publicResult.json()).sort(), ['products', 'updatedAt'])
    assert.equal((await syncApi.fetch(new Request(origin + '/api/catalogo-sync'))).status, 401)
    const adminResult = await adminApi.fetch(new Request(config.redirectUri))
    assert.equal(adminResult.status, 200)
    assert.match(await adminResult.text(), /Chave administrativa da vitrine/)
  } finally {
    globalThis.fetch = oldFetch
    for (const [name, original] of Object.entries(prior)) {
      if (original === undefined) delete process.env[name]
      else process.env[name] = original
    }
  }
})
