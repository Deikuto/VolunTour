import HeroSection from '../components/HeroSection'
import StatsBar from '../components/StatsBar'
import TargetGroupSection from '../components/TargetGroupSection'
import HowItWorks from '../components/HowItWorks'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

export default function Landing() {
  const { t } = useLang()

  return (
    <main>
      <HeroSection />
      <StatsBar />
      <TargetGroupSection />
      <HowItWorks />

      <section className="py-20 sm:py-28 bg-[#EFFAF6]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0E8C72]/10 rounded-2xl mb-6">
              <Leaf className="w-8 h-8 text-[#0E8C72]" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('final.title1')}{' '}
              <span style={{ color: '#0E8C72' }}>{t('final.title2')}</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{t('final.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0E8C72] text-white rounded-xl font-bold hover:bg-[#0A7A63] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#0E8C72]/30"
              >
                {t('final.cta.events')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/issues"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
              >
                {t('final.cta.issues')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#06372E] text-white/60 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0E8C72] rounded-lg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
              VolOnTour
            </span>
          </div>
          <p className="text-xs text-center">{t('footer.tagline')}</p>
          <div className="flex gap-4 text-xs">
            <Link to="/events" className="hover:text-white transition-colors cursor-pointer">{t('nav.events')}</Link>
            <Link to="/issues" className="hover:text-white transition-colors cursor-pointer">{t('nav.issues')}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
