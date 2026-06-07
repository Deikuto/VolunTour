import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Event, Issue, CreateEventData, CreateIssueData } from '../types'
import { getEvents, saveEvents, getIssues, saveIssues } from '../lib/storage'
import { useAuth } from './AuthContext'

interface AppContextValue {
  selectedCity: string | null
  setSelectedCity: (city: string | null) => void
  events: Event[]
  issues: Issue[]
  isJoined: (eventId: string) => boolean
  joinEvent: (eventId: string) => void
  leaveEvent: (eventId: string) => void
  createEvent: (data: CreateEventData) => void
  addIssue: (data: CreateIssueData) => void
  guideStatus: (eventId: string) => 'none' | 'pending' | 'accepted' | 'declined'
  requestGuide: (eventId: string) => void
  respondGuide: (eventId: string, userId: string, accept: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>(() => getEvents())
  const [issues, setIssues] = useState<Issue[]>(() => getIssues())

  const isJoined = useCallback(
    (eventId: string) => {
      if (!currentUser) return false
      const ev = events.find(e => e.id === eventId)
      return ev?.participants.includes(currentUser.id) ?? false
    },
    [events, currentUser]
  )

  const joinEvent = useCallback((eventId: string) => {
    if (!currentUser) return
    const updated = events.map(e =>
      e.id === eventId && !e.participants.includes(currentUser.id)
        ? { ...e, participants: [...e.participants, currentUser.id] }
        : e
    )
    setEvents(updated)
    saveEvents(updated)
  }, [events, currentUser])

  const leaveEvent = useCallback((eventId: string) => {
    if (!currentUser) return
    const updated = events.map(e =>
      e.id === eventId
        ? { ...e, participants: e.participants.filter(p => p !== currentUser.id) }
        : e
    )
    setEvents(updated)
    saveEvents(updated)
  }, [events, currentUser])

  const createEvent = useCallback((data: CreateEventData) => {
    if (!currentUser) return
    const newEvent: Event = {
      id: `ev-${Date.now()}`,
      ...data,
      leaderId: currentUser.id,
      leaderName: currentUser.name,
      leaderAvatar: currentUser.avatar,
      participants: [currentUser.id],
      guideRequests: [],
      createdAt: new Date().toISOString(),
    }
    const updated = [newEvent, ...events]
    setEvents(updated)
    saveEvents(updated)
  }, [events, currentUser])

  const guideStatus = useCallback(
    (eventId: string): 'none' | 'pending' | 'accepted' | 'declined' => {
      if (!currentUser) return 'none'
      const ev = events.find(e => e.id === eventId)
      const req = ev?.guideRequests?.find(g => g.userId === currentUser.id)
      return req ? req.status : 'none'
    },
    [events, currentUser]
  )

  const requestGuide = useCallback((eventId: string) => {
    if (!currentUser) return
    const updated = events.map(e => {
      if (e.id !== eventId) return e
      if (e.guideRequests.some(g => g.userId === currentUser.id)) return e
      return {
        ...e,
        guideRequests: [
          ...e.guideRequests,
          { userId: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, status: 'pending' as const },
        ],
      }
    })
    setEvents(updated)
    saveEvents(updated)
  }, [events, currentUser])

  const respondGuide = useCallback((eventId: string, userId: string, accept: boolean) => {
    const updated = events.map(e =>
      e.id === eventId
        ? {
            ...e,
            guideRequests: e.guideRequests.map(g =>
              g.userId === userId ? { ...g, status: (accept ? 'accepted' : 'declined') as 'accepted' | 'declined' } : g
            ),
          }
        : e
    )
    setEvents(updated)
    saveEvents(updated)
  }, [events])

  const addIssue = useCallback((data: CreateIssueData) => {
    const newIssue: Issue = {
      id: `is-${Date.now()}`,
      ...data,
      reporterName: currentUser?.name ?? 'Анонимен',
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    const updated = [newIssue, ...issues]
    setIssues(updated)
    saveIssues(updated)
  }, [issues, currentUser])

  return (
    <AppContext.Provider value={{
      selectedCity, setSelectedCity,
      events, issues,
      isJoined,
      joinEvent, leaveEvent,
      createEvent, addIssue,
      guideStatus, requestGuide, respondGuide,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
