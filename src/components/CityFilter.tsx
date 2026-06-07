import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronDown, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { groupById, groupLabel, groupsByRegion } from '../lib/cities'

interface CityFilterProps {
  accent?: 'green' | 'amber'
}

export default function CityFilter({ accent = 'green' }: CityFilterProps) {
  const { selectedCity, setSelectedCity } = useApp()
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeColor = accent === 'green' ? '#0E8C72' : '#0F766E'
  const selected = groupById(selectedCity)
  const regions = groupsByRegion(lang)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const choose = (id: string | null) => {
    setSelectedCity(id)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block w-full sm:w-auto">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-sm font-semibold transition-all cursor-pointer hover:border-gray-300"
        style={{
          borderColor: selectedCity ? activeColor : '#E5E7EB',
          color: selectedCity ? activeColor : '#374151',
          boxShadow: selectedCity ? `0 1px 0 ${activeColor}15` : 'none',
        }}
      >
        <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: activeColor }} />
        <span className="truncate">{selected ? groupLabel(selected, lang) : t('events.filter.all')}</span>
        {selectedCity && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); choose(null) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); choose(null) } }}
            className="ml-1 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''} ${selectedCity ? '' : 'ml-1'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full sm:w-72 max-h-80 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-2"
          >
            <button
              onClick={() => choose(null)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {t('events.filter.all')}
              {!selectedCity && <Check className="w-4 h-4" style={{ color: activeColor }} />}
            </button>

            {regions.map(({ region, groups }) => (
              <div key={region} className="mt-1">
                <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {region}
                </p>
                {groups.map(g => {
                  const active = selectedCity === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => choose(g.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer hover:bg-gray-50"
                      style={active ? { color: activeColor, fontWeight: 600 } : { color: '#374151' }}
                    >
                      {groupLabel(g, lang)}
                      {active && <Check className="w-4 h-4" style={{ color: activeColor }} />}
                    </button>
                  )
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
