import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, AlertCircle, CheckCircle2, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { bg, enUS } from 'date-fns/locale'
import { useLang } from '../context/LanguageContext'
import { cityName, issueTitle, issueDesc, issueLoc } from '../i18n/localized'
import { CITIES } from '../data/mockData'
import { issueCoords } from '../lib/geo'
import PointMap from './PointMap'
import type { Issue } from '../types'

const statusConfig = {
  open: { icon: AlertCircle, bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  in_progress: { icon: Loader, bg: '#FFF7ED', text: '#D97706', border: '#FDE68A' },
  resolved: { icon: CheckCircle2, bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

export default function IssueDetailModal({ issue, onClose }: { issue: Issue | null; onClose: () => void }) {
  const { lang, t } = useLang()
  const tr = t as unknown as (k: string, v?: Record<string, string | number>) => string

  return (
    <AnimatePresence>
      {issue && (() => {
        const city = CITIES.find(c => c.id === issue.cityId)
        const status = statusConfig[issue.status]
        const StatusIcon = status.icon
        const pos = issueCoords(issue)
        let timeAgo = ''
        try {
          timeAgo = formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: lang === 'en' ? enUS : bg })
        } catch { /* keep empty */ }

        return (
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
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img src={issue.imageUrl} alt={issueTitle(issue, lang)} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors cursor-pointer shadow">
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
                  <StatusIcon className="w-3 h-3" />
                  {tr(`issue.status.${issue.status}`)}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <h2 className="text-2xl font-bold text-gray-900 leading-snug" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {issueTitle(issue, lang)}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed">{issueDesc(issue, lang)}</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{tr('issue.detail.location')}</p>
                    <p className="text-sm font-medium text-gray-800 flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-[#0F766E] mt-0.5 flex-shrink-0" />
                      <span>{cityName(city, lang)} · {issueLoc(issue, lang)}</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{tr('issue.detail.reportedby')}</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {issue.reporterName} · {timeAgo}
                    </p>
                  </div>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden border border-gray-200">
                  <PointMap pos={pos} accent="#0F766E" />
                </div>
              </div>
            </motion.div>
          </>
        )
      })()}
    </AnimatePresence>
  )
}
