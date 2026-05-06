import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { EventEntity } from '../../types/domain'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'

export interface EventFiltersState {
  q: string
  type: string
  category: string
  location: string
  dateFrom: string
  dateTo: string
}

interface ActiveFilterChip {
  key: keyof EventFiltersState
  label: string
  value: string
}

function toInputDate(value: string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function useEventFilters(events: EventEntity[], scope: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const scoped = (key: keyof EventFiltersState) => `${scope}_${key}`

  const filters: EventFiltersState = {
    q: searchParams.get(scoped('q')) ?? '',
    type: searchParams.get(scoped('type')) ?? '',
    category: searchParams.get(scoped('category')) ?? '',
    location: searchParams.get(scoped('location')) ?? '',
    dateFrom: searchParams.get(scoped('dateFrom')) ?? '',
    dateTo: searchParams.get(scoped('dateTo')) ?? '',
  }
  const debouncedQuery = useDebouncedValue(filters.q, 350)

  const options = useMemo(
    () => ({
      types: Array.from(new Set(events.map((event) => event.type))).sort(),
      categories: Array.from(new Set(events.map((event) => event.category))).sort(),
      locations: Array.from(new Set(events.map((event) => event.location))).sort(),
    }),
    [events],
  )

  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const haystack = `${event.title} ${event.category} ${event.location}`.toLowerCase()
        const matchesText = !debouncedQuery || haystack.includes(debouncedQuery.toLowerCase())
        const matchesType = !filters.type || event.type === filters.type
        const matchesCategory = !filters.category || event.category === filters.category
        const matchesLocation = !filters.location || event.location === filters.location
        const eventDate = toInputDate(event.startAt)
        const matchesFrom = !filters.dateFrom || eventDate >= filters.dateFrom
        const matchesTo = !filters.dateTo || eventDate <= filters.dateTo

        return (
          matchesText &&
          matchesType &&
          matchesCategory &&
          matchesLocation &&
          matchesFrom &&
          matchesTo
        )
      }),
    [debouncedQuery, events, filters],
  )

  function updateFilter(key: keyof EventFiltersState, value: string) {
    const next = new URLSearchParams(searchParams)
    const scopedKey = scoped(key)
    if (value) next.set(scopedKey, value)
    else next.delete(scopedKey)
    setSearchParams(next, { replace: true })
  }

  const activeFilters = useMemo<ActiveFilterChip[]>(
    () =>
      (Object.entries(filters) as Array<[keyof EventFiltersState, string]>)
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => {
          const labels: Record<keyof EventFiltersState, string> = {
            q: 'Поиск',
            type: 'Тип',
            category: 'Категория',
            location: 'Площадка',
            dateFrom: 'От',
            dateTo: 'До',
          }
          return { key, value, label: labels[key] }
        }),
    [filters],
  )

  function clearFilters() {
    const next = new URLSearchParams(searchParams)
    const keys: Array<keyof EventFiltersState> = [
      'q',
      'type',
      'category',
      'location',
      'dateFrom',
      'dateTo',
    ]
    keys.forEach((key) => next.delete(scoped(key)))
    setSearchParams(next, { replace: true })
  }

  return { filters, filtered, options, activeFilters, updateFilter, clearFilters }
}
