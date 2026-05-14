import type { EventEntity } from '../../types/domain'

export interface EstimateRow {
  name: string
  netto: number
  vat: number
  withVat: number
}

/** Целочисленное распределение total по весам weights (сумма результатов = total). */
function splitInt(total: number, weights: number[]): number[] {
  if (weights.length === 0) return []
  const sumW = weights.reduce((a, b) => a + b, 0)
  if (sumW <= 0) return weights.map(() => 0)
  const parts = weights.map((w) => Math.floor((total * w) / sumW))
  let diff = total - parts.reduce((a, b) => a + b, 0)
  let idx = 0
  while (diff > 0) {
    parts[idx % parts.length]++
    diff--
    idx++
  }
  return parts
}

/**
 * Смета: основная статья — организация мероприятия; остальные строки — доп. услуги.
 * Итоги по столбцам совпадают с priceWithoutVat, vat, priceWithVat на карточке.
 */
export function buildEstimateRows(
  event: Pick<EventEntity, 'priceWithoutVat' | 'vat' | 'priceWithVat' | 'organizerName' | 'extraServices'>,
): EstimateRow[] {
  const { priceWithoutVat: Tn, vat: Tv, organizerName, extraServices } = event
  const k = extraServices.length

  if (k === 0) {
    return [
      {
        name: `Организация мероприятия: ${organizerName}`,
        netto: Tn,
        vat: Tv,
        withVat: Tn + Tv,
      },
    ]
  }

  // Организация ~60%, каждая услуга — равная доля от оставшихся 40%
  const orgWeight = 0.6
  const perServiceWeight = 0.4 / k
  const weights = [orgWeight, ...Array(k).fill(perServiceWeight)]

  const nettos = splitInt(Tn, weights)
  const vats = splitInt(Tv, weights)

  const rows: EstimateRow[] = []
  rows.push({
    name: `Организация мероприятия: ${organizerName}`,
    netto: nettos[0],
    vat: vats[0],
    withVat: nettos[0] + vats[0],
  })
  for (let i = 0; i < k; i++) {
    rows.push({
      name: extraServices[i],
      netto: nettos[i + 1],
      vat: vats[i + 1],
      withVat: nettos[i + 1] + vats[i + 1],
    })
  }
  return rows
}

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
