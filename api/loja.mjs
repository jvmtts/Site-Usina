import { handleShop } from '../server/shop/handler.mjs'

export default {
  fetch(request) {
    return handleShop(request)
  },
}

