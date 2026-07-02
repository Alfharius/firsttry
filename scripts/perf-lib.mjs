/** Pure functions mirroring client app logic for performance benchmarks. */

export function selectByBucket(events, bucket) {
  const now = new Date()
  const filtered = events.filter((event) => {
    const start = new Date(event.startAt)
    const end = new Date(event.endAt)
    if (bucket === 'current') return start <= now && end >= now
    if (bucket === 'upcoming') return start > now
    return end < now
  })

  if (bucket === 'upcoming') {
    return [...filtered].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )
  }

  return filtered
}

export function paginateItems(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  return {
    pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    totalPages,
    currentPage,
    total: items.length,
  }
}

/** Полный клиентский пайплайн списка мероприятий: bucket → filter → paginate */
export function processEventList(events, bucket, filters, page = 1, pageSize = 10) {
  const bucketed = selectByBucket(events, bucket)
  const filtered = filterEvents(bucketed, filters)
  return paginateItems(filtered, page, pageSize)
}

function toInputDate(value) {
  return new Date(value).toISOString().slice(0, 10)
}

export function filterEvents(events, filters) {
  const q = (filters.q ?? '').toLowerCase()
  return events.filter((event) => {
    const haystack = `${event.title} ${event.category} ${event.location}`.toLowerCase()
    const matchesText = !q || haystack.includes(q)
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
  })
}

function compareEvents(a, b, sortBy) {
  switch (sortBy) {
    case 'title':
    case 'type':
    case 'category':
    case 'organizerName':
    case 'location':
      return String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''), 'ru')
    case 'startAt':
    case 'endAt':
      return new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()
    case 'participantsCount':
    case 'priceWithoutVat':
    case 'vat':
    case 'priceWithVat':
      return a[sortBy] - b[sortBy]
    default:
      return 0
  }
}

export function sortEvents(events, sortBy = 'startAt', ascending = false) {
  const copy = [...events]
  copy.sort((a, b) => compareEvents(a, b, sortBy))
  return ascending ? copy : copy.reverse()
}

export function aggregateByMonth(events, metric = 'priceWithVat') {
  const map = new Map()
  for (const event of events) {
    const d = new Date(event.endAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    let add = 0
    switch (metric) {
      case 'priceWithoutVat':
        add = event.priceWithoutVat
        break
      case 'vat':
        add = event.vat
        break
      case 'priceWithVat':
        add = event.priceWithVat
        break
      case 'eventCount':
        add = 1
        break
      default:
        break
    }
    map.set(key, (map.get(key) ?? 0) + add)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, total]) => ({ monthKey, total }))
}

const TYPES = ['Конференция', 'Мастер-класс', 'Встреча']
const CATEGORIES = ['ИТ', 'HR', 'Дизайн', 'Маркетинг', 'Финансы']
const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Чебоксары', 'Нижний Новгород', 'Екатеринбург', 'Новосибирск', 'Сочи']
const VENUES = ['«Атриум Норд»', '«Белая линия»', '«Кедровый двор»', '«Волга Пойнт»', '«Гранит»', '«Урал Виста»', '«Сибирь Хаб»', '«Приморский арх»']
const LOCATIONS = CITIES.map((city, i) => `${city}, зал ${VENUES[i % VENUES.length]}`)

export function generateEvents(count) {
  const events = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const startOffset = (i % 800) - 400
    const startAt = new Date(now + startOffset * 86_400_000 + (i % 12) * 3_600_000)
    const endAt = new Date(startAt.getTime() + (2 + (i % 8)) * 3_600_000)
    const netto = 50_000 + (i % 100) * 10_000
    const vat = Math.round(netto * 0.22 * 100) / 100
    events.push({
      id: `evt-${i}`,
      title: `Мероприятие ${i}`,
      type: TYPES[i % TYPES.length],
      category: CATEGORIES[i % CATEGORIES.length],
      organizerName: `Организатор ${i}`,
      location: LOCATIONS[i % LOCATIONS.length],
      participantsCount: 10 + (i % 200),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      priceWithoutVat: netto,
      vat,
      priceWithVat: netto + vat,
      extraServices: [],
      imageUrl: '',
      participants: [],
    })
  }
  return events
}

export function bench(fn, iterations = 100) {
  const start = performance.now()
  let last
  for (let i = 0; i < iterations; i++) {
    last = fn()
  }
  const elapsed = performance.now() - start
  return {
    iterations,
    total_ms: Math.round(elapsed * 100) / 100,
    avg_ms: Math.round((elapsed / iterations) * 100) / 100,
    sample_size: Array.isArray(last) ? last.length : undefined,
  }
}
