import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from './Checkout.module.css';

const ORDERS_URL = 'http://localhost:8001/orders';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    payment_method: 'Наличные при получении'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        delivery_address: form.delivery_address,
        payment_method: form.payment_method,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await fetch(ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ошибка оформления заказа');
      }

      const data = await res.json();
      clearCart();
      navigate(`/confirmation/${data.order_number}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="alert alert-warning">
        Ваша корзина пуста. <a href="/" className="alert-link">Перейти в каталог</a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Оформление заказа</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-8">
          <div className={`card shadow-sm ${styles.formCard} mb-4`}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Имя</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Телефон</label>
                <input
                  type="tel"
                  className="form-control"
                  required
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Адрес доставки</label>
                <textarea
                  className="form-control"
                  rows="3"
                  required
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Способ оплаты</label>
                <select
                  className="form-select"
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                >
                  <option>Наличные при получении</option>
                  <option>Картой онлайн</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Отправка...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>Подтвердить заказ
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        <div className="col-md-4">
          <div className={`card shadow-sm ${styles.summaryCard}`}>
            <h5>Ваш заказ</h5>
            <ul className="list-group list-group-flush">
              {cart.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} ₽</span>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <strong>Итого: {total.toFixed(2)} ₽</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}