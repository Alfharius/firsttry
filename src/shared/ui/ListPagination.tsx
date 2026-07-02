import { PAGE_SIZE_OPTIONS } from '../hooks/usePagination'
import { Select } from './Select'

interface ListPaginationProps {
  page: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (value: string) => void
  embedded?: boolean
}

export function ListPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  embedded = false,
}: ListPaginationProps) {
  if (total === 0) return null

  return (
    <div
      className={
        embedded
          ? 'flex flex-col gap-3 border-t border-slate-200 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
          : 'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'
      }
    >
      <button
        type="button"
        className="min-h-11 rounded bg-slate-100 px-4 py-2 text-sm disabled:opacity-50 sm:min-h-0 sm:px-3 sm:py-1"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </button>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <div className="text-center text-sm text-slate-600">
          {`${rangeStart}–${rangeEnd} из ${total} · страница ${page} из ${totalPages}`}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="whitespace-nowrap">На странице:</span>
          <Select
            value={pageSize}
            onChange={(event) => onPageSizeChange(event.target.value)}
            className="min-h-9 w-20 py-1 pr-8"
            aria-label="На странице"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <button
        type="button"
        className="min-h-11 rounded bg-slate-100 px-4 py-2 text-sm disabled:opacity-50 sm:min-h-0 sm:px-3 sm:py-1"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Вперед
      </button>
    </div>
  )
}
