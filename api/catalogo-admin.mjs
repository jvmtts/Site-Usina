import { catalogAdmin } from '../server/catalog/admin.mjs'
import { adminPage } from '../server/catalog/admin-page.mjs'
import { catalogService } from '../server/catalog/service.mjs'
import { catalogSettings, storage } from '../server/catalog/settings.mjs'
import { produtos } from '../src/data/produtos-base.mjs'

export default {
  async fetch(request) {
    try {
      const config = catalogSettings()
      return await catalogAdmin(catalogService(storage(), config, produtos), config)(request)
    } catch {
      return adminPage({ unavailable: true })
    }
  },
}
