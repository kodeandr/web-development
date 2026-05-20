import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const PRODUCTS_URL = 'http://localhost:8000/products';
const ORDERS_URL = 'http://localhost:8001/orders';

// Обёртка для авторизованных запросов
const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: 1,
    image_url: '',
  });
  const navigate = useNavigate();

  // Загрузка товаров
  const loadProducts = useCallback(async () => {
    try {
      const res = await authFetch(PRODUCTS_URL);
      if (!res.ok) throw new Error('Ошибка загрузки');
      setProducts(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    try {
      const res = await authFetch(ORDERS_URL);
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setOrders(data.items || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
    else loadOrders();
  }, [activeTab, loadProducts, loadOrders]);

  // Открыть модальное окно для добавления
  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: 1,
      image_url: '',
    });
    setShowModal(true);
  };

  // Открыть модальное окно для редактирования
  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || 1,
      image_url: product.image_url || '',
    });
    setShowModal(true);
  };

  // Сохранить товар (добавить или обновить)
  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,
      category_id: form.category_id,
      image_url: form.image_url,
    };
    try {
      const url = editingProduct
        ? `${PRODUCTS_URL}/${editingProduct.id}`
        : PRODUCTS_URL;
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify(payload) });
      if (res.ok) {
        setShowModal(false);
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.detail || 'Ошибка сохранения');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Удалить товар
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      const res = await authFetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.detail || 'Ошибка удаления');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Изменить статус заказа
  const handleStatusChange = async (orderNumber, newStatus) => {
    try {
      const res = await authFetch(`${ORDERS_URL}/${orderNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
      } else {
        const err = await res.json();
        alert(err.detail || 'Ошибка изменения статуса');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Выход
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  // Бейдж для статуса
  const statusBadge = (status) => {
    const map = {
      новый: 'primary',
      'в обработке': 'warning',
      отправлен: 'info',
      доставлен: 'success',
      отменён: 'danger'
    };
    return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Навигация */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-lightning-charge-fill me-2"></i>
            Панель администратора
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Выйти
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Вкладки */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="bi bi-box-seam me-1"></i> Товары
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-truck me-1"></i> Заказы
            </button>
          </li>
        </ul>

        {/* Контент вкладок */}
        {activeTab === 'products' ? (
          <>
            <button className="btn btn-success mb-3" onClick={openAddModal}>
              <i className="bi bi-plus-circle me-1"></i>
              Добавить товар
            </button>
            <div className="table-responsive">
              <table className="table table-hover align-middle bg-white rounded shadow-sm">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Остаток</th>
                    <th className="text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.price} ₽</td>
                      <td>{p.stock_quantity}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-primary btn-sm me-1"
                          title="Редактировать"
                          onClick={() => openEditModal(p)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Удалить"
                          onClick={() => handleDelete(p.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle bg-white rounded shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Номер заказа</th>
                  <th>Товары</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Изменить статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.order_number}>
                    <td><strong>{order.order_number}</strong></td>
                    <td>
                      {order.items?.map((it, idx) => (
                        <div key={idx}>{it.product_name} × {it.quantity}</div>
                      ))}
                    </td>
                    <td>{statusBadge(order.status)}</td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_number, e.target.value)}
                      >
                        <option value="новый">Новый</option>
                        <option value="в обработке">В обработке</option>
                        <option value="отправлен">Отправлен</option>
                        <option value="доставлен">Доставлен</option>
                        <option value="отменён">Отменён</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно товара */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Название</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Описание</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Цена</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Остаток</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.stock_quantity}
                        onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Категория (ID)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">URL изображения</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Отмена
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}