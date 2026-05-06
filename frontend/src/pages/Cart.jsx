import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateQuantity, removeFromCart } from '../features/cart/cartSlice'
import './Cart.css'

export default function Cart() {
  const items = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина пуста</h2>
        <Link to="/">Вернуться к покупкам</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h2>Корзина</h2>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <div className="cart-item__info">
              <h3>{item.name}</h3>
              <p>{item.price} ₽ × {item.quantity} = {(item.price * item.quantity).toFixed(2)} ₽</p>
            </div>
            <div className="cart-item__controls">
              <input
                type="number"
                min="1"
                max={item.stock_quantity}
                value={item.quantity}
                onChange={(e) => {
                  const newQty = Number(e.target.value)
                  if (!isNaN(newQty) && newQty >= 0) {
                    if (newQty > item.stock_quantity) {
                      alert(`Доступно только ${item.stock_quantity} шт.`)
                      dispatch(updateQuantity({ id: item.id, quantity: item.stock_quantity }))
                    } else {
                      dispatch(updateQuantity({ id: item.id, quantity: newQty }))
                    }
                  }
                }}
                className="qty-input"
              />
              <button
                className="btn-remove"
                onClick={() => dispatch(removeFromCart(item.id))}
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <strong>Итого: {totalPrice.toFixed(2)} ₽</strong>
      </div>
      <Link to="/checkout" className="checkout-link">Оформить заказ</Link>
    </div>
  )
}