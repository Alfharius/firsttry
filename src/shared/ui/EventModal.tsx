import { useMemo } from 'react'
import type { EventEntity } from '../../types/domain'
import { buildEstimateRows } from '../lib/estimate'
import { EventEstimateTable } from './EventEstimateTable'

interface EventModalProps {
  event: EventEntity | null
  onClose: () => void
}

export function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null

  const estimateRows = useMemo(() => buildEstimateRows(event), [event])

  const participantsBySpec = event.participants.reduce<Record<string, number>>(
    (acc, participant) => {
      acc[participant.specialization] = (acc[participant.specialization] ?? 0) + 1
      return acc
    },
    {},
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-semibold text-slate-900">{event.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Закрыть
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700">
            <p>Тип: {event.type}</p>
            <p>Категория: {event.category}</p>
            <p>Организатор: {event.organizerName}</p>
            <p>Место: {event.location}</p>
            <p>Участников: {event.participantsCount}</p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Смета</h4>
          <EventEstimateTable rows={estimateRows} />
          {event.estimateNote && (
            <p className="mt-3 text-sm text-slate-600">Комментарий: {event.estimateNote}</p>
          )}
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold uppercase text-slate-700">
            Участники по специализациям
          </h4>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2">Специализация</th>
                  <th className="px-3 py-2">Количество</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(participantsBySpec).map(([specialization, count]) => (
                  <tr key={specialization} className="border-t border-slate-100">
                    <td className="px-3 py-2">{specialization}</td>
                    <td className="px-3 py-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
