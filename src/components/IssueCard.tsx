import { motion } from 'framer-motion'
import { MapPin, Clock, AlertCircle, CheckCircle2, Loader, ChevronRight } from 'lucide-react'
import { CITIES } from '../data/mockData'
import { useLang } from '../context/LanguageContext'
import { cityName, issueTitle, issueDesc, issueLoc } from '../i18n/localized'
import type { Issue } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { bg, enUS } from 'date-fns/locale'

interface IssueCardProps {
  issue: Issue
  onOpen?: (issue: Issue) => void
}

const statusConfig = {
  open: { icon: AlertCircle, bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  in_progress: { icon: Loader, bg: '#FFF7ED', text: '#D97706', border: '#FDE68A' },
  resolved: { icon: CheckCircle2, bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

export default function IssueCard({ issue, onOpen }: IssueCardProps) {
  const { lang, t } = useLang()
  const city = CITIES.find(c => c.id === issue.cityId)
  const status = statusConfig[issue.status]
  const StatusIcon = status.icon

  let timeAgo = ''
  try {
    timeAgo = formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: lang === 'en' ? enUS : bg })
  } catch { /* keep empty */ }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.25 }}
      onClick={() => onOpen?.(issue)}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={issue.imageUrl} alt={issueTitle(issue, lang)} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
          style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}>
          <StatusIcon className="w-3 h-3" />
          {t(`issue.status.${issue.status}`)}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-base leading-snug" style={{ fontFamily: 'Playfair Display, serif' }}>
            {issueTitle(issue, lang)}
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{issueDesc(issue, lang)}</p>

        <div className="flex flex-col gap-2">
          {city && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-[#0E8C72] flex-shrink-0" />
              <span className="truncate">{cityName(city, lang)} · {issueLoc(issue, lang)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t('issues.reported', { time: timeAgo })} {issue.reporterName}</span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
