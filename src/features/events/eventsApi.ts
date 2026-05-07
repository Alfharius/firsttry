import { hasSupabaseConfig, supabase } from '../../lib/supabase'
import type { EventEntity, EventType, Participant } from '../../types/domain'
import { mockEvents } from './mockEvents'

interface EventRow {
  id: string
  title: string
  type: string
  category: string
  location: string
  participants_count: number
  start_at: string
  end_at: string
  price_without_vat: number
  vat: number
  price_with_vat: number
  estimate: string
  extra_services: string[] | null
  image_url: string | null
  event_participants: { participant: ParticipantRow[] | null }[]
}

interface ParticipantRow {
  id: string
  full_name: string
  specialization: string
}

function toEventType(type: string): EventType {
  if (type === 'Конференция' || type === 'Conference') return 'Конференция'
  if (type === 'Мастер-класс' || type === 'Workshop') return 'Мастер-класс'
  if (type === 'Встреча' || type === 'Meetup') return 'Встреча'
  return 'Встреча'
}

function mapParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    fullName: row.full_name,
    specialization: row.specialization,
  }
}

function mapEvent(row: EventRow): EventEntity {
  const participants = (row.event_participants ?? [])
    .flatMap((item) => item.participant ?? [])
    .map(mapParticipant)

  return {
    id: row.id,
    title: row.title,
    type: toEventType(row.type),
    category: row.category,
    location: row.location,
    participantsCount: row.participants_count,
    startAt: row.start_at,
    endAt: row.end_at,
    priceWithoutVat: row.price_without_vat,
    vat: row.vat,
    priceWithVat: row.price_with_vat,
    estimate: row.estimate,
    extraServices: row.extra_services ?? [],
    imageUrl:
      row.image_url ??
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    participants,
  }
}

export async function fetchEvents() {
  if (!hasSupabaseConfig || !supabase) return mockEvents

  const { data, error } = await supabase
    .from('events')
    .select(
      `
        id,
        title,
        type,
        category,
        location,
        participants_count,
        start_at,
        end_at,
        price_without_vat,
        vat,
        price_with_vat,
        estimate,
        extra_services,
        image_url,
        event_participants(participant:participants(id, full_name, specialization))
      `,
    )
    .order('start_at', { ascending: false })

  if (error) {
    throw new Error(`Не удалось загрузить события: ${error.message}`)
  }

  return (data as EventRow[]).map(mapEvent)
}
