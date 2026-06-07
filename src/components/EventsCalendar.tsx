import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalIcon, MapPin, Clock } from 'lucide-react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth,
  addMonths, subMonths, parseISO, getDay,
} from 'date-fns'
import { bg, enUS } from 'date-fns/locale'
import type { Event } from '../types'
import { useLang } from '../context/LanguageContext'
import { cityName, eventTitle, eventCause } from '../i18n/localized'
import { CITIES } from '../data/mockData'

interface EventsCalendarProps {
  events: Event[]
  onOpen?: (event: Event) => void
}

const WEEKDAYS_BG = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд']
const WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function EventsCalendar({ events, onOpen }: EventsCalendarProps) {
  const { lang, t } = useLang()
  const locale = lang === 'en' ? enUS : bg
  const [month, setMonth] = useState<Date>(() => {
    // Start on the month of the earliest upcoming event, else today.
    const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date))[0]
    return upcoming ? startOfMonth(parseISO(upcoming.date)) : startOfMonth(new Date())
  })
  const [selected, setSelected] = useState<Date | null>(null)

  const byDay = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const e of events) {
      const key = e.date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return map
  }, [events])

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const grid = eachDayOfInterval({ start, end })
    // Monday-first leading offset
    const lead = (getDay(start) + 6) % 7
    return { grid, lead }
  }, [month])

  const monthEvents = useMemo(
    () =>
      events
        .filter(e => isSameMonth(parseISO(e.date), month))
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [events, month]
  )

  const listed = selected
    ? monthEvents.filter(e => isSameDay(parseISO(e.date), selected))
    : monthEvents

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
      {/* Calendar grid */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 capitalize" style={{ fontFamily: 'Playfair Display, serif' }}>
            {format(month, 'LLLL yyyy', { locale })}
          </h3>
          <div className="flex gap-1">
            <button onClick={() => { setMonth(subMonths(month, 1)); setSelected(null) }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => { setMonth(addMonths(month, 1)); setSelected(null) }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {(lang === 'en' ? WEEKDAYS_EN : WEEKDAYS_BG).map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: days.lead }).map((_, i) => <div key={`lead-${i}`} />)}
          {days.grid.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const dayEvents = byDay.get(key) ?? []
            const has = dayEvents.length > 0
            const isSel = selected && isSameDay(day, selected)
            const isToday = isSameDay(day, new Date())
            return (
              <button
                key={key}
                onClick={() => has && setSelected(isSel ? null : day)}
                disabled={!has}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all ${
                  has ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default text-gray-300'
                }`}
                style={
                  isSel
                    ? { backgroundColor: '#CFF5EC', color: '#0B6F5B', boxShadow: 'inset 0 0 0 2px #2DD4BF' }
                    : has
                      ? { backgroundColor: '#EAFBF5' }
                      : undefined
                }
              >
                <span
                  className={isToday ? 'font-bold' : has ? 'font-semibold' : ''}
                  style={has && !isSel ? { color: '#0B6F5B' } : undefined}
                >
                  {format(day, 'd')}
                </span>
                {has && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: isSel ? '#0E8C72' : '#2DD4BF' }} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event list */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 max-h-[26rem] overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <CalIcon className="w-3.5 h-3.5 text-[#0E8C72]" />
          {selected ? format(selected, 'd MMMM', { locale }) : t('events.calendar.upcoming')}
        </p>
        {listed.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            {selected ? t('events.calendar.none') : t('events.calendar.nonemonth')}
          </p>
        ) : (
          <div className="space-y-2">
            {listed.map(e => {
              const city = CITIES.find(c => c.id === e.cityId)
              let d = e.date
              try { d = format(parseISO(e.date), 'd MMM', { locale }) } catch { /* keep */ }
              return (
                <motion.button
                  key={e.id}
                  whileHover={{ x: 2 }}
                  onClick={() => onOpen?.(e)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-[#0E8C72]/30 hover:bg-[#0E8C72]/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0E8C72]/10 text-[#0E8C72]">
                      {eventCause(e, lang)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">{eventTitle(e, lang)}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" />{d}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>
                    {city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cityName(city, lang)}</span>}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
