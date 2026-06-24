import type { EventFiltersState } from '../../features/events/useEventFilters'
import { Select } from './Select'

interface EventFiltersProps {
  filters: EventFiltersState
  activeFilters: Array<{ key: keyof EventFiltersState; label: string; value: string }>
  options: { types: string[]; categories: string[]; locations: string[] }
  onChange: (key: keyof EventFiltersState, value: string) => void
  onRemoveFilter: (key: keyof EventFiltersState) => void
  onClear: () => void
}

export function EventFilters({
  filters,
  activeFilters,
  options,
  onChange,
  onRemoveFilter,
  onClear,
}: EventFiltersProps) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          value={filters.q}
          onChange={(event) => onChange('q', event.target.value)}
          placeholder="Поиск по названию"
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3"
        />
        <Select value={filters.type} onChange={(event) => onChange('type', event.target.value)}>
          <option value="">Все типы</option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <Select
          value={filters.category}
          onChange={(event) => onChange('category', event.target.value)}
        >
          <option value="">Все категории</option>
          {options.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Select
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
        >
          <option value="">Все площадки</option>
          {options.locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onChange('dateFrom', event.target.value)}
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange('dateTo', event.target.value)}
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onClear}
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-1"
        >
          Сброс
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((item) => (
            <button
              key={`${item.key}_${item.value}`}
              type="button"
              onClick={() => onRemoveFilter(item.key)}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              {item.label}: {item.value} ×
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
