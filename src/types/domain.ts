export type EventType = 'Конференция' | 'Мастер-класс' | 'Встреча'

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
  /** Организатор / площадка — основная статья сметы */
  organizerName: string
  location: string
  participantsCount: number
  startAt: string
  endAt: string
  priceWithoutVat: number
  vat: number
  priceWithVat: number
  /** Текстовое описание зон/формата (опционально, под сметой) */
  estimateNote?: string
  extraServices: string[]
  imageUrl: string
  participants: Participant[]
}

export interface UserProfile {
  fullName: string
  email: string
  position: string
}
