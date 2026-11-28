import { handleSchedule } from '@vercel/schedules'
import { catalogService } from '../server/catalog/service.mjs'
import { catalogSettings, storage } from '../server/catalog/settings.mjs'
import { produtos } from '../src/data/produtos-base.mjs'

export const POST = handleSchedule(async () => {
  if (!['production', 'preview'].includes(process.env.VERCEL_ENV)) return
  const result = await catalogService(storage(), catalogSettings(), produtos).synchronize()
  if (result === 'disconnected' || result === 'wrong_company' || result === 'sync_failed') {
    throw new Error('Falha na coleta agendada do catálogo da Usina.')
  }
})
