import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ImageOff, MapPin, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCatalog } from '../catalog/catalogContext'
import { formatCatalogPrice } from '../catalog/formatCatalogPrice'
import { describeCartLine, quantityLimit } from './cart'
import { useShop } from './ShopProvider'
import type { CartLine } from './types'

const reviewPath = '/carrinho?etapa=revisao'
const loginPath = '/conta/entrar?voltar=' + encodeURIComponent(reviewPath)
const addressesPath = '/conta/enderecos?voltar=' + encodeURIComponent(reviewPath)

export function CartContents({ review = false, onClose }: { review?: boolean; onClose?: () => void }) {
  const { products, status } = useCatalog()
  const { lines, ready, user, syncingCart, accountError, retryAccount, setLine, addresses } = useShop()
  const [addressId, setAddressId] = useState('')
  const [pending, setPending] = useState('')
  const [error, setError] = useState('')
  const rows = lines.map(line => describeCartLine(products, line))
  const subtotal = rows.reduce((total, line) => total + (line.cents ?? 0) * line.quantity, 0)
  const eligible = status === 'ready' && !syncingCart && rows.length > 0 && rows.every(line => line.cents !== null)
  const address = addresses.find(item => item.id === addressId) ?? addresses.find(item => item.isDefault) ?? addresses[0]

  async function change(line: CartLine, key: string, quantity: number) {
    setError('')
    setPending(key)
    try {
      await setLine({ productId: line.productId, optionId: line.optionId, quantity })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível atualizar o carrinho.')
    } finally {
      setPending('')
    }
  }

  return (
    <>
    {!ready ? <p role="status">Carregando seu carrinho…</p> : (
      <>
        {syncingCart && (
          <div className="shop-cart-alert" role="status">
            Estamos guardando os itens na sua conta. {accountError && <button type="button" onClick={() => void retryAccount()}>Tentar novamente</button>}
          </div>
        )}
        {error && <p role="alert" className="shop-cart-alert">{error}</p>}
        {!rows.length ? (
          <div className="shop-cart-empty">
            <ShoppingBag size={32} strokeWidth={1.4} aria-hidden="true" />
            <h2>Seu carrinho está vazio</h2>
            {onClose ? (
              <button className="shop-button shop-button-primary" type="button" onClick={onClose}>Continuar navegando</button>
            ) : (
              <Link className="shop-button shop-button-primary" to="/catalogo">Explorar o catálogo <ArrowRight size={18} aria-hidden="true" /></Link>
            )}
          </div>
        ) : (
          <div className="shop-cart-grid">
            <div className="shop-cart-lines">
              <ul className="shop-cart-items" aria-label="Itens do carrinho">
                {rows.map(line => {
                  const name = line.product?.nome ?? (status === 'loading' ? 'Carregando produto…' : 'Produto indisponível')
                  const locked = pending !== '' || syncingCart
                  return (
                    <li className="shop-cart-item" key={line.key}>
                      <div className="shop-cart-image">
                        {line.image ? <img src={line.image} alt="" loading="lazy" /> : <ImageOff size={21} aria-hidden="true" />}
                      </div>
                      <div className="shop-cart-item-info">
                        <h2>{line.product ? <Link to={'/catalogo/produto/' + line.product.id} onClick={onClose}>{name}</Link> : name}</h2>
                        {line.option && <p>{line.option.label}</p>}
                        {status !== 'loading' && line.cents === null && <p className="shop-error">Indisponível para finalizar.</p>}
                      </div>
                      <div className="shop-cart-item-end">
                        <strong>{line.cents === null ? '—' : formatCatalogPrice(line.cents * line.quantity / 100)}</strong>
                        <div className="shop-cart-item-controls">
                          <div className="shop-quantity" role="group" aria-label={'Quantidade de ' + name}>
                            <button type="button" aria-label="Diminuir quantidade" disabled={locked || line.quantity === 1}
                              onClick={() => void change(line, line.key, line.quantity - 1)}><Minus size={16} aria-hidden="true" /></button>
                            <span>{line.quantity}</span>
                            <button type="button" aria-label="Aumentar quantidade" disabled={locked || line.quantity >= quantityLimit || line.cents === null}
                              onClick={() => void change(line, line.key, line.quantity + 1)}><Plus size={16} aria-hidden="true" /></button>
                          </div>
                          <button className="shop-remove" type="button" aria-label={'Remover ' + name} disabled={locked}
                            onClick={() => void change(line, line.key, 0)}><Trash2 size={17} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
              {review && (
                <section className="shop-review-address" aria-labelledby="shop-review-address-title">
                  <h2 id="shop-review-address-title"><MapPin size={21} aria-hidden="true" /> Endereço de entrega</h2>
                  {addresses.length > 0 ? (
                    <div className="shop-review-addresses">
                      {addresses.map(item => (
                        <label key={item.id}>
                          <input type="radio" name="delivery-address" checked={address?.id === item.id} onChange={() => setAddressId(item.id)} />
                          <span><strong>{item.label}</strong>
                            <span>{item.street}, {item.number} · {item.city}, {item.state}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : <p>Cadastre um endereço para a entrega.</p>}
                  <Link to={addressesPath}>{addresses.length ? 'Gerenciar endereços' : 'Cadastrar endereço'}</Link>
                </section>
              )}
            </div>
            <aside className="shop-cart-summary" aria-labelledby="shop-summary-title">
              <h2 id="shop-summary-title">Resumo</h2>
              <dl>
                <div><dt>Subtotal</dt><dd>{eligible ? formatCatalogPrice(subtotal / 100) : '—'}</dd></div>
                {review && <div><dt>Frete</dt><dd>A calcular</dd></div>}
              </dl>
              {review ? (
                <p className="shop-summary-note">Frete e pagamento online ainda indisponíveis.</p>
              ) : eligible ? (
                <Link className="shop-button shop-button-primary" to={user ? reviewPath : loginPath} onClick={onClose}>
                  {user ? 'Revisar pedido' : 'Entrar para finalizar'}
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : <p className="shop-summary-note">{status === 'loading' ? 'Conferindo os produtos…' : 'Confira os itens disponíveis para continuar.'}</p>}
            </aside>
          </div>
        )}
      </>
    )}
    </>
  )
}
