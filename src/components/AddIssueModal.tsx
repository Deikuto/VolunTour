import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useLang } from '../context/LanguageContext'
import { cityName } from '../i18n/localized'
import { CITIES } from '../data/mockData'
import { groupById } from '../lib/cities'

interface AddIssueModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddIssueModal({ isOpen, onClose }: AddIssueModalProps) {
  const { addIssue, selectedCity } = useApp()
  const { lang, t } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)
  // selectedCity is a *group* id (e.g. the merged coast) — resolve to a real city.
  const defaultCity = groupById(selectedCity)?.cityIds[0] ?? CITIES[0].id
  const [form, setForm] = useState({
    title: '', description: '', cityId: defaultCity, locationText: '', imageUrl: '', imagePreview: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setForm(prev => ({ ...prev, imageUrl: result, imagePreview: result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    addIssue({
      title: form.title, description: form.description, cityId: form.cityId, locationText: form.locationText,
      imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80',
    })
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
      setForm({ title: '', description: '', cityId: CITIES[0].id, locationText: '', imageUrl: '', imagePreview: '' })
    }, 1200)
  }

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
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{t('aim.title')}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                  className="w-16 h-16 bg-[#0F766E] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <p className="text-lg font-semibold text-gray-900">{t('aim.success.title')}</p>
                <p className="text-gray-500 text-sm mt-1 text-center">{t('aim.success.desc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('aim.field.photo')}</label>
                  {form.imagePreview ? (
                    <div className="relative h-40 rounded-xl overflow-hidden">
                      <img src={form.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '', imagePreview: '' }))}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors cursor-pointer shadow">
                        <X className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#0F766E] hover:bg-amber-50/50 transition-all duration-200 cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-500">{t('aim.field.photo.upload')}</span>
                      <span className="text-xs text-gray-400">{t('aim.field.photo.hint')}</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="is-title">{t('aim.field.title')} *</label>
                  <input id="is-title" required value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder={t('aim.field.title.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="is-desc">{t('aim.field.desc')} *</label>
                  <textarea id="is-desc" required rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder={t('aim.field.desc.ph')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="is-city">{t('aim.field.city')} *</label>
                    <select id="is-city" required value={form.cityId} onChange={e => set('cityId', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all cursor-pointer">
                      {CITIES.map(c => <option key={c.id} value={c.id}>{cityName(c, lang)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="is-loc">{t('aim.field.loc')} *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input id="is-loc" required value={form.locationText} onChange={e => set('locationText', e.target.value)}
                        placeholder={t('aim.field.loc.ph')}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all" />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                  {t('aim.info', { city: cityName(CITIES.find(c => c.id === form.cityId), lang) })}
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 bg-[#0F766E] text-white rounded-xl font-semibold text-sm hover:bg-[#0B5E54] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" /></svg>{t('aim.submitting')}</>
                  ) : t('aim.submit')}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
