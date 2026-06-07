import type { Event, Issue } from '../types'
import { CITIES } from '../data/mockData'

const BG_CENTER: [number, number] = [42.73, 25.48]

// Deterministic small jitter so multiple events in the same city don't fully overlap
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

export function eventCoords(event: Event): [number, number] {
  if (typeof event.lat === 'number' && typeof event.lng === 'number') {
    return [event.lat, event.lng]
  }
  const city = CITIES.find(c => c.id === event.cityId)
  if (!city) return BG_CENTER
  const h = hash(event.id)
  const jLat = (((h % 1000) / 1000) - 0.5) * 0.03
  const jLng = ((((h >> 4) % 1000) / 1000) - 0.5) * 0.03
  return [city.lat + jLat, city.lng + jLng]
}

export function issueCoords(issue: Issue): [number, number] {
  if (typeof issue.lat === 'number' && typeof issue.lng === 'number') {
    return [issue.lat, issue.lng]
  }
  const city = CITIES.find(c => c.id === issue.cityId)
  if (!city) return BG_CENTER
  const h = hash(issue.id)
  const jLat = (((h % 1000) / 1000) - 0.5) * 0.03
  const jLng = ((((h >> 4) % 1000) / 1000) - 0.5) * 0.03
  return [city.lat + jLat, city.lng + jLng]
}

export { BG_CENTER }
