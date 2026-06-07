import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, MapPin, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { cityName } from '../i18n/localized'
import { CITIES } from '../data/mockData'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const { createEvent } = useApp()
  const { currentUser } = useAuth()
  const { lang, t } = useLang()

  // A volunteer can only create events for their own city
  const lockedCity = currentUser?.cityId ? CITIES.find(c => c.id === currentUser.cityId) : null

  const [form, setForm] = useState({
    title: '', cause: '', description: '', date: '', time: '09:00', maxParticipants: 15, tagsInput: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lockedCity) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    const tags = form.tagsInput.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    createEvent({
      title: form.title,
      cause: form.cause,
      description: form.description,
      cityId: lockedCity.id,
      date: form.date,
      time: form.time,
      maxParticipants: Number(form.maxParticipants),
      tags: tags.length ? tags : ['доброволчество'],
    })
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
      setForm({ title: '', cause: '', description: '', date: '', time: '09:00', maxParticipants: 15, tagsInput: '' })
    }, 1200)
  }

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{t('cem.title')}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                  className="w-16 h-16 bg-[#0E8C72] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <p className="text-lg font-semibold text-gray-900">{t('cem.success.title')}</p>
                <p className="text-gray-500 text-sm mt-1">{t('cem.success.desc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-title">{t('cem.field.title')} *</label>
                  <input id="ev-title" required value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder={t('cem.field.title.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-cause">{t('cem.field.cause')} *</label>
                  <input id="ev-cause" required value={form.cause} onChange={e => set('cause', e.target.value)}
                    placeholder={t('cem.field.cause.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all" />
                </div>

                {/* Locked city */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('cem.field.city')}</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                    <MapPin className="w-4 h-4 text-[#0E8C72]" />
                    <span className="text-sm font-semibold text-gray-800">{cityName(lockedCity ?? undefined, lang)}</span>
                    <Lock className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('cem.field.citylocked')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-desc">{t('cem.field.desc')} *</label>
                  <textarea id="ev-desc" required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder={t('cem.field.desc.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-date">{t('cem.field.date')} *</label>
                    <input id="ev-date" type="date" required min={minDate} value={form.date} onChange={e => set('date', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-time">{t('cem.field.time')} *</label>
                    <input id="ev-time" type="time" required value={form.time} onChange={e => set('time', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-max">
                    {t('cem.field.max')} <span className="text-[#0E8C72] font-semibold">{form.maxParticipants}</span>
                  </label>
                  <input id="ev-max" type="range" min={5} max={50} step={5} value={form.maxParticipants}
                    onChange={e => set('maxParticipants', parseInt(e.target.value))} className="w-full accent-[#0E8C72] cursor-pointer" />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>5</span><span>50</span></div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ev-tags">
                    {t('cem.field.tags')} <span className="text-gray-400 font-normal">{t('cem.field.tags.hint')}</span>
                  </label>
                  <input id="ev-tags" value={form.tagsInput} onChange={e => set('tagsInput', e.target.value)}
                    placeholder={t('cem.field.tags.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-[#0E8C72] text-white rounded-xl font-semibold text-sm hover:bg-[#0A7A63] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>{t('cem.submitting')}</>
                  ) : (
                    <><Plus className="w-4 h-4" />{t('cem.submit')}</>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
