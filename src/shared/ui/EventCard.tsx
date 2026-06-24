import { useState } from 'react'
import type { EventEntity } from '../../types/domain'
import { peopleWord } from '../lib/peopleWord'

interface EventCardProps {
  event: EventEntity
  onOpenDetails: (event: EventEntity) => void
  showDaysUntilStart?: boolean
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-slate-100/80">
      <div className="flex flex-col gap-3 p-2 md:flex-row md:gap-4 md:p-3">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-40 w-full rounded-lg bg-slate-300 object-cover md:h-48 md:w-72"
        />
        <div className="flex-1 space-y-2 py-1 sm:space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <h3 className="text-lg font-medium leading-tight text-slate-900 sm:text-xl md:text-2xl">
              {event.title}
            </h3>
            {shouldShowDaysBadge && (
              <p className="shrink-0 text-xs text-slate-700 sm:text-sm">{startsInDays} дней до начала</p>
            )}
          </div>

          <div className="grid gap-x-6 gap-y-1.5 text-sm sm:gap-y-2 sm:text-base md:grid-cols-2 md:text-lg">
            <p className="font-semibold text-slate-800">Тип</p>
            <p className="text-slate-800">{event.type}</p>

            <p className="font-semibold text-slate-800">Категория</p>
            <p className="text-slate-800">{event.category}</p>

            <p className="font-semibold text-slate-800">Место проведения</p>
            <p className="break-words text-slate-800">{event.location}</p>

            <p className="font-semibold text-slate-800">Число участников</p>
            <p className="text-slate-800">
              {event.participantsCount} {peopleWord(event.participantsCount)}
            </p>
          </div>

          <div className="mt-4 border-t border-slate-300 pt-4 sm:mt-6 sm:pt-5">
            <div className="grid gap-3 text-sm sm:gap-2 sm:text-base md:grid-cols-3 md:text-lg">
              <div className="md:col-span-2">
                <p className="mb-1 font-semibold text-slate-800">Даты проведения</p>
                <p className="text-slate-700">
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
              <div className="space-y-1">
                <p className="text-slate-800">
                  <span className="font-semibold">Цена, без НДС</span>{' '}
                  {formatMoney(event.priceWithoutVat)} ₽
                </p>
                <p className="text-slate-800">
                  <span className="font-semibold">НДС (22%)</span> {formatMoney(event.vat)} ₽
                </p>
                <p className="text-slate-900">
                  <span className="font-semibold">Итого</span> {formatMoney(event.priceWithVat)} ₽
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenDetails(event)}
        className="w-full min-h-11 border-t border-slate-300 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-200/50"
      >
        Открыть детали мероприятия
      </button>
    </div>
  )
}
