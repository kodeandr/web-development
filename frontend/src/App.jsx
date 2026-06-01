import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import OrderTracking from './pages/OrderTracking';
import { CartProvider } from './contexts/CartContext';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main className="container d-flex flex-column flex-grow-1">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:orderNumber?" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tracking" element={<OrderTracking />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  );
}