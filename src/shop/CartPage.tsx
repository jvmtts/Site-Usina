import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CartContents } from './CartContents'
import { useShop } from './ShopProvider'

export default function CartPage() {
  const { user } = useShop()
  const [params] = useSearchParams()
  const review = Boolean(user && params.get('etapa') === 'revisao')

  return (
    <section className="shop-cart-page" aria-labelledby="shop-cart-title">
      <div className="wrap">
        <Link className="shop-return" to={review ? '/carrinho' : '/catalogo'}>
          <ArrowLeft size={16} aria-hidden="true" /> {review ? 'Voltar ao carrinho' : 'Voltar ao catálogo'}
        </Link>
        <h1 id="shop-cart-title" className="shop-cart-title">{review ? 'Revise seu pedido' : 'Carrinho'}</h1>
        <CartContents review={review} />
      </div>
    </section>
  )
}
