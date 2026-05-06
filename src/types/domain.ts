export type EventType = 'Conference' | 'Workshop' | 'Meetup'

export interface Participant {
  id: string
  fullName: string
  specialization: string
}

export interface EventEntity {
  id: string
  title: string
  type: EventType
  category: string
  location: string
  participantsCount: number
  startAt: string
  endAt: string
  priceWithoutVat: number
  vat: number
  priceWithVat: number
  estimate: string
  extraServices: string[]
  imageUrl: string
  participants: Participant[]
}

export interface UserProfile {
  fullName: string
  email: string
  position: string
}
