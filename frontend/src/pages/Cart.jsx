import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
        <h3 className="mt-3">Корзина пуста</h3>
        <Link to="/" className="btn btn-primary mt-3">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Корзина</h2>
      <div className="table-responsive">
        <table className="table align-middle bg-white rounded shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Фото</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Количество</th>
              <th>Сумма</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id}>
                <td>
                  {/* === МИНИАТЮРА === */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <i className="bi bi-image text-muted" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.price} ₽</td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '70px' }}
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  />
                </td>
                <td>{(item.price * item.quantity).toFixed(2)} ₽</td>
                <td>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <h4>Итого: {totalPrice.toFixed(2)} ₽</h4>
        <div>
          <Link to="/" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>Продолжить покупки
          </Link>
          <Link to="/checkout" className="btn btn-success">
            <i className="bi bi-check-lg me-1"></i>Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}