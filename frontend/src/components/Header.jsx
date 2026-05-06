import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Header.css'

export default function Header() {
  const totalItems = useSelector((state) =>
    state.cart.reduce((sum, item) => sum + item.quantity, 0)
  )
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">Лампочки.рф</Link>
        <nav>
          <Link to="/cart" className="cart-link">
            Корзина ({totalItems})
          </Link>
        </nav>
      </div>
    </header>
  )
}