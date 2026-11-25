import test from 'node:test'
import assert from 'node:assert/strict'
import { authorizationUrl, exchangeToken, inventoryClient } from '../server/catalog/conta-azul.mjs'
import { buildSnapshot } from '../server/catalog/snapshot.mjs'

const uuid = n => '00000000-0000-4000-8000-' + String(n).padStart(12,'0')
const item = (n, name, extra = {}) => ({ id: uuid(n), nome: name, codigo: 'SKU-' + n, tipo: 'PRODUTO', status: 'ATIVO', ...extra })
const detail = (row, quantity, price, extra = {}) => ({
  id: row.id, nome: row.nome, ativo: true, estoque: {
    quantidade_disponivel: quantity, quantidade_total: quantity + 2, quantidade_reservada: 2, valor_venda: price,
  }, fiscal: { tipo_produto: 'MERCADORIA_PARA_REVENDA' }, ...extra,
})
const local = (name, id = 1) => ({
  id, nome: name, categoria: 'Acessórios', preco: 'R$ 99,00', disponivel: true,
  imagens: ['https://images.example.com/asset.webp'], linkMercadoLivre: 'https://www.mercadolivre.com.br/asset',
})
const clientFor = (rows, details) => ({ list: async () => rows, detail: async id => details.get(id) })
const noPhoto = async () => null

test('prioritizes available stock, keeps legacy URLs, and imports active retail products', async () => {
  const anchor = item(1, 'Ancora inox')
  const lifejacket = item(2, 'Colete Jet')
  const internal = item(3, 'Material de escritório')
  const input = {
    client: clientFor([anchor, lifejacket, internal], new Map([
      [anchor.id, detail(anchor, 0, 99.9)],
      [lifejacket.id, detail(lifejacket, 3, 179.9, { categoria: { descricao: 'Coletes' }, imagens: [{ id: 'photo' }] })],
      [internal.id, detail(internal, 5, 30, { fiscal: { tipo_produto: 'MATERIAL_DE_USO_E_CONSUMO' } })],
    ])),
    manual: [local('Âncora inox')], imageFor: async () => '/api/catalogo-imagem/photo',
  }
  const snapshot = await buildSnapshot(input)
  assert.equal(snapshot.bindings['1'], anchor.id)
  assert.ok(snapshot.hiddenIds.includes('1'))
  assert.equal(snapshot.catalog.length, 1)
  assert.equal(snapshot.catalog[0].nome, 'Colete Jet')
  assert.equal(snapshot.catalog[0].categoria, 'Coletes')
  assert.deepEqual(snapshot.catalog[0].imagens, ['/api/catalogo-imagem/photo'])
  assert.equal(snapshot.report.published, 1)
  assert.equal(snapshot.report.review.length, 2)

  const relisted = await buildSnapshot({
    ...input, previousBindings: snapshot.bindings,
    client: clientFor([anchor], new Map([[anchor.id, detail(anchor, 4, 109.90)]])),
  })
  assert.equal(relisted.catalog[0].id, 1)
  assert.equal(relisted.catalog[0].preco, 109.9)
  assert.equal(relisted.catalog[0].linkMercadoLivre, input.manual[0].linkMercadoLivre)
  assert.deepEqual(relisted.catalog[0].imagens, input.manual[0].imagens)
})

test('renders only available real variations and chooses the lowest available price', async () => {
  const small = item(11, 'Colete P', { tipo: 'VARIACAO_PRODUTO' })
  const medium = item(12, 'Colete M', { tipo: 'VARIACAO_PRODUTO' })
  const large = item(13, 'Colete G', { tipo: 'VARIACAO_PRODUTO' })
  const variantRows = [small, medium, large]
  const parent = item(10, 'Colete', { produtos_variacao: variantRows })
  const snapshot = await buildSnapshot({
    client: clientFor([parent, ...variantRows], new Map([
      [parent.id, detail(parent, 0, 80, { formato: 'VARIACAO', variacao: {
        produtos: variantRows.map(row => ({ id: row.id, opcoes: [{ descricao: row.nome.slice(-1) }] })),
      } })],
      [small.id, detail(small, 0, 80)],
      [medium.id, detail(medium, 2, 120)],
      [large.id, detail(large, 1, 100)],
    ])),
    manual: [], imageFor: noPhoto,
  })
  assert.equal(snapshot.catalog.length, 1)
  const product = snapshot.catalog[0]
  assert.equal(product.preco, 100)
  assert.deepEqual(product.opcoesEstoque.map(option => option.label), ['M', 'G'])
  assert.equal(snapshot.report.withoutPhoto.length, 1)
})

test('lists in-stock products and variants for consultation without treating missing prices as zero', async () => {
  const simple = item(20, 'Cabo retrátil')
  const soldOut = item(21, 'Boia sem saldo')
  const unknownStock = item(22, 'Cabo sem saldo confirmado')
  const priced = item(23, 'Colete M')
  const unpriced = item(24, 'Colete G')
  const group = item(25, 'Colete')
  const snapshot = await buildSnapshot({
    client: clientFor([simple, soldOut, unknownStock, priced, unpriced, group], new Map([
      [simple.id, detail(simple, 1, undefined)],
      [soldOut.id, detail(soldOut, 0, undefined)],
      [unknownStock.id, detail(unknownStock, undefined, undefined)],
      [priced.id, detail(priced, 1, 125)],
      [unpriced.id, detail(unpriced, 2, 0)],
      [group.id, detail(group, 0, 90, { formato: 'VARIACAO', variacao: {
        produtos: [{ id: priced.id, opcoes: [{ descricao: 'M' }] }, { id: unpriced.id, opcoes: [{ descricao: 'G' }] }],
      } })],
    ])),
    manual: [],
  })

  assert.deepEqual(snapshot.catalog.map(product => [product.nome, product.preco]), [
    ['Cabo retrátil', null], ['Colete', 125],
  ])
  assert.deepEqual(snapshot.catalog[1].opcoesEstoque.map(option => [option.label, option.price]), [
    ['M', 125], ['G', null],
  ])
  assert.deepEqual(snapshot.report.withoutPrice.map(row => row.sku), [simple.codigo, unpriced.codigo])
})

