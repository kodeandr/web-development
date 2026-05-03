import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const { totalItems } = useCart();
  return (
    <header style={{ background: '#343a40', color: 'white', padding: '15px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Лампочки</Link>
        <nav>
          <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Каталог</Link>
          <Link to="/cart" style={{ color: 'white', position: 'relative' }}>
            Корзина {totalItems > 0 && <span style={{ background: '#dc3545', borderRadius: '50%', padding: '2px 6px', marginLeft: '5px', fontSize: '12px' }}>{totalItems}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}