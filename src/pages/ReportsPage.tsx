import { useState } from 'react'
import { useEvents } from '../features/events/useEvents'
import { useEventFilters } from '../features/events/useEventFilters'
import type { EventEntity } from '../types/domain'
import { EventCard } from '../shared/ui/EventCard'
import { EventModal } from '../shared/ui/EventModal'
import { PageHeader } from '../shared/ui/PageHeader'
import { ReportsTable } from '../shared/ui/ReportsTable'
import { EventFilters } from '../shared/ui/EventFilters'

export function ReportsPage() {
  const { data = [] } = useEvents('reports')
  const [selected, setSelected] = useState<EventEntity | null>(null)
  const [selectedFromTable, setSelectedFromTable] = useState<EventEntity | null>(null)
  const { filtered, filters, options, activeFilters, updateFilter, clearFilters } =
    useEventFilters(data, 'reports')

  return (
    <section className="space-y-6">
      <PageHeader
        title="Отчеты"
        description="Прошедшие мероприятия в виде таблицы и карточек."
      />
      <EventFilters
        filters={filters}
        activeFilters={activeFilters}
        options={options}
        onChange={updateFilter}
        onRemoveFilter={(key) => updateFilter(key, '')}
        onClear={clearFilters}
      />
      <ReportsTable events={filtered} onRowClick={setSelectedFromTable} />
      {selectedFromTable && (
        <div className="space-y-2 rounded-xl border border-slate-300 bg-white p-3">
          <p className="text-sm font-medium text-slate-600">
            Выбранное мероприятие из статистики
          </p>
          <EventCard event={selectedFromTable} onOpenDetails={setSelected} />
        </div>
      )}
      <div className="space-y-2">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} onOpenDetails={setSelected} />
        ))}
      </div>
      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
