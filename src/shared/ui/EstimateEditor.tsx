import { useMemo } from 'react'
import { buildEstimateRowsFromItems } from '../lib/estimate'
import { roundMoney } from '../lib/vat'
import { EventEstimateTable } from './EventEstimateTable'

export interface EstimateItemDraft {
  id: string
  name: string
  netto: number
  locked?: boolean
}

const inputClassName = 'rounded-lg border border-slate-300 px-3 py-2'

// eslint-disable-next-line react-refresh/only-export-components
export function createDefaultEstimateItems(): EstimateItemDraft[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Организация мероприятия',
      netto: 0,
      locked: true,
    },
  ]
}

interface EstimateEditorProps {
  items: EstimateItemDraft[]
  onChange: (items: EstimateItemDraft[]) => void
}

export function EstimateEditor({ items, onChange }: EstimateEditorProps) {
  const rows = useMemo(
    () =>
      buildEstimateRowsFromItems(
        items.map((item) => ({
          name: item.name.trim() || '—',
          netto: item.netto,
        })),
      ),
    [items],
  )

  function updateItem(id: string, patch: Partial<EstimateItemDraft>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addItem() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name: '',
        netto: 0,
      },
    ])
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function parseNetto(value: string) {
    if (value === '') return 0
    const parsed = Number.parseFloat(value.replace(',', '.'))
    return Number.isNaN(parsed) ? 0 : roundMoney(Math.max(0, parsed))
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">Смета</span>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
          onClick={addItem}
        >
          + Добавить позицию
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="grid gap-2 sm:grid-cols-[1fr_160px_auto] sm:items-center">
            <input
              className={inputClassName}
              placeholder="Название позиции"
              value={item.name}
              readOnly={item.locked}
              disabled={item.locked}
              onChange={(event) => updateItem(item.id, { name: event.target.value })}
            />
            <input
              type="number"
              min={0}
              step={0.01}
              className={inputClassName}
              placeholder="0,00"
              value={Number.isNaN(item.netto) ? '' : item.netto}
              onChange={(event) => updateItem(item.id, { netto: parseNetto(event.target.value) })}
            />
            {item.locked ? (
              <span className="hidden text-xs text-slate-400 sm:block">Обязательная</span>
            ) : (
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-rose-600"
                onClick={() => removeItem(item.id)}
              >
                Удалить
              </button>
            )}
          </div>
        ))}
      </div>

      <EventEstimateTable rows={rows} compact />
    </div>
  )
}