test('completes generic catalog fields for identified models and reports unidentified items for review', async () => {
  const goggles = item(30, 'OCULOS 100% STRATA 2 SOLAR ECLIPSE')
  const unknown = item(31, 'Track Preto')
  const snapshot = await buildSnapshot({
    client: clientFor([goggles, unknown], new Map([
      [goggles.id, detail(goggles, 1, 0, { categoria: { descricao: 'Outras' } })],
      [unknown.id, detail(unknown, 1, 0, { categoria: { descricao: 'Outras' } })],
    ])),
    manual: [],
  })
  assert.equal(snapshot.catalog[0].categoria, 'Óculos')
  assert.equal(snapshot.catalog[0].fichaTecnica.Modelo, 'Strata 2')
  assert.match(snapshot.catalog[0].descricao, /motocross/i)
  assert.equal(snapshot.catalog[1].descricao, undefined)
  assert.deepEqual(snapshot.report.withoutDescription.map(row => row.name), [unknown.nome])
})

test('uncertain and unmatched manual products stay hidden until stock can be verified', async () => {
  const first = item(1, 'Âncora duplicada')
  const second = item(2, 'Ancora duplicada')
  const localCatalog = [local('Âncora duplicada'), local('Sem registro no ERP', 2)]
  const inventory = await buildSnapshot({
    client: clientFor([first, second], new Map([[first.id, detail(first, 3, 20)], [second.id, detail(second, 8, 25)]])),
    manual: localCatalog, imageFor: noPhoto,
  })
  assert.deepEqual(inventory.catalog, [])
  assert.deepEqual(inventory.hiddenIds, ['1', '2'])
  assert.deepEqual(inventory.report.unmatchedLocal, localCatalog.map(({ id, nome }) => ({ id, name: nome })))
  assert.equal(inventory.report.review.length, 2)
  assert.deepEqual(inventory.bindings, {})
})

test('rejects incomplete synchronization instead of accepting a partial paginated result', async () => {
  let calls = 0
  const { list } = inventoryClient('fake', { fetcher: async url => {
    assert.match(url, /api-v2\.contaazul\.com\/v1\/produtos/)
    calls++
    return Response.json({ totalItems: 2, items: calls === 1 ? [item(1, 'Produto')] : [] })
  } })
  await assert.rejects(list, /incompleta/)
  assert.equal(calls, 2)
})

test('an upstream detail failure aborts the snapshot', async () => {
  const row = item(1, 'Âncora inox')
  await assert.rejects(buildSnapshot({
    client: { list: async () => [row], detail: async () => { throw Error('Falha simulada') } },
    manual: [], imageFor: noPhoto,
  }), /Falha simulada/)
})

test('OAuth follows the official endpoint and accepts rotated tokens', async () => {
  const cfg = { clientId: 'example', clientSecret: 'test-secret', redirectUri: 'https://site.example/api/catalogo-admin' }
  const path = authorizationUrl(cfg, 'csrf-test')
  assert.match(path, /^https:\/\/login\.contaazul\.com\/#\/oauth\/authorize\?/)
  const values = new URLSearchParams(path.split('?')[1])
  assert.equal(values.get('state'), 'csrf-test')
  assert.equal(values.get('redirect_uri'), cfg.redirectUri)
  const token = await exchangeToken(cfg, { grant_type: 'refresh_token', refresh_token: 'old-token' }, async (url, options) => {
    assert.equal(options.redirect, 'error')
    assert.equal(options.body.get('refresh_token'), 'old-token')
    assert.equal(new URL(url).pathname, '/oauth/token')
    return Response.json({ access_token: 'new-token', refresh_token: 'rotated-token', expires_in: 3600 })
  })
  assert.equal(token.refreshToken, 'rotated-token')
  assert.ok(token.expiresAt > Date.now())
})

test('checks available stock in details even when summaries have different types or reference themselves', async () => {
  const anchor = item(41, 'Âncora portátil', { tipo: 'SIMPLES' })
  const accessory = item(42, 'Cabo de amarração')
  const another = item(43, 'Suporte para jet ski', { tipo: 'VARIACAO_PRODUTO' })
  anchor.produtos_variacao = [{ id: anchor.id }, { id: accessory.id, id_produto_pai_variacao: another.id }]
  another.produtos_variacao = [{ id: another.id }]
  const rows = [anchor, accessory, another]
  const details = new Map(rows.map(row => [row.id, detail(row, 4, 149, { formato: 'SIMPLES' })]))
  const snapshot = await buildSnapshot({ client: clientFor(rows, details), manual: [] })
  assert.equal(snapshot.report.examined, 3)
  assert.equal(snapshot.report.published, 3)
  assert.deepEqual(snapshot.catalog.map(product => product.nome), ['Âncora portátil', 'Cabo de amarração', 'Suporte para jet ski'])
})
