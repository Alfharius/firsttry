import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import clsx from 'clsx'
import type { EventEntity } from '../../types/domain'

interface ReportsCostsChartProps {
  events: EventEntity[]
}

type ChartMetric =
  | 'priceWithoutVat'
  | 'vat'
  | 'priceWithVat'
  | 'eventCount'

const METRIC_OPTIONS: { id: ChartMetric; label: string }[] = [
  { id: 'priceWithoutVat', label: 'Сумма без НДС' },
  { id: 'vat', label: 'НДС' },
  { id: 'priceWithVat', label: 'Итого с НДС' },
  { id: 'eventCount', label: 'Число мероприятий' },
]

function valueForMetric(event: EventEntity, metric: ChartMetric): number {
  switch (metric) {
    case 'priceWithoutVat':
      return event.priceWithoutVat
    case 'vat':
      return event.vat
    case 'priceWithVat':
      return event.priceWithVat
    case 'eventCount':
      return 1
    default:
      return 0
  }
}

function aggregateByMonth(events: EventEntity[], metric: ChartMetric) {
  const map = new Map<string, number>()
  for (const event of events) {
    const d = new Date(event.endAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const add = valueForMetric(event, metric)
    map.set(key, (map.get(key) ?? 0) + add)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, total]) => {
      const [y, m] = monthKey.split('-').map(Number)
      const label = new Date(y, m - 1, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      })
      return { monthKey, label, total }
    })
}

function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ReportsCostsChart({ events }: ReportsCostsChartProps) {
  const [metric, setMetric] = useState<ChartMetric>('priceWithVat')
  const data = useMemo(() => aggregateByMonth(events, metric), [events, metric])
  const isCount = metric === 'eventCount'
  const metricLabel = METRIC_OPTIONS.find((o) => o.id === metric)?.label ?? ''

  if (!data.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Нет данных для графика. Добавьте прошедшие мероприятия или ослабьте фильтры.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-lg font-semibold text-slate-900">Показатели по месяцам</h3>
      <p className="mb-3 text-sm text-slate-600">
        Группировка по месяцу окончания мероприятия ({metricLabel}
        {isCount ? '' : ', ₽'}).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {METRIC_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMetric(opt.id)}
            className={clsx(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              metric === opt.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-[320px] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#64748b' }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) =>
                isCount
                  ? String(Math.round(Number(v)))
                  : new Intl.NumberFormat('ru-RU', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(Number(v))
              }
            />
            <Tooltip
              formatter={(value) =>
                isCount
                  ? [String(Math.round(Number(value) || 0)), metricLabel]
                  : [formatRub(Number(value) || 0), metricLabel]
              }
              labelFormatter={(_, payload) =>
                (payload?.[0]?.payload as { label?: string } | undefined)?.label ?? ''
              }
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            />
            <Bar
              dataKey="total"
              name={metricLabel}
              fill={isCount ? '#6366f1' : '#3b82f6'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
