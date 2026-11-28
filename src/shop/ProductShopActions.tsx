import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check, Heart, ShoppingBag } from 'lucide-react'
import type { Produto } from '../data/produtos'
import { useShop } from './ShopProvider'

export default function ProductShopActions({ product, optionId, canAdd }: {
  product: Produto
  optionId: string | null
  canAdd: boolean
}) {
  const { user, ready, favorites, toggleFavorite, addLine } = useShop()
  const navigate = useNavigate()
  const location = useLocation()
  const id = String(product.id)
  const favoriteId = [id, ...(product.aliases ?? [])].find(candidate => favorites.includes(candidate))
  const [pending, setPending] = useState<'cart' | 'favorite' | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function add() {
    setNotice('')
    setError('')
    setPending('cart')
    try {
      await addLine(id, optionId)
      setNotice('Adicionado ao carrinho.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível adicionar o produto.')
    } finally {
      setPending(null)
    }
  }

  async function favorite() {
    if (!user) {
      navigate('/conta/entrar?voltar=' + encodeURIComponent(location.pathname))
      return
    }
    setError('')
    setPending('favorite')
    try {
      await toggleFavorite(favoriteId ?? id)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível atualizar os favoritos.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="shop-product-actions">
      <div className="shop-product-buttons">
        {canAdd && (
          <button className="shop-button shop-button-primary" type="button" onClick={() => void add()} disabled={!ready || pending !== null}>
            <ShoppingBag size={19} aria-hidden="true" />
            {pending === 'cart' ? 'Adicionando…' : 'Adicionar ao carrinho'}
          </button>
        )}
        <button className="shop-favorite-button" type="button" onClick={() => void favorite()} disabled={!ready || pending !== null}
          aria-pressed={Boolean(favoriteId)} aria-label={favoriteId ? 'Remover dos favoritos' : 'Salvar nos favoritos'}>
          <Heart size={20} fill={favoriteId ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      </div>
      <div className="shop-product-notice" role="status">
        {notice && <><Check size={16} aria-hidden="true" />{notice}</>}
      </div>
      {error && <p className="shop-error" role="alert">{error}</p>}
    </div>
  )
}
