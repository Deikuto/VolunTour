import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, AlertTriangle } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

export default function HeroSection() {
  const { t } = useLang()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #06372E 0%, #0E8C72 40%, #0A7A63 70%, #0A3F34 100%)' }}
      />

      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-20 right-10 w-64 h-64 opacity-5">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0 C100 0 200 50 200 100 C200 155 155 200 100 200 C45 200 0 155 0 100 C0 50 100 0 100 0Z" fill="white"/>
        </svg>
      </div>
      <div className="absolute bottom-20 left-10 w-40 h-40 opacity-5 rotate-45">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0 C100 0 200 50 200 100 C200 155 155 200 100 200 C45 200 0 155 0 100 C0 50 100 0 100 0Z" fill="white"/>
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20"
          >
            <Leaf className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-white/90 text-sm font-medium">{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Playfair Display, serif', textWrap: 'balance' }}
          >
            <span className="block">{t('hero.title1')}</span>
            <span className="block">
              <span style={{ color: '#0F766E' }}>{t('hero.title2')}</span>{' '}
              <span className="italic">{t('hero.title3')}</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-[#0E8C72] rounded-xl font-bold text-base hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
            >
              {t('hero.cta.events')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/issues"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#0F766E] text-white rounded-xl font-bold text-base hover:bg-[#0B5E54] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
            >
              <AlertTriangle className="w-4 h-4" />
              {t('hero.cta.issues')}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-4 mt-10"
          >
            <div className="flex -space-x-2">
              {['Marta', 'Ivan', 'Elena', 'Georgi', 'Ana'].map((name, i) => (
                <img
                  key={name}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`}
                  alt={name}
                  className="w-8 h-8 rounded-full border-2 border-[#0E8C72]"
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <p className="text-white/70 text-sm">
              <span className="text-white font-semibold">847+</span> {t('hero.social')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#EFFAF6] to-transparent" />
    </section>
  )
}
