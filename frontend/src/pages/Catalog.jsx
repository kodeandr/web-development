import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const API_URL = 'http://localhost:8000';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    min_price: '',
    max_price: ''
  });

  // Храним количество для каждого товара (по id)
  const [quantities, setQuantities] = useState({});

  const { addToCart } = useCart();

  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.category_id) query.append('category_id', params.category_id);
      if (params.min_price) query.append('min_price', params.min_price);
      if (params.max_price) query.append('max_price', params.max_price);

      const res = await fetch(`${API_URL}/products?${query.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки товаров', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Ошибка загрузки категорий', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts(filters);
  };

  const handleReset = () => {
    setFilters({ category_id: '', min_price: '', max_price: '' });
    fetchProducts();
  };

  // Функция добавления с учётом выбранного количества
  const handleAddToCart = (product, quantity) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity || 1
    });
    // Сбросим количество на 1 после добавления (опционально)
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div>
      <h2 className="mb-4">Каталог товаров</h2>

      {/* Фильтры */}
      <form onSubmit={handleFilterSubmit} className="card shadow-sm p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Категория</label>
            <select
              className="form-select"
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Цена от</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Цена до</label>
            <input
              type="number"
              className="form-control"
              placeholder="9999"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end gap-2">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-funnel me-1"></i>Применить
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise me-1"></i>Сбросить
            </button>
          </div>
        </div>
      </form>

      {/* Список товаров */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="alert alert-info">Товары не найдены</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {products.map((product) => (
            <div key={product.id} className="col">
              <div className="card h-100">
                {/* === ИЗОБРАЖЕНИЕ === */}
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="card-img-top d-flex align-items-center justify-content-center bg-light"
                    style={{ height: '400px' }}
                  >
                    <i className="bi bi-image text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small flex-grow-1">{product.description}</p>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="fs-4 fw-bold text-primary">{product.price} ₽</span>
                  </div>
                  {/* Количество + кнопка */}
                  <div className="d-flex align-items-center mt-2">
                    <input
                      type="number"
                      className="form-control me-2"
                      style={{ width: '70px' }}
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantities(prev => ({ ...prev, [product.id]: val }));
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product, quantities[product.id] || 1)}
                    >
                      <i className="bi bi-cart-plus me-1"></i>В корзину
                    </button>
                  </div>
                  <Link to={`/product/${product.id}`} className="btn btn-outline-secondary mt-2">
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}