import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div className="card">
      <img src={product.image} alt={product.name} className="card-img" />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="price">{product.price} ₽</p>
        <button onClick={() => addToCart(product)}>В корзину</button>
        <Link to={`/product/${product.id}`} style={{ display: 'block', marginTop: '8px' }}>Подробнее</Link>
      </div>
    </div>
  );
}