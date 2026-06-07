import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertTriangle, CheckCircle2, Loader, AlertCircle, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { cityGroupId } from '../lib/cities'
import CityFilter from '../components/CityFilter'
import IssueCard from '../components/IssueCard'
import IssueDetailModal from '../components/IssueDetailModal'
import AddIssueModal from '../components/AddIssueModal'
import type { Issue } from '../types'
import type { TranslationKey } from '../i18n/translations'

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved'

const statusFilterKeys: Record<StatusFilter, TranslationKey> = {
  all: 'issues.filter.all',
  open: 'issues.filter.open',
  in_progress: 'issues.filter.inprogress',
  resolved: 'issues.filter.resolved',
}

export default function Issues() {
  const { issues, selectedCity } = useApp()
  const { currentUser, openAuth } = useAuth()
  const { t } = useLang()
  const [modalOpen, setModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [detailIssue, setDetailIssue] = useState<Issue | null>(null)

  const inGroup = (cityId: string) => !selectedCity || cityGroupId(cityId) === selectedCity

  const filtered = useMemo(() => {
    let list = issues
    if (selectedCity) list = list.filter(i => cityGroupId(i.cityId) === selectedCity)
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter)
    return list
  }, [issues, selectedCity, statusFilter])

  const counts = useMemo(() => ({
    open: issues.filter(i => i.status === 'open' && inGroup(i.cityId)).length,
    in_progress: issues.filter(i => i.status === 'in_progress' && inGroup(i.cityId)).length,
    resolved: issues.filter(i => i.status === 'resolved' && inGroup(i.cityId)).length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [issues, selectedCity])

  // Reporting requires an account.
  const handleAdd = () => {
    if (!currentUser) { openAuth('login'); return }
    setModalOpen(true)
  }

  const AddButton = ({ className }: { className: string }) => (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={handleAdd}
      className={className}
    >
      {currentUser ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      {currentUser ? t('issues.add') : t('issues.login.cta')}
    </motion.button>
  )

  return (
    <div className="min-h-screen bg-[#EFFAF6] pt-16">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#0F766E]" />
                <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">{t('issues.eyebrow')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t('issues.title')}
              </h1>
              <p className="text-gray-500 mt-1.5 text-sm">{t('issues.subtitle')}</p>
            </div>

            <AddButton className="inline-flex items-center gap-2 px-5 py-3 bg-[#0F766E] text-white rounded-xl font-semibold text-sm hover:bg-[#0B5E54] transition-colors cursor-pointer shadow-md shadow-[#0F766E]/30 whitespace-nowrap" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full text-xs font-medium text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />{counts.open} {t('issues.open')}
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium text-amber-600">
              <Loader className="w-3.5 h-3.5" />{counts.in_progress} {t('issues.inprogress')}
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium text-green-600">
              <CheckCircle2 className="w-3.5 h-3.5" />{counts.resolved} {t('issues.resolved')}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <CityFilter accent="amber" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(Object.keys(statusFilterKeys) as StatusFilter[]).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    statusFilter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                  }`}>
                  {t(statusFilterKeys[s])}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('issues.empty.title')}
            </h3>
            <p className="text-gray-400 text-sm mb-6">{t('issues.empty.desc')}</p>
            <AddButton className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F766E] text-white rounded-xl text-sm font-semibold hover:bg-[#0B5E54] transition-colors cursor-pointer" />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map(issue => <IssueCard key={issue.id} issue={issue} onOpen={setDetailIssue} />)}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-[#0E8C72] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{t('issues.banner.title')}</h3>
            <p className="text-white/70 text-sm">{t('issues.banner.desc')}</p>
          </div>
          <button onClick={handleAdd}
            className="flex-shrink-0 px-5 py-2.5 bg-white text-[#0E8C72] rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-2">
            {!currentUser && <Lock className="w-4 h-4" />}
            {currentUser ? `${t('issues.add')} →` : t('issues.login.cta')}
          </button>
        </motion.div>
      </div>

      <IssueDetailModal issue={detailIssue} onClose={() => setDetailIssue(null)} />
      <AddIssueModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
