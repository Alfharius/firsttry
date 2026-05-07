import type { EventFiltersState } from '../../features/events/useEventFilters'

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
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <input
          value={filters.q}
          onChange={(event) => onChange('q', event.target.value)}
          placeholder="Поиск по названию"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={filters.type}
          onChange={(event) => onChange('type', event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Все типы</option>
          {options.types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(event) => onChange('category', event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Все категории</option>
          {options.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={filters.location}
          onChange={(event) => onChange('location', event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Все площадки</option>
          {options.locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(event) => onChange('dateFrom', event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange('dateTo', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Сброс
          </button>
        </div>
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
