import './FilterSidebar.css'

export default function FilterSidebar({ filters, onFilterChange, categories }) {
  const handleCategory = (id) => {
    const updated = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id]
    onFilterChange({ ...filters, categories: updated })
  }

  return (
    <aside className="filter-sidebar">
      <h3>Категории</h3>
      <div className="filter-group">
        {categories.map((cat) => (
          <label key={cat.id} className="filter-item">
            <input
              type="checkbox"
              checked={filters.categories.includes(cat.id)}
              onChange={() => handleCategory(cat.id)}
            />
            {cat.name}
          </label>
        ))}
      </div>
      <h3>Мощность (Вт)</h3>
      <div className="filter-group">
        <input
          type="number"
          placeholder="от"
          value={filters.power_min}
          onChange={(e) => onFilterChange({ ...filters, power_min: e.target.value })}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="до"
          value={filters.power_max}
          onChange={(e) => onFilterChange({ ...filters, power_max: e.target.value })}
          className="filter-input"
        />
      </div>
      <h3>Цена (₽)</h3>
      <div className="filter-group">
        <input
          type="number"
          placeholder="от"
          value={filters.price_min}
          onChange={(e) => onFilterChange({ ...filters, price_min: e.target.value })}
          className="filter-input"
        />
        <input
          type="number"
          placeholder="до"
          value={filters.price_max}
          onChange={(e) => onFilterChange({ ...filters, price_max: e.target.value })}
          className="filter-input"
        />
      </div>
    </aside>
  )
}