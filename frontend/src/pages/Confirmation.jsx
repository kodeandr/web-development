import { useParams, Link } from 'react-router-dom'
import './Confirmation.css'

export default function Confirmation() {
  const { orderNumber } = useParams()
  return (
    <div className="confirmation">
      <h2>Заказ оформлен!</h2>
      {orderNumber && <p>Номер заказа: <strong>{orderNumber}</strong></p>}
      <Link to="/">Продолжить покупки</Link>
    </div>
  )
}