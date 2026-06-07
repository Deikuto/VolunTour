import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, UserPlus, Heart, Megaphone, Users, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const touristSteps: { icon: typeof Search; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Search, titleKey: 'how.tourist.s1.title', descKey: 'how.tourist.s1.desc' },
  { icon: UserPlus, titleKey: 'how.tourist.s2.title', descKey: 'how.tourist.s2.desc' },
  { icon: Heart, titleKey: 'how.tourist.s3.title', descKey: 'how.tourist.s3.desc' },
]

const localSteps: { icon: typeof Search; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Megaphone, titleKey: 'how.local.s1.title', descKey: 'how.local.s1.desc' },
  { icon: Users, titleKey: 'how.local.s2.title', descKey: 'how.local.s2.desc' },
  { icon: Trophy, titleKey: 'how.local.s3.title', descKey: 'how.local.s3.desc' },
]

export default function HowItWorks() {
  const { currentUser } = useAuth()
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const isVolunteer = currentUser?.role === 'local_volunteer'
  const steps = isVolunteer ? localSteps : touristSteps

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-medium text-[#0E8C72] uppercase tracking-widest mb-3">{t('how.eyebrow')}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('how.title1')}{' '}
            <span className="italic" style={{ color: '#0E8C72' }}>{t('how.title2')}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-3">
            {t('how.shownfor')}{' '}
            <strong className="text-gray-600">
              {isVolunteer ? t('nav.role.volunteer') : t('nav.role.tourist')}
            </strong>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, titleKey, descKey }, i) => (
            <motion.div
              key={titleKey}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 w-full h-px bg-gray-200" style={{ left: '75%' }} />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#0E8C72]/8 rounded-2xl flex items-center justify-center mb-5 relative">
                  <Icon className="w-7 h-7 text-[#0E8C72]" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#0E8C72] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{t(titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
