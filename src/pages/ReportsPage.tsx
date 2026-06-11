import { useState } from 'react'
import { useEvents } from '../features/events/useEvents'
import { useEventFilters } from '../features/events/useEventFilters'
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
      <PageHeader
        title="Отчеты"
        description="Прошедшие мероприятия: таблица, карточки и графики по месяцам."
      />
      <EventFilters
        filters={filters}
        activeFilters={activeFilters}
        options={options}
        onChange={updateFilter}
        onRemoveFilter={(key) => updateFilter(key, '')}
        onClear={clearFilters}
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition',
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
        </>
      )}

      {activeTab === 'chart' && <ReportsCostsChart events={filtered} />}

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
