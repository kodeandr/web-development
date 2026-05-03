import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', payment: 'card'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Введите ФИО';
    if (!form.phone.trim()) newErrors.phone = 'Введите телефон';
    else if (!/^[\+\d\s\-\(\)]{10,}$/.test(form.phone)) newErrors.phone = 'Неверный формат телефона';
    if (!form.email.trim()) newErrors.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Неверный формат email';
    if (!form.address.trim()) newErrors.address = 'Введите адрес';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Уникальный номер заказа: ORD-YYYYMMDDHHMMSS-xxxx (xxxx – случайные 4 цифры)
    const now = new Date();
    const datePart = now.toISOString().slice(0,19).replace(/[-:T]/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${datePart}-${random}`;
    localStorage.setItem('lastOrder', JSON.stringify({ orderNumber, items: cartItems, total: totalPrice, ...form }));
    clearCart();
    navigate('/confirmation', { state: { orderNumber } });
  };

  if (cartItems.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      <form onSubmit={handleSubmit} style={{ flex: 2 }}>
        <h2>Оформление заказа</h2>
        <input type="text" name="name" placeholder="ФИО" value={form.name} onChange={handleChange} style={{ width: '100%', marginBottom: '8px' }} />
        {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}<br />
        <input type="tel" name="phone" placeholder="Телефон (+7 999 123-45-67)" value={form.phone} onChange={handleChange} style={{ width: '100%', marginBottom: '8px' }} />
        {errors.phone && <span style={{ color: 'red', fontSize: '12px' }}>{errors.phone}</span>}<br />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%', marginBottom: '8px' }} />
        {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}<br />
        <input type="text" name="address" placeholder="Адрес доставки" value={form.address} onChange={handleChange} style={{ width: '100%', marginBottom: '8px' }} />
        {errors.address && <span style={{ color: 'red', fontSize: '12px' }}>{errors.address}</span>}<br />
        <label><input type="radio" name="payment" value="card" checked={form.payment === 'card'} onChange={handleChange} /> Карта онлайн</label>
        <label><input type="radio" name="payment" value="cash" checked={form.payment === 'cash'} onChange={handleChange} style={{ marginLeft: '15px' }}/> Наличные при получении</label><br />
        <button type="submit">Подтвердить заказ</button>
      </form>
      <div style={{ flex: 1, background: '#f1f1f1', padding: '15px', borderRadius: '8px' }}>
        <h3>Ваш заказ</h3>
        {cartItems.map(i => <p key={i.id}>{i.name} x{i.quantity} = {i.price * i.quantity} ₽</p>)}
        <hr />
        <strong>Итого: {totalPrice} ₽</strong>
      </div>
    </div>
  );
}