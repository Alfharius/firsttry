import { useMemo, useState } from 'react'
import type { EventEntity } from '../../types/domain'

interface ReportsTableProps {
  events: EventEntity[]
  onRowClick?: (event: EventEntity) => void
}

type SortBy = 'title' | 'startAt' | 'priceWithVat'
type ColumnKey = 'title' | 'category' | 'startAt' | 'priceWithVat'

const columnLabels: Record<ColumnKey, string> = {
  title: 'Название',
  category: 'Категория',
  startAt: 'Дата',
  priceWithVat: 'Цена с НДС',
}

const defaultColumns: ColumnKey[] = ['title', 'category', 'startAt', 'priceWithVat']

export function ReportsTable({ events, onRowClick }: ReportsTableProps) {
  const [sortBy, setSortBy] = useState<SortBy>('startAt')
  const [ascending, setAscending] = useState(false)
  const [page, setPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(defaultColumns)
  const pageSize = 5

  const sorted = useMemo(() => {
    const copy = [...events]
    copy.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'startAt')
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      return a.priceWithVat - b.priceWithVat
    })
    return ascending ? copy : copy.reverse()
  }, [ascending, events, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function toggleColumn(column: ColumnKey) {
    setVisibleColumns((prev) => {
      if (prev.includes(column)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== column)
      }
      return [...prev, column]
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3">
        <span className="text-sm font-medium text-slate-700">Столбцы:</span>
        {(Object.keys(columnLabels) as ColumnKey[]).map((column) => {
          const active = visibleColumns.includes(column)
          return (
            <button
              key={column}
              type="button"
              onClick={() => toggleColumn(column)}
              className={`rounded-full px-3 py-1 text-xs ${
                active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {columnLabels[column]}
            </button>
          )
        })}
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            {visibleColumns.includes('title') && (
              <th className="px-3 py-2">
                <button
                  type="button"
                  className="font-semibold"
                  onClick={() => setSortBy('title')}
                >
                  Название
                </button>
              </th>
            )}
            {visibleColumns.includes('category') && <th className="px-3 py-2">Категория</th>}
            {visibleColumns.includes('startAt') && (
              <th className="px-3 py-2">
                <button
                  type="button"
                  className="font-semibold"
                  onClick={() => setSortBy('startAt')}
                >
                  Дата
                </button>
              </th>
            )}
            {visibleColumns.includes('priceWithVat') && (
              <th className="px-3 py-2">
                <button
                  type="button"
                  className="font-semibold"
                  onClick={() => setSortBy('priceWithVat')}
                >
                  Цена с НДС
                </button>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((event) => (
            <tr
              key={event.id}
              className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              onClick={() => onRowClick?.(event)}
            >
              {visibleColumns.includes('title') && <td className="px-3 py-2">{event.title}</td>}
              {visibleColumns.includes('category') && (
                <td className="px-3 py-2">{event.category}</td>
              )}
              {visibleColumns.includes('startAt') && (
                <td className="px-3 py-2">{new Date(event.startAt).toLocaleDateString('ru-RU')}</td>
              )}
              {visibleColumns.includes('priceWithVat') && (
                <td className="px-3 py-2">{event.priceWithVat.toLocaleString('ru-RU')}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 p-3">
        <button
          type="button"
          className="rounded bg-slate-100 px-3 py-1 disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Назад
        </button>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>
            Страница {currentPage} из {totalPages}
          </span>
          <button
            type="button"
            className="rounded bg-slate-100 px-2 py-1"
            onClick={() => setAscending((prev) => !prev)}
          >
            {ascending ? 'ASC' : 'DESC'}
          </button>
        </div>
        <button
          type="button"
          className="rounded bg-slate-100 px-3 py-1 disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Вперед
        </button>
      </div>
    </div>
  )
}
