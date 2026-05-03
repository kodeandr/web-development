import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  if (!product) return <h2>Товар не найден</h2>;

  // FIX: максимальное количество ограничено остатком stock
  const maxStock = product.stock || 0;
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.min(maxStock, Math.max(1, prev + delta)));
  };
  const handleInputChange = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 1;
    val = Math.min(maxStock, Math.max(1, val));
    setQuantity(val);
  };

  const related = products.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 3);

  return (
    <div>
      <Link to="/">← Вернуться в каталог</Link>
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px', flexWrap: 'wrap' }}>
        <img src={product.image} alt={product.name} style={{ width: '300px', height: '300px', objectFit: 'cover' }} />
        <div>
          <h1>{product.name}</h1>
          <p>Артикул: {product.sku}</p>
          <p>Мощность: {product.power_watt} Вт</p>
          <p>Световой поток: {product.lumen} лм</p>
          <p>Цветовая температура: {product.color_temp_k} K</p>
          <p>Срок службы: {product.life_hours} ч</p>
          <p className="price">{product.price} ₽</p>
          <p>В наличии: {maxStock} шт.</p>
          <div>
            <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
            <span style={{ margin: '0 10px' }}>{quantity}</span>
            <button onClick={() => handleQuantityChange(1)} disabled={quantity >= maxStock}>+</button>
            <input type="number" min="1" max={maxStock} value={quantity} onChange={handleInputChange} style={{ width: '60px', marginLeft: '10px' }} />
          </div>
          <button onClick={() => addToCart(product, quantity)} style={{ marginTop: '15px' }}>Добавить в корзину</button>
        </div>
      </div>
      <h2>Похожие товары</h2>
      <div className="grid" style={{ marginTop: '20px' }}>
        {related.map(p => (
          <Link to={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <img src={p.image} alt={p.name} className="card-img" />
              <div className="card-body">
                <h3>{p.name}</h3>
                <p className="price">{p.price} ₽</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}