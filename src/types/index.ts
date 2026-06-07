export type Role = 'local_volunteer' | 'tourist'

export type Lang = 'bg' | 'en'

export interface City {
  id: string
  name: string
  nameEn: string
  slug: string
  volunteerCount: number
  region: string
  regionEn: string
  lat: number
  lng: number
}

export interface GuideRequest {
  userId: string
  name: string
  avatar: string
  status: 'pending' | 'accepted' | 'declined'
}

export interface User {
  id: string
  email: string
  password?: string // demo/local-fallback only — real auth handled by Supabase
  name: string
  role: Role
  cityId?: string // required for local_volunteer
  phone?: string
  avatar: string
  createdAt: string
}

export interface Event {
  id: string
  title: string
  titleEn?: string
  cause: string
  causeEn?: string
  description: string
  descriptionEn?: string
  cityId: string
  leaderId: string
  leaderName: string
  leaderAvatar: string
  date: string
  time: string
  maxParticipants: number
  participants: string[]
  imageUrl?: string
  tags: string[]
  guideRequests: GuideRequest[]
  lat?: number
  lng?: number
  createdAt: string
}

export interface Issue {
  id: string
  title: string
  titleEn?: string
  description: string
  descriptionEn?: string
  cityId: string
  reporterName: string
  imageUrl: string
  locationText: string
  locationTextEn?: string
  lat?: number
  lng?: number
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: string
}

export interface CreateEventData {
  title: string
  cause: string
  description: string
  cityId: string
  date: string
  time: string
  maxParticipants: number
  tags: string[]
}

export interface CreateIssueData {
  title: string
  description: string
  cityId: string
  locationText: string
  imageUrl: string
  lat?: number
  lng?: number
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: Role
  cityId?: string
  phone?: string
}
