import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-lightbulb-fill me-2 text-warning"></i>
          <span>Интернет-магазин лампочек</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                <i className="bi bi-grid-fill me-1"></i>Каталог
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/tracking' ? 'active' : ''}`}
                to="/tracking"
              >
                <i className="bi bi-search me-1"></i>Отследить заказ
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                to="/cart"
              >
                <i className="bi bi-cart3 me-1"></i>Корзина
                {totalItems > 0 && (
                  <span className="badge bg-warning text-dark ms-1">{totalItems}</span>
                )}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}