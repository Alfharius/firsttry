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
    <div className="grid gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-baseline sm:gap-4">
      <span className="text-lg font-semibold text-slate-800">{label}</span>
      <div className="text-lg text-slate-800">{children}</div>
    </div>
  )
}

export function EventModal({ event, onClose }: EventModalProps) {
  const estimateRows = useMemo(() => (event ? buildEstimateRows(event) : []), [event])

  if (!event) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-900">Детали мероприятия</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-base text-slate-600 hover:bg-slate-100"
          >
            Закрыть
          </button>
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-48 w-full shrink-0 rounded-lg bg-slate-200 object-cover md:h-56 md:w-72"
          />

          <div className="flex-1 space-y-3">
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
          <h4 className="mb-3 text-lg font-semibold text-slate-900">Смета</h4>
          <EventEstimateTable rows={estimateRows} />
          {event.estimateNote && (
            <p className="mt-3 text-lg text-slate-700">
              <span className="font-semibold text-slate-800">Комментарий:</span> {event.estimateNote}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
