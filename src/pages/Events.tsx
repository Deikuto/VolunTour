import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, Users, Sparkles, Home, Search, X, Map as MapIcon, CalendarDays } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { cityName, eventTitle, eventCause } from '../i18n/localized'
import { cityGroupId, groupById, groupLabel } from '../lib/cities'
import CityFilter from '../components/CityFilter'
import EventCard from '../components/EventCard'
import EventsMap from '../components/EventsMap'
import EventsCalendar from '../components/EventsCalendar'
import EventDetailModal from '../components/EventDetailModal'
import CreateEventModal from '../components/CreateEventModal'
import { CITIES } from '../data/mockData'
import type { Event } from '../types'

export default function Events() {
  const { events, selectedCity } = useApp()
  const { currentUser, openAuth } = useAuth()
  const { lang, t } = useLang()
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'map' | 'calendar'>('map')
  const [detailEvent, setDetailEvent] = useState<Event | null>(null)

  const isVolunteer = currentUser?.role === 'local_volunteer'
  const volunteerCity = currentUser?.cityId ? CITIES.find(c => c.id === currentUser.cityId) : null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(e => {
      if (selectedCity && cityGroupId(e.cityId) !== selectedCity) return false
      if (q) {
        const inTitle = eventTitle(e, lang).toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
        const inTags = e.tags.some(tag => tag.toLowerCase().includes(q))
        const inCause = eventCause(e, lang).toLowerCase().includes(q) || e.cause.toLowerCase().includes(q)
        if (!inTitle && !inTags && !inCause) return false
      }
      return true
    })
  }, [events, selectedCity, query, lang])

  const selGroup = selectedCity ? groupById(selectedCity) : null
  const selGroupVolunteers = selGroup
    ? selGroup.cityIds.reduce((sum, id) => sum + (CITIES.find(c => c.id === id)?.volunteerCount ?? 0), 0)
    : 0

  const handleCreate = () => {
    if (!currentUser) { openAuth('register', 'local_volunteer'); return }
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#EFFAF6] pt-16">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-[#0E8C72]" />
                <span className="text-sm font-medium text-[#0E8C72] uppercase tracking-wide">{t('events.eyebrow')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selGroup ? `${t('events.title.city')} ${groupLabel(selGroup, lang)}` : t('events.title.all')}
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm">
                {filtered.length} {filtered.length === 1 ? t('events.count.one') : t('events.count.many')} • {t('events.subtitle')}
              </p>
            </div>

            {isVolunteer && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#0E8C72] text-white rounded-xl font-semibold text-sm hover:bg-[#0A7A63] transition-colors cursor-pointer shadow-md shadow-[#0E8C72]/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {t('events.create')}
              </motion.button>
            )}
          </div>

          {isVolunteer ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 p-3 bg-[#0E8C72]/8 border border-[#0E8C72]/15 rounded-xl text-sm text-[#0E8C72]"
            >
              <Home className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{t('events.volunteer.note', { city: cityName(volunteerCity ?? undefined, lang) })}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800"
            >
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
              <span>{t('events.tourist.note')}</span>
            </motion.div>
          )}

          {/* Search + filter */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('events.search.ph')}
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all"
              />
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <CityFilter accent="green" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View toggle + visualization */}
        {filtered.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                {view === 'map' ? t('events.map.title') : t('events.calendar.upcoming')}{' '}
                · <span className="text-[#0E8C72]">{filtered.length} {t('events.map.events_here')}</span>
              </h2>
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                <ToggleBtn active={view === 'map'} onClick={() => setView('map')} icon={<MapIcon className="w-3.5 h-3.5" />} label={t('events.view.map')} />
                <ToggleBtn active={view === 'calendar'} onClick={() => setView('calendar')} icon={<CalendarDays className="w-3.5 h-3.5" />} label={t('events.view.calendar')} />
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {view === 'map'
                  ? <EventsMap events={filtered} onOpen={setDetailEvent} />
                  : <EventsCalendar events={filtered} onOpen={setDetailEvent} />}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('events.empty.title')}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {isVolunteer ? t('events.empty.volunteer') : t('events.empty.tourist')}
            </p>
            {(query || selectedCity) && (
              <button onClick={() => { setQuery('') }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-[#0E8C72] cursor-pointer">
                <X className="w-4 h-4" /> {t('events.clearfilters')}
              </button>
            )}
            {isVolunteer && !query && (
              <button onClick={handleCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E8C72] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A63] transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                {t('events.empty.cta')}
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {selGroup && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-[#0E8C72]/8 px-4 py-2 rounded-full text-sm">
                  <Users className="w-4 h-4 text-[#0E8C72]" />
                  <span className="font-semibold text-[#0E8C72]">{selGroupVolunteers}</span>
                  <span className="text-gray-600">{t('events.city.volunteers')} {groupLabel(selGroup, lang)}</span>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map(event => (
                  <EventCard key={event.id} event={event} onOpen={setDetailEvent} onTagClick={setQuery} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
      <CreateEventModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}

function ToggleBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        active ? 'bg-white text-[#0E8C72] shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}{label}
    </button>
  )
}
