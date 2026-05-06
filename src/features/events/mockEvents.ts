import type { EventEntity } from '../../types/domain'

export const mockEvents: EventEntity[] = [
  {
    id: 'evt-1',
    title: 'Digital Product Forum',
    type: 'Conference',
    category: 'IT',
    location: 'Almaty Expo Center',
    participantsCount: 240,
    startAt: '2026-05-06T09:00:00.000Z',
    endAt: '2026-05-06T17:00:00.000Z',
    priceWithoutVat: 1200000,
    vat: 144000,
    priceWithVat: 1344000,
    estimate: 'Main stage, branding, 5 speakers, coffee breaks.',
    extraServices: ['Photo report', 'Video shooting'],
    imageUrl:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    participants: [
      { id: 'p-1', fullName: 'Aruzhan Omarova', specialization: 'Speaker' },
      { id: 'p-2', fullName: 'Daniyar Sadykov', specialization: 'Moderator' },
      { id: 'p-3', fullName: 'Aibek Kulbay', specialization: 'Volunteer' },
    ],
  },
  {
    id: 'evt-2',
    title: 'Frontend Hiring Meetup',
    type: 'Meetup',
    category: 'HR',
    location: 'Astana Hub',
    participantsCount: 80,
    startAt: '2026-05-15T14:00:00.000Z',
    endAt: '2026-05-15T18:00:00.000Z',
    priceWithoutVat: 320000,
    vat: 38400,
    priceWithVat: 358400,
    estimate: 'Small stage, networking zone, giveaway.',
    extraServices: ['Live stream'],
    imageUrl:
      'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=1200&q=80',
    participants: [
      { id: 'p-4', fullName: 'Maksat Nurgali', specialization: 'Recruiter' },
      { id: 'p-5', fullName: 'Dana Ismailova', specialization: 'Speaker' },
    ],
  },
  {
    id: 'evt-3',
    title: 'Design Ops Workshop',
    type: 'Workshop',
    category: 'Design',
    location: 'Shymkent Creative Lab',
    participantsCount: 34,
    startAt: '2026-04-21T10:00:00.000Z',
    endAt: '2026-04-21T15:00:00.000Z',
    priceWithoutVat: 210000,
    vat: 25200,
    priceWithVat: 235200,
    estimate: '2 trainers, workshop materials, lunch.',
    extraServices: ['Certificates'],
    imageUrl:
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    participants: [
      { id: 'p-6', fullName: 'Aizada Kerimbayeva', specialization: 'Trainer' },
      { id: 'p-7', fullName: 'Baurzhan Ilyas', specialization: 'Designer' },
    ],
  },
]
