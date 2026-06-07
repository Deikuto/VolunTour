import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Leaf, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'
import { cityName } from '../i18n/localized'
import { CITIES } from '../data/mockData'

export default function Navbar() {
  const { currentUser, logout, openAuth } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const userCity = currentUser?.cityId ? CITIES.find(c => c.id === currentUser.cityId) : null

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/events', label: t('nav.events') },
    { to: '/issues', label: t('nav.issues') },
  ]

  const handleAuth = (mode: 'login' | 'register') => {
    openAuth(mode)
    setMenuOpen(false)
  }

  return (
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-[#0E8C72] rounded-lg flex items-center justify-center group-hover:bg-[#0A7A63] transition-colors duration-200">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[#1A1A1A] text-sm sm:text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
                VolOnTour
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive(to) ? 'bg-[#0E8C72]/10 text-[#0E8C72]' : 'text-gray-600 hover:text-[#0E8C72] hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#0E8C72] hover:text-[#0E8C72] transition-all duration-200 cursor-pointer"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5" />
                {t('common.lang')}
              </button>

              {currentUser ? (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full" />
                    <div className="pr-1">
                      <p className="text-xs font-semibold text-gray-800 leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] leading-tight" style={{ color: currentUser.role === 'local_volunteer' ? '#0E8C72' : '#0B6F5B' }}>
                        {currentUser.role === 'local_volunteer'
                          ? `${t('nav.role.volunteer')} · ${cityName(userCity ?? undefined, lang)}`
                          : t('nav.role.tourist')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    aria-label={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => handleAuth('login')}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#0E8C72] hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    {t('nav.login')}
                  </button>
                  <button
                    onClick={() => handleAuth('register')}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0E8C72] text-white hover:bg-[#0A7A63] transition-all cursor-pointer"
                  >
                    {t('nav.register')}
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive(to) ? 'bg-[#0E8C72]/10 text-[#0E8C72]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div className="pt-3 border-t border-gray-100 mt-2">
                  {currentUser ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                          <p className="text-xs" style={{ color: currentUser.role === 'local_volunteer' ? '#0E8C72' : '#0B6F5B' }}>
                            {currentUser.role === 'local_volunteer'
                              ? `${t('nav.role.volunteer')} · ${cityName(userCity ?? undefined, lang)}`
                              : t('nav.role.tourist')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); setMenuOpen(false) }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAuth('login')}
                        className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {t('nav.login')}
                      </button>
                      <button
                        onClick={() => handleAuth('register')}
                        className="flex-1 py-2.5 rounded-lg bg-[#0E8C72] text-white text-sm font-semibold hover:bg-[#0A7A63] transition-colors cursor-pointer"
                      >
                        {t('nav.register')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
  )
}
