import { Link } from 'react-router-dom'
import './ProductCard.css'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../features/cart/cartSlice'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart)
  const alreadyInCart = cartItems.find((item) => item.id === product.id)?.quantity || 0
  const inStock = product.stock_quantity

  const handleAdd = () => {
    if (alreadyInCart >= inStock) {
      alert('Больше нет в наличии')
      return
    }
    dispatch(addToCart({ product, quantity: 1 }))
  }

  // === ИСПРАВЛЕНИЕ: fallback при битой картинке ===
  const handleImgError = (e) => {
    e.target.src = '/placeholder.png'  // локальный файл в public/
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.images?.[0]?.image_url || '/placeholder.png'}
          alt={product.name}
          className="product-card__img"
          onError={handleImgError}     // ← добавляем обработчик
        />
        <h3 className="product-card__name">{product.name}</h3>
      </Link>
      <p className="product-card__power">{product.power_watt} Вт</p>
      <p className="product-card__price">{product.price} ₽</p>
      <button
        className="product-card__btn"
        onClick={handleAdd}
        disabled={alreadyInCart >= inStock}
      >
        В корзину {alreadyInCart > 0 && `(${alreadyInCart})`}
      </button>
    </div>
  )
}