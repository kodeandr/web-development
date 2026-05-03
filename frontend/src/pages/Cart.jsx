import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();

  const handleQuantityChange = (itemId, newQty) => {
    const product = products.find(p => p.id === itemId);
    const maxStock = product?.stock || 0;
    if (newQty > maxStock) {
      alert(`Нельзя добавить больше ${maxStock} шт. (остаток на складе)`);
      return;
    }
    if (newQty < 1) {
      removeFromCart(itemId);
      return;
    }
    updateQuantity(itemId, newQty);
  };

  if (cartItems.length === 0) return <h2>Корзина пуста <Link to="/">Перейти в каталог</Link></h2>;

  return (
    <div>
      <h1>Корзина</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Товар</th><th>Цена</th><th>Количество</th><th>Сумма</th><th></th></tr>
        </thead>
        <tbody>
          {cartItems.map(item => {
            const maxStock = products.find(p => p.id === item.id)?.stock || 0;
            return (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price} ₽</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={maxStock}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))}
                    style={{ width: '60px' }}
                  />
                </td>
                <td>{item.quantity * item.price} ₽</td>
                <td><button className="btn-danger" onClick={() => removeFromCart(item.id)}>Удалить</button></td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr><td colSpan="3"><strong>Итого:</strong></td><td><strong>{totalPrice} ₽</strong></td><td></td></tr>
        </tfoot>
      </table>
      <div style={{ marginTop: '20px' }}>
        <Link to="/"><button className="btn-secondary">Продолжить покупки</button></Link>
        <Link to="/checkout"><button style={{ marginLeft: '10px' }}>Оформить заказ</button></Link>
      </div>
    </div>
  );
}