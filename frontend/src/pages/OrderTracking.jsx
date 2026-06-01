import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './OrderTracking.module.css';

const API_URL = 'http://localhost:8001';

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${API_URL}/track/${encodeURIComponent(orderNumber)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Заказ с таким номером не найден');
        }
        throw new Error('Ошибка при получении данных');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className="mb-4">Отслеживание заказа</h2>
      <form onSubmit={handleTrack} className={`card shadow-sm ${styles.formCard}`}>
        <div className="mb-3">
          <label className="form-label">Номер заказа</label>
          <input
            type="text"
            className="form-control"
            placeholder="Например, ORD-0601071901"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Поиск...
            </>
          ) : (
            <>
              <i className="bi bi-search me-1"></i>Проверить статус
            </>
          )}
        </button>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {order && (
        <div className={`card shadow-sm mt-4 ${styles.resultCard}`}>
          <div className="card-body">
            <h5>Заказ № {order.order_number}</h5>
            <p>
              <strong>Статус:</strong>{' '}
              <span className={`badge bg-${statusColor(order.status)}`}>{order.status}</span>
            </p>
            <p><strong>Дата создания:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Итого:</strong> {order.total_amount.toFixed(2)} ₽</p>
            <h6>Товары:</h6>
            <ul className="list-group list-group-flush">
              {order.items.map((item, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-start">
                  <div className="me-3" style={{ wordBreak: 'break-word' }}>
                    {item.name} × {item.quantity}
                  </div>
                  <span className="text-nowrap fw-semibold">
                    {(item.price * item.quantity).toFixed(2)} ₽
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Link to="/" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i>Вернуться в каталог
        </Link>
      </div>
    </div>
  );
}

function statusColor(status) {
  const map = {
    'новый': 'primary',
    'в обработке': 'warning',
    'отправлен': 'info',
    'доставлен': 'success',
    'отменён': 'danger'
  };
  return map[status] || 'secondary';
}