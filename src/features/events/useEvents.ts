import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { EventEntity } from '../../types/domain'
import { fetchEvents } from './eventsApi'

type EventBucket = 'current' | 'upcoming' | 'reports'

function selectByBucket(events: EventEntity[], bucket: EventBucket) {
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

export function useEvents(bucket: EventBucket) {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  const filtered = useMemo(
    () => selectByBucket(query.data ?? [], bucket),
    [bucket, query.data],
  )

  return { ...query, data: filtered }
}
