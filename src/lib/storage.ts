import type { Event, Issue, User } from '../types'
import { MOCK_EVENTS, MOCK_ISSUES } from '../data/mockData'

const EVENTS_KEY = 'st_events'
const ISSUES_KEY = 'st_issues'
const USERS_KEY = 'st_users'
const CURRENT_USER_KEY = 'st_current_user'

export function getEvents(): Event[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : MOCK_EVENTS
  } catch {
    return MOCK_EVENTS
  }
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function getIssues(): Issue[] {
  try {
    const raw = localStorage.getItem(ISSUES_KEY)
    return raw ? JSON.parse(raw) : MOCK_ISSUES
  } catch {
    return MOCK_ISSUES
  }
}

export function saveIssues(issues: Issue[]): void {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues))
}

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function saveCurrentUserId(id: string | null): void {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id)
  else localStorage.removeItem(CURRENT_USER_KEY)
}
