import { useParams, Link } from 'react-router-dom';
import styles from './Confirmation.module.css';

export default function Confirmation() {
  const { orderNumber } = useParams();

  if (!orderNumber) {
    return (
      <div className="alert alert-danger">
        Не удалось получить номер заказа. Пожалуйста, проверьте историю заказов.
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center mt-5">
      <div className={`card shadow-sm text-center ${styles.card}`}>
        <i className={`bi bi-check-circle-fill ${styles.icon}`}></i>
        <h2 className="mt-3">Заказ оформлен!</h2>
        <p className="text-muted">Номер вашего заказа:</p>
        <h3 className="text-primary">{orderNumber}</h3>
        <p className="mt-3">Спасибо за покупку! Мы свяжемся с вами для подтверждения.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Вернуться в каталог
        </Link>
      </div>
    </div>
  );
}