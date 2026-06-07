import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, MapPin, Trash2, CheckCircle } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const stats: { icon: typeof Users; value: number; labelKey: TranslationKey; suffix: string }[] = [
  { icon: Users, value: 847, labelKey: 'stats.volunteers', suffix: '+' },
  { icon: MapPin, value: 23, labelKey: 'stats.cities', suffix: '' },
  { icon: Trash2, value: 142, labelKey: 'stats.km', suffix: ' km' },
  { icon: CheckCircle, value: 318, labelKey: 'stats.issues', suffix: '' },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString('bg-BG')}{suffix}</span>
}

export default function StatsBar() {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section ref={ref} className="relative bg-white overflow-hidden">
      {/* faint aqua bloom so the white band still feels alive, not sterile */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-64 opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, #CFF5EC 0%, transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#0E8C72] mb-10"
        >
          {t('stats.eyebrow')}
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
          {stats.map(({ icon: Icon, value, labelKey, suffix }, i) => (
            <motion.div
              key={labelKey}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col items-center text-center px-2 ${
                i > 0 ? 'lg:border-l lg:border-gray-100' : ''
              }`}
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#0E8C72]/8 mb-3">
                <Icon className="w-5 h-5 text-[#0E8C72]" strokeWidth={2} />
              </span>
              <span
                className="text-4xl sm:text-5xl font-bold text-[#0B6F5B] leading-none"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                <CountUp target={value} suffix={suffix} />
              </span>
              <span className="block w-8 h-0.5 rounded-full bg-[#2DD4BF] my-3" />
              <span className="text-sm text-gray-500 font-medium">{t(labelKey)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
