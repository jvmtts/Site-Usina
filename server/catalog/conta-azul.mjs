import { setTimeout as delay } from 'node:timers/promises'

const api = 'https://api-v2.contaazul.com'
const pageSize = 100
const maxPages = 100
export const identifier = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i

export function authorizationUrl({ clientId, redirectUri }, state) {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile aws.cognito.signin.user.admin',
    state,
  })
  return 'https://login.contaazul.com/#/oauth/authorize?' + query
}

export async function exchangeToken(config, params, fetcher = fetch) {
  const response = await fetcher(api + '/oauth/token', {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: {
      Authorization: 'Basic ' + Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  })
  if (!response.ok) throw new Error('O Conta Azul recusou a autorização (HTTP ' + response.status + ').')
  const body = await response.json()
  if (typeof body.access_token !== 'string' || !body.access_token ||
      typeof body.refresh_token !== 'string' || !body.refresh_token ||
      !(Number(body.expires_in) > 0 && Number(body.expires_in) <= 86400)) {
    throw new Error('O Conta Azul devolveu um token inválido.')
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + Number(body.expires_in) * 1000,
  }
}

export async function connectedCompany(token, fetcher = fetch) {
  const response = await fetcher(api + '/v1/pessoas/conta-conectada', {
    redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
  })
  if (!response.ok) throw new Error('O Conta Azul não confirmou a empresa autorizada.')
  const body = await response.json()
  const id = body?.id_empresa
  const taxId = typeof body?.documento === 'string' ? body.documento.replace(/\D/g, '') : ''
  const name = [body?.nome_fantasia, body?.razao_social].find(value => typeof value === 'string' && value.trim())
  if (typeof id !== 'string' || !id.trim() || id.length > 128 || !name) {
    throw new Error('O Conta Azul devolveu um cadastro de empresa inválido.')
  }
  return { id, taxId, name: name.trim().slice(0, 180) }
}

export function inventoryClient(token, { fetcher = fetch, deadline = Date.now() + 720_000 } = {}) {
  let nextRequest = 0

  async function get(path) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const slot = Math.max(Date.now(), nextRequest)
      if (slot + 1000 >= deadline) throw new Error('A coleta atingiu o limite de tempo.')
      nextRequest = slot + 180
      const wait = slot - Date.now()
      if (wait > 0) await delay(wait)
      let response
      try {
        response = await fetcher(api + path, {
          redirect: 'error',
          signal: AbortSignal.timeout(Math.max(1, Math.min(12000, deadline - Date.now()))),
          headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        })
      } catch {
        if (attempt === 2) throw new Error('A API do Conta Azul não respondeu durante a coleta.')
      }
      if (response?.ok) return response.json()
      if (response && response.status !== 429 && response.status < 500) {
        throw new Error('O Conta Azul recusou a consulta de inventário (HTTP ' + response.status + ').')
      }
      if (attempt < 2) {
        const retryAfter = Number(response?.headers.get('retry-after') ?? 0)
        await delay(Math.min(8000, Math.max(750 * (attempt + 1), retryAfter * 1000 || 0)))
      }
    }
    throw new Error('O Conta Azul não concluiu a consulta após novas tentativas.')
  }

  async function list() {
    const rows = new Map()
    let expected
    for (let page = 1; page <= maxPages; page++) {
      const query = new URLSearchParams({
        pagina: String(page), tamanho_pagina: String(pageSize),
        status: 'ATIVO', campo_ordenacao: 'CODIGO', direcao_ordenacao: 'ASC',
      })
      const result = await get('/v1/produtos?' + query)
      if (!Number.isSafeInteger(result?.totalItems) || result.totalItems < 0 ||
          !Array.isArray(result.items) || (expected !== undefined && expected !== result.totalItems)) {
        throw new Error('A API retornou uma paginação de produtos inconsistente.')
      }
      expected = result.totalItems
      for (const item of result.items) {
        if (!identifier.test(item?.id ?? '') || rows.has(item.id)) {
          throw new Error('Inventário com registros inválidos ou repetidos.')
        }
        rows.set(item.id, item)
      }
      if (rows.size === expected) return [...rows.values()]
      if (!result.items.length || rows.size > expected) break
    }
    throw new Error('A coleta de produtos ficou incompleta.')
  }

  async function detail(id) {
    if (!identifier.test(id)) throw new Error('Identificador de produto inválido.')
    const product = await get('/v1/produtos/' + id)
    if (!product || typeof product !== 'object' || product.id !== id) {
      throw new Error('A API retornou um detalhe de produto inválido.')
    }
    return product
  }

  return { list, detail }
}
