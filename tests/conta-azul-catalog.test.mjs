import test from 'node:test'
import assert from 'node:assert/strict'
import { authorizationUrl, exchangeToken, inventoryClient } from '../server/catalog/conta-azul.mjs'
import { productContent } from '../server/catalog/product-content.mjs'
import { buildSnapshot } from '../server/catalog/snapshot.mjs'
import { produtos } from '../src/data/produtos-base.mjs'

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

test('reuses the store photos for the confirmed hull, side, color and single option', () => {
  const legacy = new Map(produtos.map(product => [product.id, product]))
  const normalize = value => value.trim().toLowerCase()
  const photos = (id, options = []) => productContent(id, '', legacy, normalize, options).images
  const rightGti = 'ca-93dd9253a5ecfd62370619ee'
  const leftGti = 'ca-f83c2bac5f836a97aa99dc31'
  const leftSt3 = 'ca-b0805e4068fdc9d7c0d69aec'
  const sandBlue = 'ca-1ef2211200e4bc048954f85c'
  const hakan = 'ca-ec41a19b99811a9a5cc58b71'
  const blueLenses = { label: 'Preto e Branco com Lentes azul' }

  assert.deepEqual(photos(rightGti), legacy.get(24).imagensPorCor.Direito)
  assert.deepEqual(photos(leftGti), legacy.get(24).imagensPorCor.Esquerdo)
  assert.deepEqual(photos(leftSt3), legacy.get(25).imagensPorCor.Esquerdo)
  assert.deepEqual(photos(sandBlue, [{ label: 'G1 / Sand Blue' }]), legacy.get(35).imagensPorCor['Sand Blue'])
  assert.equal(photos(sandBlue, [{ label: 'G1 / Skyline' }]), undefined)
  assert.deepEqual(photos(hakan, [blueLenses]), legacy.get(30).imagens)
  assert.equal(photos(hakan, [blueLenses, { label: 'Preto' }]), undefined)
})

test('shows Hydro Citrus once and keeps only available color and size combinations', async () => {
  const parent = item(80, 'Colete Hydro Citrus Prolife')
  const iceG1 = item(81, 'Hydro Citrus Ice G1')
  const duplicate = item(82, 'Colete Salva Vidas Homologado Hydro Citrus G1-Ice')
  const iceEg2 = item(83, 'Colete Salva Vidas Homologado Hydro Citrus EG2-Ice')
  const skylineM = item(84, 'Colete Salva Vidas Homologado Hydro Citrus M-Skyline')
  const skylineP = item(85, 'Colete Salva Vidas Homologado Hydro Citrus P-Skyline')
  const depleted = item(86, 'Colete Salva Vidas Homologado Hydro Citrus EG1-Sand Blue')
  const unrelated = item(87, 'Colete Hydro Black Edition')
  const rows = [parent, iceG1, duplicate, iceEg2, skylineM, skylineP, depleted, unrelated]
  const details = new Map([
    [parent.id, detail(parent, 0, 0, { formato: 'VARIACAO', variacao: {
      produtos: [{ id: iceG1.id, opcoes: [{ descricao: 'G1' }, { descricao: 'ICE' }] }],
    } })],
    [iceG1.id, detail(iceG1, 2, 510)],
    [duplicate.id, detail(duplicate, 3, 520)],
    [iceEg2.id, detail(iceEg2, 1, 555)],
    [skylineM.id, detail(skylineM, 1, 600, { imagens: [{ id: 'skyline' }] })],
    [skylineP.id, detail(skylineP, 0, 0)],
    [depleted.id, detail(depleted, 0, 0)],
    [unrelated.id, detail(unrelated, 2, 150)],
  ])
  const snapshot = await buildSnapshot({
    client: clientFor(rows, details), manual: [],
    imageFor: async photo => '/api/catalogo-imagem/' + photo.id,
  })
  assert.equal(snapshot.catalog.length, 2)
  const colete = snapshot.catalog.find(product => product.nome === 'Colete Hydro Citrus Prolife')
  assert.deepEqual(colete.opcoesEstoque.map(({ color, size, price }) => [color, size, price]), [
    ['Ice', 'G1', 510], ['Ice', 'EG2', 555], ['Skyline', 'M', 600],
  ])
  assert.deepEqual(colete.imagensPorCor.Skyline, ['/api/catalogo-imagem/skyline'])
  assert.equal(colete.preco, 510)
  assert.equal(colete.aliases.length, 4)
})

test('recognizes ERP color and size attributes on native product variations', async () => {
  const parent = item(90, 'Camisa')
  const child = item(91, 'Camisa azul G')
  const snapshot = await buildSnapshot({ manual: [], client: clientFor([parent, child], new Map([
    [parent.id, detail(parent, 0, 0, { formato: 'VARIACAO', variacao: {
      tipos: [
        { descricao: 'Tamanho', opcoes: [{ id: 'size', descricao: 'G' }] },
        { descricao: 'Cor', opcoes: [{ id: 'color', descricao: 'Azul' }] },
      ],
      produtos: [{ id: child.id, opcoes: [{ id: 'color', descricao: 'Azul' }, { id: 'size', descricao: 'G' }] }],
    } })],
    [child.id, detail(child, 1, 92, { imagens: [{ id: 'azul' }] })],
  ])), imageFor: async photo => '/api/catalogo-imagem/' + photo.id })
  const product = snapshot.catalog[0]
  assert.equal(product.opcoesEstoque[0].color, 'Azul')
  assert.equal(product.opcoesEstoque[0].size, 'G')
  assert.deepEqual(product.imagensPorCor.Azul, ['/api/catalogo-imagem/azul'])
})

test('collects a photo on an available option even when the ERP only has one variation dimension', async () => {
  const parent = item(92, 'Camiseta')
  const child = item(93, 'Camiseta preta')
  const snapshot = await buildSnapshot({ manual: [], client: clientFor([parent, child], new Map([
    [parent.id, detail(parent, 0, 0, { formato: 'VARIACAO', variacao: {
      produtos: [{ id: child.id, opcoes: [{ descricao: 'Preta' }] }],
    } })],
    [child.id, detail(child, 1, 90, { imagens: [{ id: 'preta' }] })],
  ])), imageFor: async photo => '/api/catalogo-imagem/' + photo.id })
  assert.deepEqual(snapshot.catalog[0].imagens, ['/api/catalogo-imagem/preta'])
  assert.deepEqual(snapshot.catalog[0].opcoesEstoque[0].images, ['/api/catalogo-imagem/preta'])
})

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
  const shirt = item(32, 'Camisa Lycra PRO LIFE 703L')
  const snapshot = await buildSnapshot({
    client: clientFor([goggles, unknown, shirt], new Map([
      [goggles.id, detail(goggles, 1, 0, { categoria: { descricao: 'Outras' } })],
      [unknown.id, detail(unknown, 1, 0, { categoria: { descricao: 'Outras' } })],
      [shirt.id, detail(shirt, 1, 30)],
    ])),
    manual: [],
  })
  const byName = new Map(snapshot.catalog.map(product => [product.nome, product]))
  assert.equal(byName.get(goggles.nome).categoria, 'Óculos')
  assert.equal(byName.get(goggles.nome).fichaTecnica.Modelo, 'Strata 2')
  assert.match(byName.get(goggles.nome).descricao, /motocross/i)
  assert.equal(byName.get(shirt.nome).fichaTecnica?.Modelo, '703L')
  assert.match(byName.get(shirt.nome).descricao, /manga longa/i)
  assert.equal(byName.get(unknown.nome).descricao, undefined)
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
