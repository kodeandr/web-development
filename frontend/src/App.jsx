import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

function App() {
  return (
    <CartProvider>
      <Header />
      <main className="container" style={{ minHeight: '70vh', marginTop: '20px' }}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<h2>404 - Страница не найдена</h2>} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  );
}

export default App;