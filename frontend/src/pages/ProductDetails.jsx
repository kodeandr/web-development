import { useParams } from 'react-router-dom'
import { useGetProductByIdQuery } from '../app/api/productApi'
import { useDispatch } from 'react-redux'
import { addToCart } from '../features/cart/cartSlice'
import { useState } from 'react'
import './ProductDetails.css'

export default function ProductDetails() {
  const { id } = useParams()
  const { data: product, error, isLoading } = useGetProductByIdQuery(Number(id))
  const dispatch = useDispatch()
  const [qty, setQty] = useState(1)

  // === ИСПРАВЛЕНИЕ: обработка состояний ===
  if (isLoading) return <div className="status-message">Загрузка товара...</div>
  if (error) {
    if (error.status === 404) {
      return <div className="status-message error">Товар не найден</div>
    }
    return <div className="status-message error">Ошибка: {error.message}</div>
  }
  if (!product) {
    return <div className="status-message error">Товар не найден</div>
  }

  const handleAdd = () => {
    if (qty > product.stock_quantity) {
      alert('Недостаточно товара на складе')
      return
    }
    dispatch(addToCart({ product, quantity: qty }))
  }

  const handleImgError = (e) => {
    e.target.src = '/placeholder.png'
  }

  return (
    <div className="product-details">
      <div className="product-details__image">
        <img
          src={product.images?.[0]?.image_url || '/placeholder.png'}
          alt={product.name}
          onError={handleImgError}
        />
      </div>
      <div className="product-details__info">
        <h1>{product.name}</h1>
        <p className="product-details__category">{product.category_name}</p>
        <p className="product-details__description">{product.description}</p>
        <table className="product-details__specs">
          <tbody>
            <tr><td>Мощность:</td><td>{product.power_watt} Вт</td></tr>
            <tr><td>Световой поток:</td><td>{product.lumen} Лм</td></tr>
            <tr><td>Цветовая температура:</td><td>{product.color_temp_k} K</td></tr>
            <tr><td>Срок службы:</td><td>{product.life_hours} ч</td></tr>
            <tr><td>В наличии:</td><td>{product.stock_quantity} шт.</td></tr>
          </tbody>
        </table>
        <div className="product-details__buy">
          <span className="product-details__price">{product.price} ₽</span>
          <div className="qty-control">
            <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            <input
              type="number"
              value={qty}
              min="1"
              max={product.stock_quantity}
              onChange={(e) => setQty(Number(e.target.value))}
            />
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  )
}