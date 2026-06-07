import { motion } from 'framer-motion'
import { Calendar, Clock, Users, MapPin, ChevronRight, Compass } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { cityName, eventTitle, eventCause, eventDesc } from '../i18n/localized'
import { CITIES } from '../data/mockData'
import { getCauseColor } from '../lib/causeColors'
import EventActions from './EventActions'
import type { Event } from '../types'
import { format } from 'date-fns'
import { bg, enUS } from 'date-fns/locale'

interface EventCardProps {
  event: Event
  onOpen?: (event: Event) => void
  onTagClick?: (tag: string) => void
}

export default function EventCard({ event, onOpen, onTagClick }: EventCardProps) {
  const { lang, t } = useLang()

  const spotsLeft = event.maxParticipants - event.participants.length
  const fillPercent = Math.min((event.participants.length / event.maxParticipants) * 100, 100)
  const city = CITIES.find(c => c.id === event.cityId)
  const causeColor = getCauseColor(`${event.cause} ${event.causeEn ?? ''} ${event.tags.join(' ')}`)
  const acceptedGuides = event.guideRequests.filter(g => g.status === 'accepted')

  let formattedDate = event.date
  try {
    formattedDate = format(new Date(event.date), 'd MMM', { locale: lang === 'en' ? enUS : bg })
  } catch { /* keep raw */ }

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -4, boxShadow: '0 14px 34px rgba(14,140,114,0.16)' }}
      transition={{ duration: 0.22 }}
      onClick={() => onOpen?.(event)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col cursor-pointer overflow-hidden"
    >
      {/* Accent rail */}
      <div className="h-1.5" style={{ backgroundColor: causeColor.text }} />

      <div className="p-5 flex flex-col flex-1">
        {/* What (cause) + spots */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: causeColor.bg, color: causeColor.text }}>
            {eventCause(event, lang)}
          </span>
          {spotsLeft <= 3 && spotsLeft > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
              {t('card.onlyspots', { n: spotsLeft })}
            </span>
          )}
          {spotsLeft === 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-white">{t('card.filled')}</span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-[#0E8C72] group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 leading-snug" style={{ fontFamily: 'Playfair Display, serif' }}>
          {eventTitle(event, lang)}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-1">{eventDesc(event, lang)}</p>

        {/* When / Where / Who */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-[#0E8C72] flex-shrink-0" />
            <span>{formattedDate}</span>
            <Clock className="w-3.5 h-3.5 text-gray-400 ml-1 flex-shrink-0" />
            <span className="text-gray-500">{event.time}</span>
          </div>
          {city && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-[#0E8C72] flex-shrink-0" />
              <span>{cityName(city, lang)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <img src={event.leaderAvatar} alt={event.leaderName} className="w-5 h-5 rounded-full border border-[#0E8C72]/20" />
            <span className="truncate">{event.leaderName}</span>
            {acceptedGuides.length > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 text-xs text-[#0B6F5B]">
                <Compass className="w-3.5 h-3.5" />{acceptedGuides.length}
              </span>
            )}
          </div>
        </div>

        {/* Fill bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{event.participants.length}/{event.maxParticipants}</span>
            <span>{spotsLeft > 0 ? `${spotsLeft} ${t('card.spotsleft')}` : t('card.full')}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ backgroundColor: fillPercent >= 90 ? '#ef4444' : '#0E8C72' }}
              initial={{ width: 0 }} animate={{ width: `${fillPercent}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4" onClick={stop}>
            {event.tags.slice(0, 3).map(tag => (
              <button key={tag} onClick={() => onTagClick?.(tag)}
                className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs hover:bg-[#0E8C72]/10 hover:text-[#0E8C72] transition-colors cursor-pointer">
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions (don't bubble to card click) */}
        <div className="mt-auto" onClick={stop}>
          <EventActions event={event} />
        </div>
      </div>
    </motion.article>
  )
}
