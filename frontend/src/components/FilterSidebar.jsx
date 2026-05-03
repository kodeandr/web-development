import { categories } from '../data/categories';

export default function FilterSidebar({ filters, onFilterChange }) {
  return (
    <div className="filters">
      <h4>Цоколь</h4>
      {categories.map(cat => (
        <label key={cat.id} style={{ display: 'block' }}>
          <input
            type="checkbox"
            value={cat.id}
            checked={filters.categories.includes(cat.id)}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              const newCats = e.target.checked
                ? [...filters.categories, value]
                : filters.categories.filter(id => id !== value);
              onFilterChange({ ...filters, categories: newCats });
            }}
          /> {cat.name}
        </label>
      ))}
      <h4>Мощность (Вт)</h4>
      <input type="number" placeholder="от" value={filters.power_min || ''} onChange={(e) => onFilterChange({ ...filters, power_min: e.target.value ? parseInt(e.target.value) : '' })} style={{ width: '80px', marginRight: '8px' }} />
      <input type="number" placeholder="до" value={filters.power_max || ''} onChange={(e) => onFilterChange({ ...filters, power_max: e.target.value ? parseInt(e.target.value) : '' })} style={{ width: '80px' }} />
      <h4>Цена (₽)</h4>
      <input type="number" placeholder="от" value={filters.price_min || ''} onChange={(e) => onFilterChange({ ...filters, price_min: e.target.value ? parseFloat(e.target.value) : '' })} style={{ width: '80px', marginRight: '8px' }} />
      <input type="number" placeholder="до" value={filters.price_max || ''} onChange={(e) => onFilterChange({ ...filters, price_max: e.target.value ? parseFloat(e.target.value) : '' })} style={{ width: '80px' }} />
      <button onClick={() => onFilterChange({ categories: [], power_min: '', power_max: '', price_min: '', price_max: '', sort: 'default' })} style={{ marginTop: '15px' }}>Сбросить</button>
    </div>
  );
}