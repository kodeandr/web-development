import { Link, useLocation } from 'react-router-dom';

export default function Confirmation() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'ORD-000000';
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>✅ Заказ успешно оформлен!</h1>
      <h3>Номер заказа: {orderNumber}</h3>
      <p>Благодарим за покупку. Наш менеджер свяжется с вами.</p>
      <Link to="/"><button>Вернуться в каталог</button></Link>
    </div>
  );
}