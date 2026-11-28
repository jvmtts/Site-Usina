import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { inventoryClient } from '../server/catalog/conta-azul.mjs'
import { buildSnapshot } from '../server/catalog/snapshot.mjs'
import { produtos } from '../src/data/produtos.ts'

const directory = new URL('../.catalogo-local/', import.meta.url)
const current = new URL('estoque.json', directory)

async function readToken() {
  if (!process.stdin.isTTY) throw new Error('Abra um terminal interativo para inserir o token.')
  const silentOutput = new Writable({ write(_chunk, _encoding, done) { done() } })
  const terminal = createInterface({ input: process.stdin, output: silentOutput, terminal: true })
  const cancel = new AbortController()
  terminal.once('SIGINT', () => cancel.abort())
  process.stdout.write('Cole o access_token do Conta Azul e pressione Enter (entrada oculta): ')
  try {
    const token = (await terminal.question('', { signal: cancel.signal })).trim()
    if (!/^[A-Za-z0-9._~+/-]{30,8192}={0,2}$/.test(token)) {
      throw new Error('Token inválido. Use somente o valor do access_token.')
    }
    return token
  } finally {
    terminal.close()
    process.stdout.write('\n')
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

async function saveSnapshot(snapshot) {
  await mkdir(directory, { recursive: true })
  const temporary = new URL(randomUUID() + '.tmp', directory)
  try {
    await writeFile(temporary, JSON.stringify(snapshot, null, 2), { flag: 'wx', mode: 0o600 })
    await rename(temporary, current)
  } finally {
    await rm(temporary, { force: true })
  }
}

try {
  const [previous, configuredBindings] = await Promise.all([
    readJson(current),
    readJson(new URL('vinculos.json', directory)),
  ])
  const token = await readToken()
  console.log('Consultando os produtos e o saldo disponível no Conta Azul…')
  const snapshot = await buildSnapshot({
    client: inventoryClient(token),
    manual: produtos,
    previousBindings: previous?.bindings ?? {},
    configuredBindings: configuredBindings ?? {},
  })
  await saveSnapshot(snapshot)
  console.log(snapshot.report.received + ' cadastros ativos consultados.')
  console.log(snapshot.report.published + ' produtos disponíveis para a prévia.')
  console.log(snapshot.report.linked + ' vínculos com produtos do site.')
  console.log('Relatório local em .catalogo-local/estoque.json. Rode npm run dev para abrir o site.')
} catch (error) {
  const message = error instanceof Error && /^(Abra um terminal|Token inválido|O Conta Azul|A API|A coleta|Inventário|Vínculo)/.test(error.message)
    ? error.message
    : 'A coleta foi interrompida ou a prévia não pôde ser gravada.'
  console.error(message)
  process.exitCode = 1
}
