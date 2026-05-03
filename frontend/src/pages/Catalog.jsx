import { useState, useEffect } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

export default function Catalog() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({ categories: [], power_min: '', power_max: '', price_min: '', price_max: '', sort: 'default' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let result = [...products];
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category_id));
    }
    // ИСПРАВЛЕНО: проверяем на undefined и пустую строку, чтобы 0 учитывался
    if (filters.power_min !== '' && filters.power_min !== undefined && filters.power_min !== null) {
      result = result.filter(p => p.power_watt >= Number(filters.power_min));
    }
    if (filters.power_max !== '' && filters.power_max !== undefined && filters.power_max !== null) {
      result = result.filter(p => p.power_watt <= Number(filters.power_max));
    }
    if (filters.price_min !== '' && filters.price_min !== undefined && filters.price_min !== null) {
      result = result.filter(p => p.price >= Number(filters.price_min));
    }
    if (filters.price_max !== '' && filters.price_max !== undefined && filters.price_max !== null) {
      result = result.filter(p => p.price <= Number(filters.price_max));
    }
    if (filters.sort === 'price_asc') result.sort((a,b) => a.price - b.price);
    if (filters.sort === 'price_desc') result.sort((a,b) => b.price - a.price);
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE);

  return (
    <div className="clearfix">
      <FilterSidebar filters={filters} onFilterChange={setFilters} />
      <div className="products-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span></span>
          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})}>
            <option value="default">Сортировка</option>
            <option value="price_asc">Сначала дешёвые</option>
            <option value="price_desc">Сначала дорогие</option>
          </select>
        </div>
        {paginatedProducts.length === 0 ? <p>Товаров не найдено</p> : (
          <div className="grid">
            {paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>
    </div>
  );
}