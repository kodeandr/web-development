import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCreateOrderMutation } from '../app/api/orderApi'
import { clearCart } from '../features/cart/cartSlice'
import './Checkout.css'

export default function Checkout() {
  const cart = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [createOrder, { isLoading, error: orderError }] = useCreateOrderMutation()
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    payment_method: 'card',
  })

  if (cart.length === 0) {
    return <p>Корзина пуста. <a href="/">Вернуться</a></p>
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const items = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))
    const orderData = { ...form, items }

    try {
      const result = await createOrder(orderData).unwrap()
      dispatch(clearCart())
      navigate(`/confirmation/${result.order_number}`)
    } catch (err) {
      // Ошибка будет сохранена в orderError, отобразим ниже
      console.error('Ошибка создания заказа:', err)
    }
  }

  return (
    <div className="checkout-page">
      <h2>Оформление заказа</h2>
      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          type="text"
          placeholder="Ф.И.О."
          required
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Телефон"
          required
          value={form.customer_phone}
          onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.customer_email}
          onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
        />
        <textarea
          placeholder="Адрес доставки"
          required
          value={form.delivery_address}
          onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
        />
        <select
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
        >
          <option value="card">Карта</option>
          <option value="cash">Наличные</option>
        </select>
        <p className="total-info">
          Итого: {cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} ₽
        </p>

        {/* === ИСПРАВЛЕНИЕ: отображение ошибки прямо в форме === */}
        {orderError && (
          <div className="error-message">
            {orderError.data?.detail || 'Не удалось создать заказ'}
          </div>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Оформление...' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  )
}