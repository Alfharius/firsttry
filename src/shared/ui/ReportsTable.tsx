import { useMemo, useState, type ReactNode } from 'react'
import { formatRub } from '../lib/estimate'
import type { EventEntity } from '../../types/domain'
import { Select } from './Select'

interface ReportsTableProps {
  events: EventEntity[]
  onRowClick?: (event: EventEntity) => void
}

type ColumnKey =
  | 'title'
  | 'type'
  | 'category'
  | 'organizerName'
  | 'location'
  | 'startAt'
  | 'endAt'
  | 'participantsCount'
  | 'priceWithoutVat'
  | 'vat'
  | 'priceWithVat'

type SortBy = ColumnKey

interface ColumnDef {
  key: ColumnKey
  label: string
  sortable: boolean
  cellClassName?: string
  render: (event: EventEntity) => ReactNode
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const columns: ColumnDef[] = [
  { key: 'title', label: 'Название', sortable: true, render: (e) => e.title },
  { key: 'type', label: 'Тип', sortable: true, render: (e) => e.type },
  { key: 'category', label: 'Категория', sortable: true, render: (e) => e.category },
  { key: 'organizerName', label: 'Организатор', sortable: true, render: (e) => e.organizerName },
  { key: 'location', label: 'Место проведения', sortable: true, render: (e) => e.location },
  {
    key: 'startAt',
    label: 'Дата начала',
    sortable: true,
    render: (e) => formatDateTime(e.startAt),
  },
  {
    key: 'endAt',
    label: 'Дата окончания',
    sortable: true,
    render: (e) => formatDateTime(e.endAt),
  },
  {
    key: 'participantsCount',
    label: 'Число участников',
    sortable: true,
    render: (e) => e.participantsCount,
  },
  {
    key: 'priceWithoutVat',
    label: 'Цена, без НДС',
    sortable: true,
    render: (e) => `${formatRub(e.priceWithoutVat)} ₽`,
  },
  {
    key: 'vat',
    label: 'НДС (22%)',
    sortable: true,
    render: (e) => `${formatRub(e.vat)} ₽`,
  },
  {
    key: 'priceWithVat',
    label: 'Итого',
    sortable: true,
    render: (e) => `${formatRub(e.priceWithVat)} ₽`,
  },
]

const columnLabels = Object.fromEntries(columns.map((c) => [c.key, c.label])) as Record<
  ColumnKey,
  string
>

const defaultColumns: ColumnKey[] = columns.map((c) => c.key)

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const

function compareEvents(a: EventEntity, b: EventEntity, sortBy: SortBy) {
  switch (sortBy) {
    case 'title':
    case 'type':
    case 'category':
    case 'organizerName':
    case 'location':
      return String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''), 'ru')
    case 'startAt':
    case 'endAt':
      return new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
    case 'participantsCount':
    case 'priceWithoutVat':
    case 'vat':
    case 'priceWithVat':
      return a[sortBy] - b[sortBy]
    default:
      return 0
  }
}

function SortArrow({ ascending }: { ascending: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`ml-1 h-4 w-4 text-blue-600 transition-transform ${ascending ? '' : 'rotate-180'}`}
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 0 1 .53.22l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 5.56 6.28 8.73a.75.75 0 0 1-1.06-1.06l4.25-4.25A.75.75 0 0 1 10 3Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function ReportsTable({ events, onRowClick }: ReportsTableProps) {
  const [sortBy, setSortBy] = useState<SortBy>('startAt')
  const [ascending, setAscending] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(5)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns)

  const visibleColumnDefs = useMemo(
    () => columns.filter((column) => visibleColumns.includes(column.key)),
    [visibleColumns],
  )

  const sorted = useMemo(() => {
    const copy = [...events]
    copy.sort((a, b) => compareEvents(a, b, sortBy))
    return ascending ? copy : copy.reverse()
  }, [ascending, events, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const rangeStart = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, sorted.length)

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
    setPage(1)
  }

  function toggleColumn(column: ColumnKey) {
    setVisibleColumns((prev) => {
      if (prev.includes(column)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== column)
      }
      return columns.map((item) => item.key).filter((key) => prev.includes(key) || key === column)
    })
  }

  function handleColumnSort(column: ColumnKey) {
    if (sortBy === column) {
      setAscending((prev) => !prev)
    } else {
      setSortBy(column)
      setAscending(true)
    }
    setPage(1)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
        <span className="w-full text-sm font-medium text-slate-700 sm:w-auto">Столбцы:</span>
        {(Object.keys(columnLabels) as ColumnKey[]).map((column) => {
          const active = visibleColumns.includes(column)
          return (
            <button
              key={column}
              type="button"
              onClick={() => toggleColumn(column)}
              className={`min-h-9 rounded-full px-3 py-1.5 text-xs ${
                active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {columnLabels[column]}
            </button>
          )
        })}
      </div>

      <div className="space-y-2 p-3 md:hidden">
        {pageRows.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onRowClick?.(event)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100"
          >
            <dl className="space-y-2">
              {visibleColumnDefs.map((column) => (
                <div
                  key={column.key}
                  className="grid grid-cols-1 gap-0.5 border-b border-slate-200/80 pb-2 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,9.5rem)_1fr] sm:items-baseline sm:gap-x-3"
                >
                  <dt className="text-xs font-semibold text-slate-600">{column.label}</dt>
                  <dd className="text-sm text-slate-900 break-words">{column.render(event)}</dd>
                </div>
              ))}
            </dl>
          </button>
        ))}
        {!pageRows.length && (
          <p className="py-4 text-center text-sm text-slate-500">Нет данных для отображения</p>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              {visibleColumnDefs.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-3 py-2">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center font-semibold hover:text-blue-700"
                      onClick={() => handleColumnSort(column.key)}
                    >
                      {column.label}
                      {sortBy === column.key && <SortArrow ascending={ascending} />}
                    </button>
                  ) : (
                    <span className="font-semibold">{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((event) => (
              <tr
                key={event.id}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                onClick={() => onRowClick?.(event)}
              >
                {visibleColumnDefs.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3 py-2 ${column.cellClassName ?? 'whitespace-nowrap'}`}
                  >
                    {column.render(event)}
                  </td>
                ))}
              </tr>
            ))}
            {!pageRows.length && (
              <tr>
                <td
                  colSpan={visibleColumnDefs.length}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  Нет данных для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          className="min-h-11 rounded bg-slate-100 px-4 py-2 text-sm disabled:opacity-50 sm:min-h-0 sm:px-3 sm:py-1"
          disabled={currentPage <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Назад
        </button>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <div className="text-center text-sm text-slate-600">
            {sorted.length > 0
              ? `${rangeStart}–${rangeEnd} из ${sorted.length} · страница ${currentPage} из ${totalPages}`
              : `Страница ${currentPage} из ${totalPages}`}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="whitespace-nowrap">Строк на странице:</span>
            <Select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(event.target.value)}
              className="min-h-9 w-20 py-1 pr-8"
              aria-label="Строк на странице"
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
          disabled={currentPage >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Вперед
        </button>
      </div>
    </div>
  )
}
