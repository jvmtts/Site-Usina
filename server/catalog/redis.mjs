import { randomUUID } from 'node:crypto'

const commit = `
  if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
  for i = 2, #KEYS do
    if ARGV[i] == '' then redis.call('DEL', KEYS[i])
    else redis.call('SET', KEYS[i], ARGV[i]) end
  end
  return 1
`
const release = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0"
const take = "local value = redis.call('GET', KEYS[1]); if value then redis.call('DEL', KEYS[1]) end return value"

export function redisCatalog({ url, token, namespace }, fetcher = fetch) {
  const endpoint = new URL(url)
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.origin !== url ||
      !token || !/^[a-zA-Z0-9_-]{1,64}$/.test(namespace)) throw new Error('Armazenamento inválido.')

  const key = name => 'usina:catalogo:' + namespace + ':' + name
  const lock = key('lease')
  async function command(parts) {
    const response = await fetcher(endpoint, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(parts),
    })
    if (!response.ok) throw new Error('Armazenamento indisponível.')
    const result = await response.json()
    if (!result || result.error || !Object.hasOwn(result, 'result')) throw new Error('Operação de armazenamento rejeitada.')
    return result.result
  }

  return {
    async read(...names) {
      const values = await command(['MGET', ...names.map(key)])
      if (!Array.isArray(values) || values.length !== names.length) throw new Error('Resposta de armazenamento inválida.')
      return values.map(value => value === null ? null : JSON.parse(value))
    },
    async setTemporary(name, value, seconds) {
      await command(['SET', key(name), JSON.stringify(value), 'EX', seconds])
    },
    async take(name) {
      const value = await command(['EVAL', take, 1, key(name)])
      return value === null ? null : JSON.parse(value)
    },
    async exclusive(task) {
      const owner = randomUUID()
      if (await command(['SET', lock, owner, 'NX', 'EX', 330]) !== 'OK') return null
      try {
        return await task(async values => {
          const entries = Object.entries(values)
          const keys = entries.map(([name]) => key(name))
          const args = entries.map(([, value]) => value === null ? '' : JSON.stringify(value))
          if (await command(['EVAL', commit, keys.length + 1, lock, ...keys, owner, ...args]) !== 1) {
            throw new Error('A operação perdeu o bloqueio de atualização.')
          }
        })
      } finally {
        try { await command(['EVAL', release, 1, lock, owner]) } catch { /* O bloqueio expira automaticamente. */ }
      }
    },
  }
}
