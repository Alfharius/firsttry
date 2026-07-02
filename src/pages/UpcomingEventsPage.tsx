import { useState } from 'react'
import { useEvents } from '../features/events/useEvents'
import { useEventFilters } from '../features/events/useEventFilters'
import type { EventEntity } from '../types/domain'
import { EventModal } from '../shared/ui/EventModal'
import { PageHeader } from '../shared/ui/PageHeader'
import { EventFilters } from '../shared/ui/EventFilters'
import { PaginatedEventList } from '../shared/ui/PaginatedEventList'

export function UpcomingEventsPage() {
  const { data = [] } = useEvents('upcoming')
  const [selected, setSelected] = useState<EventEntity | null>(null)
  const { filtered, filters, options, activeFilters, updateFilter, clearFilters } =
    useEventFilters(data, 'upcoming')

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title="Будущие мероприятия" />
      <EventFilters
        filters={filters}
        activeFilters={activeFilters}
        options={options}
        onChange={updateFilter}
        onRemoveFilter={(key) => updateFilter(key, '')}
        onClear={clearFilters}
      />
      <PaginatedEventList
        events={filtered}
        emptyMessage="Будущие мероприятия не найдены."
        onOpenDetails={setSelected}
      />
      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
