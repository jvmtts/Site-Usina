export type Customer = { id: string; email: string }

export type CartLine = {
  productId: string
  optionId: string | null
  quantity: number
}

export type AddressDraft = {
  id?: string
  label: string
  recipient: string
  postalCode: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
  isDefault: boolean
}

export type Address = AddressDraft & { id: string }

export type Order = {
  id: string
  reference: string
  status: 'pending' | 'paid' | 'preparing' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  total: number
  trackingCode?: string | null
}

export type ShopAccount = {
  enabled: boolean
  googleEnabled?: boolean
  user: Customer | null
  cart: CartLine[]
  favorites: string[]
  addresses: Address[]
  orders: Order[]
}
