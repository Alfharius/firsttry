import { useMemo, useState } from 'react'
import type { EventEntity } from '../../types/domain'
import { buildEstimateRows } from '../lib/estimate'
import { EventEstimateTable } from './EventEstimateTable'

interface EventCardProps {
  event: EventEntity
  onOpenDetails: (event: EventEntity) => void
  showDaysUntilStart?: boolean
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export function EventCard({
  event,
  onOpenDetails,
  showDaysUntilStart = true,
}: EventCardProps) {
  const [now] = useState(() => Date.now())
  const startMs = new Date(event.startAt).getTime()
  const startsInDays = Math.ceil((startMs - now) / (1000 * 60 * 60 * 24))
  const shouldShowDaysBadge = showDaysUntilStart && startMs > now && startsInDays > 0
  const estimateRows = useMemo(() => buildEstimateRows(event), [event])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-100/80">
      <div className="flex flex-col gap-3 p-2 md:flex-row md:gap-4 md:p-3">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-40 w-full rounded-lg bg-slate-300 object-cover md:h-48 md:w-72"
        />
        <div className="flex-1 space-y-3 py-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-medium leading-tight text-slate-900">{event.title}</h3>
            {shouldShowDaysBadge && (
              <p className="shrink-0 text-sm text-slate-700">{startsInDays} дней до начала</p>
            )}
          </div>

          <div className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-3">
            <p className="text-xl text-slate-800">Тип</p>
            <p className="text-xl text-slate-800">{event.type}</p>
            <p className="text-xl text-slate-800">Состав</p>

            <p className="text-xl text-slate-800">Категория</p>
            <p className="text-xl text-slate-800">{event.category}</p>
            <p />

            <p className="text-xl text-slate-800">Число участников</p>
            <p className="text-xl text-slate-800">{event.participantsCount} человека</p>
            <p />
          </div>

          <div className="grid gap-2 text-sm md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="mb-1 text-xl text-slate-800">Даты проведения</p>
              <p className="text-lg text-slate-700">
                {new Date(event.startAt).toLocaleDateString('ru-RU')}{' '}
                {new Date(event.startAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                -
                {new Date(event.endAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="space-y-1 text-right md:text-left">
              <p className="text-xl text-slate-800">Цена, без НДС {formatMoney(event.priceWithoutVat)} ₽</p>
              <p className="text-xl text-slate-800">НДС (20%) {formatMoney(event.vat)} ₽</p>
              <p className="text-xl text-slate-900">Итого {formatMoney(event.priceWithVat)} ₽</p>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-3">
            <p className="mb-2 text-xl font-medium text-slate-800">Смета</p>
            <details className="group rounded-lg border border-slate-200 bg-white/60">
              <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-slate-800 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="underline decoration-slate-400 underline-offset-2 group-open:no-underline">
                  Подробнее
                </span>
              </summary>
              <div className="border-t border-slate-200 px-3 pb-3 pt-2">
                <EventEstimateTable rows={estimateRows} compact />
                {event.estimateNote && (
                  <p className="mt-2 text-sm text-slate-600">Комментарий: {event.estimateNote}</p>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenDetails(event)}
        className="w-full border-t border-slate-300 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-200/50"
      >
        Открыть детали мероприятия
      </button>
    </div>
  )
}
