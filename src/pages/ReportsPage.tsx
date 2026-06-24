import { useState } from 'react'
import { useEvents } from '../features/events/useEvents'
import { useEventFilters } from '../features/events/useEventFilters'
import { exportReportsToExcel } from '../features/reports/exportReportsToExcel'
import type { EventEntity } from '../types/domain'
import { EventCard } from '../shared/ui/EventCard'
import { EventModal } from '../shared/ui/EventModal'
import { PageHeader } from '../shared/ui/PageHeader'
import { ReportsTable } from '../shared/ui/ReportsTable'
import { EventFilters } from '../shared/ui/EventFilters'
import { ReportsCostsChart } from '../shared/ui/ReportsCostsChart'
import clsx from 'clsx'

type ReportsTab = 'data' | 'chart'

export function ReportsPage() {
  const { data = [] } = useEvents('reports')
  const [selected, setSelected] = useState<EventEntity | null>(null)
  const [selectedFromTable, setSelectedFromTable] = useState<EventEntity | null>(null)
  const [activeTab, setActiveTab] = useState<ReportsTab>('data')
  const { filtered, filters, options, activeFilters, updateFilter, clearFilters } =
    useEventFilters(data, 'reports')

  const tabs: { id: ReportsTab; label: string }[] = [
    { id: 'data', label: 'Таблица и карточки' },
    { id: 'chart', label: 'Графики' },
  ]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Отчеты"
          description="Прошедшие мероприятия: таблица, карточки и графики по месяцам."
        />
        <button
          type="button"
          disabled={filtered.length === 0}
          onClick={() => exportReportsToExcel(filtered)}
          className="w-full min-h-11 shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          Выгрузить в Excel
        </button>
      </div>
      <EventFilters
        filters={filters}
        activeFilters={activeFilters}
        options={options}
        onChange={updateFilter}
        onRemoveFilter={(key) => updateFilter(key, '')}
        onClear={clearFilters}
      />

      <div className="flex flex-col gap-2 border-b border-slate-200 pb-2 sm:flex-row sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'min-h-11 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:min-h-0 sm:flex-none',
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'data' && (
        <>
          <ReportsTable events={filtered} onRowClick={setSelectedFromTable} />
          {selectedFromTable && (
            <div className="space-y-2 rounded-xl border border-slate-300 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">
                  Выбранное мероприятие из статистики
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFromTable(null)}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
                >
                  Сбросить
                </button>
              </div>
              <EventCard event={selectedFromTable} onOpenDetails={setSelected} />
            </div>
          )}
          <div className="space-y-2">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} onOpenDetails={setSelected} />
            ))}
          </div>
        </>
      )}

      {activeTab === 'chart' && <ReportsCostsChart events={filtered} />}

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
