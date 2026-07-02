#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  aggregateByMonth,
  bench,
  filterEvents,
  generateEvents,
  paginateItems,
  processEventList,
  selectByBucket,
  sortEvents,
} from './perf-lib.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = process.env.OUT_DIR ?? '/tmp/perf-benchmark'
mkdirSync(OUT_DIR, { recursive: true })

const SIZES = [500, 2000, 5000]
const ITERATIONS = 100

const filters = {
  q: 'мероприятие',
  type: 'Конференция',
  category: 'ИТ',
  location: '',
  dateFrom: '2025-01-01',
  dateTo: '2027-12-31',
}

const results = []

for (const size of SIZES) {
  const events = generateEvents(size)

  results.push({
    test: 'classify_buckets',
    n: size,
    ...bench(() => {
      selectByBucket(events, 'current')
      selectByBucket(events, 'upcoming')
      selectByBucket(events, 'reports')
    }, ITERATIONS),
  })

  results.push({
    test: 'filter_events',
    n: size,
    ...bench(() => filterEvents(events, filters), ITERATIONS),
  })

  results.push({
    test: 'paginate_list',
    n: size,
    ...bench(() => {
      const filtered = filterEvents(selectByBucket(events, 'upcoming'), filters)
      paginateItems(filtered, 3, 10)
    }, ITERATIONS),
  })

  results.push({
    test: 'event_list_pipeline',
    n: size,
    ...bench(() => processEventList(events, 'upcoming', filters, 2, 10), ITERATIONS),
  })

  if (size <= 2000) {
    results.push({
      test: 'sort_reports_table',
      n: size,
      ...bench(() => sortEvents(events, 'priceWithVat', false), ITERATIONS),
    })

    results.push({
      test: 'aggregate_chart',
      n: size,
      ...bench(() => aggregateByMonth(events, 'priceWithVat'), ITERATIONS),
    })
  }
}

const outPath = join(OUT_DIR, 'client-results.json')
writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(`Client benchmark results: ${outPath}`)
for (const row of results) {
  console.log(
    `${row.test}\tN=${row.n}\tavg=${row.avg_ms}ms\ttotal=${row.total_ms}ms (${row.iterations} iter)`,
  )
}
