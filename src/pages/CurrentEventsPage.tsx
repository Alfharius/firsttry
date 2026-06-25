import { useState } from 'react'
import { useEvents } from '../features/events/useEvents'
import { useEventFilters } from '../features/events/useEventFilters'
import type { EventEntity } from '../types/domain'
import { EventCard } from '../shared/ui/EventCard'
import { EventModal } from '../shared/ui/EventModal'
import { PageHeader } from '../shared/ui/PageHeader'
import { EventFilters } from '../shared/ui/EventFilters'

export function CurrentEventsPage() {
  const { data = [] } = useEvents('current')
  const [selected, setSelected] = useState<EventEntity | null>(null)
  const { filtered, filters, options, activeFilters, updateFilter, clearFilters } =
    useEventFilters(data, 'current')

  return (
    <section className='space-y-4'>
      <PageHeader title="Проходящие мероприятия" />
      <EventFilters
        filters={filters}
        activeFilters={activeFilters}
        options={options}
        onChange={updateFilter}
        onRemoveFilter={(key) => updateFilter(key, '')}
        onClear={clearFilters}
      />
      <div className="space-y-2">
        {filtered.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onOpenDetails={setSelected}
            showDaysUntilStart={false}
          />
        ))}
      </div>
      {!filtered.length && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          Сейчас нет активных мероприятий.
        </p>
      )}
      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
