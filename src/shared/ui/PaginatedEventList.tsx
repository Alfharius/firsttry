import type { EventEntity } from '../../types/domain'
import { usePagination } from '../hooks/usePagination'
import { EventCard } from './EventCard'
import { ListPagination } from './ListPagination'

interface PaginatedEventListProps {
  events: EventEntity[]
  emptyMessage: string
  onOpenDetails: (event: EventEntity) => void
  showDaysUntilStart?: boolean
}

export function PaginatedEventList({
  events,
  emptyMessage,
  onOpenDetails,
  showDaysUntilStart = true,
}: PaginatedEventListProps) {
  const pagination = usePagination(events)

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        {pagination.pageItems.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onOpenDetails={onOpenDetails}
            showDaysUntilStart={showDaysUntilStart}
          />
        ))}
      </div>
      {!events.length && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}
      <ListPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.handlePageSizeChange}
      />
    </div>
  )
}
