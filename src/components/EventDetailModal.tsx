import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Users, MapPin, Compass, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { bg, enUS } from 'date-fns/locale'
import { useLang } from '../context/LanguageContext'
import { cityName, eventTitle, eventCause, eventDesc } from '../i18n/localized'
import { CITIES } from '../data/mockData'
import { eventCoords } from '../lib/geo'
import EventActions from './EventActions'
import PointMap from './PointMap'
import type { Event } from '../types'

export default function EventDetailModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const { lang, t } = useLang()

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-xl z-50 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <DetailBody event={event} lang={lang} t={t} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DetailBody({
  event,
  lang,
  t,
  onClose,
}: {
  event: Event
  lang: 'bg' | 'en'
  t: (k: never, v?: Record<string, string | number>) => string
  onClose: () => void
}) {
  const city = CITIES.find(c => c.id === event.cityId)
  const pos = eventCoords(event)
  const acceptedGuides = event.guideRequests.filter(g => g.status === 'accepted')

  let when = `${event.date} · ${event.time}`
  try {
    when = `${format(new Date(event.date), 'EEEE, d MMMM yyyy', { locale: lang === 'en' ? enUS : bg })} · ${event.time}`
  } catch { /* keep raw */ }

  // Casting helper because t's key type is the full union.
  const tr = t as unknown as (k: string, v?: Record<string, string | number>) => string

  return (
    <>
      <div className="sticky top-0 bg-white/95 backdrop-blur rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0E8C72]/10 text-[#0E8C72]">
          {eventCause(event, lang)}
        </span>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {eventTitle(event, lang)}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#0E8C72]" />{when}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<MapPin className="w-4 h-4" />} label={tr('detail.where')} value={cityName(city, lang)} />
          <Stat icon={<Clock className="w-4 h-4" />} label={tr('detail.when')} value={event.time} />
          <Stat icon={<Users className="w-4 h-4" />} label={tr('detail.participants')} value={`${event.participants.length}/${event.maxParticipants}`} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{tr('detail.about')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{eventDesc(event, lang)}</p>
        </div>

        {/* Organizer + guides */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <img src={event.leaderAvatar} alt={event.leaderName} className="w-10 h-10 rounded-full border-2 border-[#0E8C72]/20" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{tr('detail.leader')}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{event.leaderName}</p>
          </div>
          {acceptedGuides.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
              <div className="flex -space-x-1.5">
                {acceptedGuides.map(g => (
                  <img key={g.userId} src={g.avatar} alt={g.name} title={g.name} className="w-6 h-6 rounded-full border border-white" />
                ))}
              </div>
            </div>
          )}
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">#{tag}</span>
            ))}
          </div>
        )}

        {/* Enlarging map */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#0E8C72]" />
            {tr('detail.location')}
          </h3>
          <div className="h-56 rounded-2xl overflow-hidden border border-gray-200">
            <PointMap pos={pos} accent="#0E8C72" />
          </div>
        </div>

        <div className="pt-1">
          <EventActions event={event} />
        </div>
      </div>
    </>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
      <div className="flex items-center justify-center text-[#0E8C72] mb-1">{icon}</div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  )
}
