import * as XLSX from 'xlsx'
import type { EventEntity } from '../../types/domain'

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildRows(events: EventEntity[]) {
  return events.map((event) => ({
    Название: event.title,
    Тип: event.type,
    Категория: event.category,
    Организатор: event.organizerName,
    Место: event.location,
    'Дата начала': formatDateTime(event.startAt),
    'Дата окончания': formatDateTime(event.endAt),
    Участников: event.participantsCount,
    'Цена без НДС': event.priceWithoutVat,
    НДС: event.vat,
    'Цена с НДС': event.priceWithVat,
    'Доп. услуги': event.extraServices.join(', '),
  }))
}

function buildTotalsRow(events: EventEntity[]) {
  return {
    Название: 'Итого',
    Тип: '',
    Категория: '',
    Организатор: '',
    Место: '',
    'Дата начала': '',
    'Дата окончания': '',
    Участников: events.reduce((sum, event) => sum + event.participantsCount, 0),
    'Цена без НДС': events.reduce((sum, event) => sum + event.priceWithoutVat, 0),
    НДС: events.reduce((sum, event) => sum + event.vat, 0),
    'Цена с НДС': events.reduce((sum, event) => sum + event.priceWithVat, 0),
    'Доп. услуги': '',
  }
}

function buildFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `otchet-meropriyatiya-${date}.xlsx`
}

export function exportReportsToExcel(events: EventEntity[]) {
  if (events.length === 0) return

  const rows = [...buildRows(events), buildTotalsRow(events)]
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 36 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 28 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 16 },
    { wch: 24 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет')
  XLSX.writeFile(workbook, buildFileName())
}
