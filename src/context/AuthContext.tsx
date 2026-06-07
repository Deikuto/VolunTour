import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, RegisterData, Role } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { getUsers, saveUsers, getCurrentUserId, saveCurrentUserId } from '../lib/storage'

interface AuthModalState {
  open: boolean
  mode: 'login' | 'register'
  presetRole?: Role
}

export interface AuthResult {
  ok: boolean
  error?: string
  needsEmailConfirm?: boolean
}

interface AuthContextValue {
  currentUser: User | null
  loading: boolean
  /** True when real Supabase auth is active (email verification etc.). */
  remoteAuth: boolean
  register: (data: RegisterData, captchaToken?: string) => Promise<AuthResult>
  login: (email: string, password: string, captchaToken?: string) => Promise<AuthResult>
  logout: () => Promise<void>
  authModal: AuthModalState
  openAuth: (mode: 'login' | 'register', presetRole?: Role) => void
  closeAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function avatarFor(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`
}

// --- Supabase profile mapping -------------------------------------------------

async function fetchProfile(userId: string): Promise<Partial<User>> {
  if (!supabase) return {}
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!data) return {}
  return {
    name: data.name ?? undefined,
    role: (data.role as Role) ?? undefined,
    cityId: data.city_id ?? undefined,
    phone: data.phone ?? undefined,
    avatar: data.avatar ?? undefined,
  }
}

// Loosely typed to avoid importing Supabase's User type everywhere.
async function buildUser(sUser: {
  id: string
  email?: string | null
  created_at?: string
  user_metadata?: Record<string, unknown>
}): Promise<User> {
  const profile = await fetchProfile(sUser.id)
  const meta = sUser.user_metadata ?? {}
  const email = sUser.email ?? ''
  const phone = profile.phone ?? (meta.phone as string | undefined)

  // The DB trigger seeds the profile from metadata but can't capture the phone
  // (it lives in metadata, not auth.phone) — patch it once if missing.
  if (supabase && !profile.phone && meta.phone) {
    await supabase.from('profiles').update({ phone: meta.phone }).eq('id', sUser.id)
  }

  return {
    id: sUser.id,
    email,
    name: profile.name || (meta.name as string) || email.split('@')[0] || '',
    role: (profile.role as Role) || (meta.role as Role) || 'tourist',
    cityId: profile.cityId ?? (meta.city_id as string | undefined),
    phone,
    avatar: profile.avatar || (meta.avatar as string) || avatarFor(email || sUser.id),
    createdAt: sUser.created_at ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const remoteAuth = isSupabaseConfigured
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Local fallback store (only used when Supabase isn't configured)
  const [users, setUsers] = useState<User[]>(() => (remoteAuth ? [] : getUsers()))
  const [authModal, setAuthModal] = useState<AuthModalState>({ open: false, mode: 'register' })

  // ---- Session bootstrap -----------------------------------------------------
  useEffect(() => {
    let active = true

    if (remoteAuth && supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!active) return
        if (data.session?.user) {
          setCurrentUser(await buildUser(data.session.user))
        }
        setLoading(false)
      })

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!active) return
        setCurrentUser(session?.user ? await buildUser(session.user) : null)
      })

      return () => {
        active = false
        sub.subscription.unsubscribe()
      }
    }

    // Local fallback
    const id = getCurrentUserId()
    setCurrentUser(id ? getUsers().find(u => u.id === id) ?? null : null)
    setLoading(false)
    return () => {
      active = false
    }
  }, [remoteAuth])

  const openAuth = useCallback((mode: 'login' | 'register', presetRole?: Role) => {
    setAuthModal({ open: true, mode, presetRole })
  }, [])

  const closeAuth = useCallback(() => {
    setAuthModal(s => ({ ...s, open: false }))
  }, [])

  // ---- Register --------------------------------------------------------------
  const register = useCallback(
    async (data: RegisterData, captchaToken?: string): Promise<AuthResult> => {
      if (data.password.length < 6) return { ok: false, error: 'shortpass' }
      if (data.role === 'local_volunteer' && !data.cityId) return { ok: false, error: 'nocity' }

      if (remoteAuth && supabase) {
        const { data: res, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin,
            captchaToken,
            data: {
              name: data.name,
              role: data.role,
              city_id: data.role === 'local_volunteer' ? data.cityId : null,
              phone: data.phone ?? null,
              avatar: avatarFor(data.email),
            },
          },
        })
        if (error) {
          if (/already|registered|exists/i.test(error.message)) return { ok: false, error: 'exists' }
          if (/captcha/i.test(error.message)) return { ok: false, error: 'captcha' }
          return { ok: false, error: error.message }
        }
        // Email confirmation on → no session yet, user must verify inbox.
        if (!res.session) return { ok: true, needsEmailConfirm: true }
        return { ok: true }
      }

      // Local fallback
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: 'exists' }
      }
      const newUser: User = {
        id: `u-${Date.now()}`,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        cityId: data.role === 'local_volunteer' ? data.cityId : undefined,
        phone: data.phone,
        avatar: avatarFor(data.email),
        createdAt: new Date().toISOString(),
      }
      const updated = [...users, newUser]
      setUsers(updated)
      saveUsers(updated)
      setCurrentUser(newUser)
      saveCurrentUserId(newUser.id)
      return { ok: true }
    },
    [remoteAuth, users]
  )

  // ---- Login -----------------------------------------------------------------
  const login = useCallback(
    async (email: string, password: string, captchaToken?: string): Promise<AuthResult> => {
      if (remoteAuth && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { captchaToken },
        })
        if (error) {
          if (/email not confirmed|not confirmed/i.test(error.message)) return { ok: false, error: 'unverified' }
          if (/captcha/i.test(error.message)) return { ok: false, error: 'captcha' }
          return { ok: false, error: 'notfound' }
        }
        return { ok: true }
      }

      // Local fallback
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      )
      if (!user) return { ok: false, error: 'notfound' }
      setCurrentUser(user)
      saveCurrentUserId(user.id)
      return { ok: true }
    },
    [remoteAuth, users]
  )

  // ---- Logout ----------------------------------------------------------------
  const logout = useCallback(async () => {
    if (remoteAuth && supabase) {
      await supabase.auth.signOut()
      setCurrentUser(null)
      return
    }
    setCurrentUser(null)
    saveCurrentUserId(null)
  }, [remoteAuth])

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, remoteAuth, register, login, logout, authModal, openAuth, closeAuth }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
