import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import styles from './ProductDetails.module.css';

const API_URL = 'http://localhost:8000';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Товар не найден');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: parseInt(quantity) || 1
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="alert alert-warning">
        Товар не найден. <Link to="/" className="alert-link">Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/" className={`btn btn-outline-secondary mb-3 ${styles.backBtn}`}>
        <i className="bi bi-arrow-left me-1"></i>Назад к каталогу
      </Link>
      <div className="card shadow-sm">
        <div className="row g-0">
          <div className="col-md-5">
            {product.image_url ? (
              <img
                src={product.image_url}
                className={`img-fluid rounded-start ${styles.image}`}
                alt={product.name}
              />
            ) : (
              <div className={`${styles.placeholder} rounded-start`}>
                <i className={`bi bi-image text-muted ${styles.placeholderIcon}`}></i>
              </div>
            )}
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p className="card-text">{product.description}</p>
              <p className="card-text">
                <strong>Цена:</strong> {product.price} ₽
              </p>
              <p className="card-text">
                <strong>В наличии:</strong> {product.stock_quantity} шт.
              </p>
              <div className="row g-2 align-items-center mb-3">
                <div className="col-auto">
                  <label className="form-label mb-0">Количество:</label>
                </div>
                <div className="col-auto">
                  <input
                    type="number"
                    className={`form-control ${styles.quantityInput}`}
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="bi bi-cart-plus me-1"></i>Добавить в корзину
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}