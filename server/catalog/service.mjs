import { randomUUID } from 'node:crypto'
import { authorizationUrl, connectedCompany, exchangeToken, inventoryClient } from './conta-azul.mjs'
import { buildSnapshot } from './snapshot.mjs'
import { catalogPhotoCache } from './photos.mjs'
import { protect, reveal, snapshotLifetime } from './settings.mjs'

export function catalogService(store, config, manual, { exchange = exchangeToken, companyFor = connectedCompany,
  inventoryFor = inventoryClient, photoFetcher = fetch, now = Date.now } = {}) {
  const stamp = () => new Date(now()).toISOString()
  const credentials = async () => reveal(config, (await store.read('connection'))[0])

  return {
    async status() {
      const [sealed, snapshot, sync] = await store.read('connection', 'snapshot', 'sync')
      const connection = reveal(config, sealed)
      return {
        clientId: connection?.clientId ?? '',
        company: connection?.company?.name ?? '',
        connected: Boolean(connection?.refreshToken),
        snapshot,
        sync,
      }
    },

    async save(clientId, clientSecret) {
      return store.exclusive(async write => {
        const current = await credentials()
        if (!clientSecret && current?.clientId !== clientId) return 'secret_required'
        if (current?.clientId === clientId && (!clientSecret || current.clientSecret === clientSecret)) return 'saved'
        await write({
          connection: protect(config, { clientId, clientSecret, revision: randomUUID() }),
          snapshot: null,
          photos: null,
          sync: null,
        })
        return 'saved'
      })
    },

    async authorization(session, state) {
      const connection = await credentials()
      if (!connection) return null
      await store.setTemporary('state:' + state, { session, revision: connection.revision }, 600)
      return authorizationUrl({ clientId: connection.clientId, redirectUri: config.redirectUri }, state)
    },

    async connect(session, state, code) {
      return store.exclusive(async write => {
        const pending = await store.take('state:' + state)
        const current = await credentials()
        if (!current || pending?.session !== session || current.revision !== pending.revision) return 'invalid'
        let tokens
        let company
        try {
          tokens = await exchange(current, { grant_type: 'authorization_code', code, redirect_uri: config.redirectUri })
          company = await companyFor(tokens.accessToken)
        } catch {
          return 'authorization_failed'
        }
        if ((config.expectedTaxId && company.taxId !== config.expectedTaxId) ||
            (current.company && company.id !== current.company.id)) return 'wrong_company'
        await write({ connection: protect(config, { ...current, ...tokens, company }) })
        return 'connected'
      })
    },

    async synchronize() {
      return store.exclusive(async write => {
        let current = await credentials()
        if (!current?.refreshToken) return 'disconnected'
        if (config.expectedTaxId && current.company?.taxId !== config.expectedTaxId) return 'wrong_company'
        const attempt = stamp()
        const started = now()
        await write({ sync: { state: 'running', attempt } })
        try {
          if (current.expiresAt <= started + 5 * 60_000) {
            const tokens = await exchange(current, { grant_type: 'refresh_token', refresh_token: current.refreshToken })
            current = { ...current, ...tokens }
            await write({ connection: protect(config, current) })
          }
          const [previous, previousPhotos] = await store.read('snapshot', 'photos')
          const deadline = started + 260_000
          const photos = catalogPhotoCache(store, previousPhotos, deadline, { fetcher: photoFetcher, now })
          const snapshot = await buildSnapshot({
            client: inventoryFor(current.accessToken, { deadline }),
            manual,
            previousBindings: previous?.bindings ?? {},
            configuredBindings: config.bindings,
            imageFor: photos.cache,
            now: new Date(started),
          })
          const erpPhotos = { ...photos.diagnostics(), reportedRecords: snapshot.report.recordsWithPhotoEntries }
          snapshot.report.erpPhotos = erpPhotos
          await write({ snapshot, ...photos.publication(snapshot), sync: { state: 'updated', attempt } })
          if (process.env.VERCEL_ENV === 'preview') {
            console.info('catalogo.fotos.conta-azul', JSON.stringify(erpPhotos))
          }
          return 'updated'
        } catch (error) {
          const message = error instanceof Error && /^(O Conta Azul|A API|A coleta|Inventário|Vínculo)/.test(error.message)
            ? error.message : 'A coleta falhou. Confira a conexão e tente novamente.'
          await write({ sync: { state: 'failed', attempt, message } })
          return 'sync_failed'
        }
      })
    },
  }
}

export async function publicCatalog(store, now) {
  const [snapshot] = await store.read('snapshot')
  const currentTime = now ?? Date.now()
  const collected = Date.parse(snapshot?.updatedAt)
  if (!Array.isArray(snapshot?.catalog) || !Number.isFinite(collected) ||
      collected > currentTime || currentTime - collected >= snapshotLifetime) return null
  return { products: snapshot.catalog, updatedAt: snapshot.updatedAt }
}
