import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, UserIcon, Phone, Home, Plane, MapPin, Check, MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { cityName } from '../i18n/localized'
import { CITIES } from '../data/mockData'
import Turnstile from './Turnstile'
import { TURNSTILE_SITE_KEY } from '../lib/supabase'
import type { Role } from '../types'

/** Bulgarian mobile number: +3598XXXXXXXX or 08[7-9]XXXXXXX. */
function isValidBgPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s-]/g, '')
  return /^(\+359|0)8[7-9]\d{7}$/.test(cleaned)
}

export default function AuthModal() {
  const { register, login, remoteAuth, authModal, closeAuth } = useAuth()
  const { lang, t } = useLang()
  const isOpen = authModal.open
  const [mode, setMode] = useState<'login' | 'register'>(authModal.mode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('tourist')
  const [cityId, setCityId] = useState<string>(CITIES[0].id)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setMode(authModal.mode)
      if (authModal.presetRole) setRole(authModal.presetRole)
      setError(null)
      setEmailSent(false)
    }
  }, [isOpen, authModal.mode, authModal.presetRole])

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('')
    setRole('tourist'); setCityId(CITIES[0].id); setCaptchaToken(null)
  }

  const handleToken = useCallback((token: string | null) => setCaptchaToken(token), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register') {
      if (!isValidBgPhone(phone)) { setError('badphone'); return }
      if (TURNSTILE_SITE_KEY && !captchaToken) { setError('captcha'); return }
    }

    setSubmitting(true)
    if (mode === 'login') {
      const res = await login(email, password, captchaToken ?? undefined)
      if (!res.ok) { setError(res.error ?? 'notfound'); setSubmitting(false); return }
    } else {
      const res = await register(
        { email, password, name, role, cityId: role === 'local_volunteer' ? cityId : undefined, phone },
        captchaToken ?? undefined
      )
      if (!res.ok) { setError(res.error ?? 'exists'); setSubmitting(false); return }
      if (res.needsEmailConfirm) { setSubmitting(false); setEmailSent(true); return }
    }
    setSubmitting(false)
    closeAuth()
    resetForm()
  }

  const inputClass = 'w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAuth}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                {emailSent ? t('auth.verify.title') : mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
              </h2>
              <button onClick={closeAuth} className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {emailSent ? (
              <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350 }}
                  className="w-16 h-16 bg-[#0E8C72]/10 rounded-2xl flex items-center justify-center mb-5"
                >
                  <MailCheck className="w-8 h-8 text-[#0E8C72]" />
                </motion.div>
                <p className="text-lg font-semibold text-gray-900 mb-1">{t('auth.verify.heading')}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-2">
                  {t('auth.verify.desc')} <span className="font-semibold text-gray-700">{email}</span>
                </p>
                <p className="text-gray-400 text-xs mb-6">{t('auth.verify.hint')}</p>
                <button
                  onClick={() => { setEmailSent(false); setMode('login') }}
                  className="px-5 py-2.5 bg-[#0E8C72] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A63] transition-colors cursor-pointer"
                >
                  {t('auth.verify.gotologin')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="au-name">{t('auth.name')}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input id="au-name" required value={name} onChange={e => setName(e.target.value)}
                        placeholder={t('auth.name.ph')} className={inputClass} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="au-email">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="au-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t('auth.email.ph')} className={inputClass} />
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="au-phone">{t('auth.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input id="au-phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder={t('auth.phone.ph')} className={inputClass} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{t('auth.phone.hint')}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="au-pass">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input id="au-pass" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder={t('auth.password.ph')} className={inputClass} />
                  </div>
                </div>

                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.role.q')}</label>
                      <div className="grid grid-cols-1 gap-2">
                        <RoleOption active={role === 'tourist'} onClick={() => setRole('tourist')}
                          icon={<Plane className="w-5 h-5" />} title={t('auth.role.tourist')} desc={t('auth.role.tourist.desc')} accent="#0F766E" />
                        <RoleOption active={role === 'local_volunteer'} onClick={() => setRole('local_volunteer')}
                          icon={<Home className="w-5 h-5" />} title={t('auth.role.volunteer')} desc={t('auth.role.volunteer.desc')} accent="#0E8C72" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {role === 'local_volunteer' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="au-city">{t('auth.city.q')}</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0E8C72] z-10" />
                            <select id="au-city" value={cityId} onChange={e => setCityId(e.target.value)}
                              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E8C72]/20 focus:border-[#0E8C72] transition-all">
                              {CITIES.map(c => <option key={c.id} value={c.id}>{cityName(c, lang)}</option>)}
                            </select>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{t('auth.city.hint')}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {TURNSTILE_SITE_KEY && (
                      <div className="pt-1">
                        <Turnstile onToken={handleToken} />
                      </div>
                    )}
                  </>
                )}

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                  >
                    {t(`auth.error.${error}` as never)}
                  </motion.p>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="w-full py-3 bg-[#0E8C72] text-white rounded-xl font-semibold text-sm hover:bg-[#0A7A63] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                    </svg>
                  ) : <Check className="w-4 h-4" />}
                  {mode === 'login' ? t('auth.submit.login') : t('auth.submit.register')}
                </button>

                {mode === 'register' && remoteAuth && (
                  <p className="text-center text-xs text-gray-400">{t('auth.verify.note')}</p>
                )}

                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
                  className="w-full text-center text-sm text-gray-500 hover:text-[#0E8C72] transition-colors cursor-pointer"
                >
                  {mode === 'login' ? t('auth.switch.toregister') : t('auth.switch.tologin')}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function RoleOption({ active, onClick, icon, title, desc, accent }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; accent: string
}) {
  return (
    <button
      type="button" onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer"
      style={active ? { borderColor: accent, backgroundColor: `${accent}0D` } : { borderColor: '#E5E7EB', backgroundColor: '#fff' }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}1A`, color: accent }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={active ? { borderColor: accent, backgroundColor: accent } : { borderColor: '#D1D5DB' }}>
        {active && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  )
}
