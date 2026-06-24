import { useMemo } from 'react'
import type { EventEntity } from '../../types/domain'
import { buildEstimateRows, formatRub } from '../lib/estimate'
import { peopleWord } from '../lib/peopleWord'
import { EventEstimateTable } from './EventEstimateTable'

interface EventModalProps {
  event: EventEntity | null
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:gap-1 md:grid-cols-[minmax(0,11rem)_1fr] md:items-baseline md:gap-4">
      <span className="text-sm font-semibold text-slate-800 sm:text-base md:text-lg">{label}</span>
      <div className="text-sm text-slate-800 sm:text-base md:text-lg">{children}</div>
    </div>
  )
}

export function EventModal({ event, onClose }: EventModalProps) {
  const estimateRows = useMemo(() => (event ? buildEstimateRows(event) : []), [event])

  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/50 sm:items-center sm:justify-center sm:p-4">
      <section className="flex h-full max-h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 p-4 sm:border-0 sm:p-6 sm:pb-0">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-2xl">Детали мероприятия</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 sm:text-base"
          >
            Закрыть
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-40 w-full shrink-0 rounded-lg bg-slate-200 object-cover sm:h-48 md:h-56 md:w-72"
            />

            <div className="flex-1 space-y-2.5 sm:space-y-3">
              <Field label="Название">{event.title}</Field>
              <Field label="Тип">{event.type}</Field>
              <Field label="Категория">{event.category}</Field>
              <Field label="Организатор">{event.organizerName}</Field>
              <Field label="Место проведения">{event.location}</Field>
              <Field label="Число участников">
                {event.participantsCount} {peopleWord(event.participantsCount)}
              </Field>
              <Field label="Даты проведения">
                {new Date(event.startAt).toLocaleDateString('ru-RU')}{' '}
                {new Date(event.startAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' — '}
                {new Date(event.endAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Field>
              <Field label="Цена, без НДС">{formatRub(event.priceWithoutVat)} ₽</Field>
              <Field label="НДС (22%)">{formatRub(event.vat)} ₽</Field>
              <Field label="Итого">{formatRub(event.priceWithVat)} ₽</Field>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">Смета</h4>
            <EventEstimateTable rows={estimateRows} />
            {event.estimateNote && (
              <p className="mt-3 text-sm text-slate-700 sm:text-base md:text-lg">
                <span className="font-semibold text-slate-800">Комментарий:</span>{' '}
                {event.estimateNote}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
