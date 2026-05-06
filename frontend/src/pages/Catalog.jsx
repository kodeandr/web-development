import { useState } from 'react'
import { useGetProductsQuery, useGetCategoriesQuery } from '../app/api/productApi'
import ProductCard from '../components/ProductCard'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'
import './Catalog.css'

const ITEMS_PER_PAGE = 6

export default function Catalog() {
  const [filters, setFilters] = useState({
    categories: [],
    power_min: '',
    power_max: '',
    price_min: '',
    price_max: '',
    sort: 'default',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const params = {}
  if (filters.price_min) params.min_price = filters.price_min
  if (filters.price_max) params.max_price = filters.price_max
  if (filters.categories.length === 1) params.category_id = filters.categories[0]

  const { data: productsData, error, isLoading } = useGetProductsQuery(params)
  const { data: categories } = useGetCategoriesQuery()

  // === ИСПРАВЛЕНИЕ: явная обработка ошибки сети и загрузки ===
  if (isLoading) {
    return <div className="status-message">⏳ Загрузка каталога...</div>
  }
  if (error) {
    return (
      <div className="status-message error">
        ❌ Ошибка загрузки товаров: {error.message || 'Неизвестная ошибка'}
      </div>
    )
  }

  let filtered = Array.isArray(productsData) ? [...productsData] : []
  if (filters.categories.length > 1) {
    filtered = filtered.filter((p) => filters.categories.includes(p.category_id))
  } else if (filters.categories.length === 1 && params.category_id) {
    filtered = filtered.filter((p) => p.category_id === filters.categories[0])
  }
  if (filters.power_min !== '') {
    filtered = filtered.filter((p) => p.power_watt >= Number(filters.power_min))
  }
  if (filters.power_max !== '') {
    filtered = filtered.filter((p) => p.power_watt <= Number(filters.power_max))
  }

  if (filters.sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price)
  } else if (filters.sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price)
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  if (currentPage > totalPages && totalPages > 0) setCurrentPage(1)

  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filtered.slice(start, start + ITEMS_PER_PAGE)

  return (
    <div className="catalog-page">
      <FilterSidebar
        filters={filters}
        onFilterChange={(f) => {
          setFilters(f)
          setCurrentPage(1)
        }}
        categories={categories || []}
      />
      <div className="catalog-content">
        <div className="sort-bar">
          <span>Найдено: {filtered.length}</span>
          <select
            value={filters.sort}
            onChange={(e) => {
              setFilters({ ...filters, sort: e.target.value })
              setCurrentPage(1)
            }}
          >
            <option value="default">Сортировка</option>
            <option value="price_asc">Сначала дешёвые</option>
            <option value="price_desc">Сначала дорогие</option>
          </select>
        </div>
        {paginatedProducts.length === 0 ? (
          <p>Товары не найдены</p>
        ) : (
          <div className="product-grid">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  )
}