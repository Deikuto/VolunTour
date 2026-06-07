import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, Plane, ArrowRight, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

export default function TargetGroupSection() {
  const { currentUser, openAuth } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const localFeatures: TranslationKey[] = ['target.local.f1', 'target.local.f2', 'target.local.f3', 'target.local.f4']
  const touristFeatures: TranslationKey[] = ['target.tourist.f1', 'target.tourist.f2', 'target.tourist.f3', 'target.tourist.f4']

  const handleLocal = () => {
    if (currentUser) navigate('/events')
    else openAuth('register', 'local_volunteer')
  }
  const handleTourist = () => {
    if (currentUser) navigate('/events')
    else openAuth('register', 'tourist')
  }

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-[#EFFAF6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-medium text-[#0E8C72] uppercase tracking-widest mb-3">{t('target.eyebrow')}</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('target.title')}
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">{t('target.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Local volunteer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleLocal}
          >
            <div className="w-14 h-14 bg-[#0E8C72]/10 rounded-2xl flex items-center justify-center mb-6">
              <Home className="w-7 h-7 text-[#0E8C72]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{t('target.local.title')}</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">{t('target.local.desc')}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {localFeatures.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-[#0E8C72]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-3 h-3 text-[#0E8C72]" fill="#0E8C72" />
                  </span>
                  {t(f)}
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 bg-[#0E8C72] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0A7A63] transition-colors cursor-pointer">
              {t('target.local.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Tourist */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            onClick={handleTourist}
          >
            <div className="w-14 h-14 bg-[#0F766E]/15 rounded-2xl flex items-center justify-center mb-6">
              <Plane className="w-7 h-7 text-[#0F766E]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{t('target.tourist.title')}</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">{t('target.tourist.desc')}</p>
            <ul className="space-y-3 mb-8 flex-1">
              {touristFeatures.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-[#0F766E]/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-3 h-3 text-[#0F766E]" fill="#0F766E" />
                  </span>
                  {t(f)}
                </li>
              ))}
            </ul>
            <button className="w-full py-3.5 bg-[#0F766E] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0B5E54] transition-colors cursor-pointer">
              {t('target.tourist.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
