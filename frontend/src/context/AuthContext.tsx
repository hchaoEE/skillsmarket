import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => void
  setUser: (u: User | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem(USER_KEY)
      return s ? (JSON.parse(s) as User) : null
    } catch {
      return null
    }
  })

  const login = useCallback((t: string) => {
    setToken(t)
    localStorage.setItem(TOKEN_KEY, t)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  useEffect(() => {
    if (token && !user) {
      // Optional: decode JWT for minimal user info or call /me; for now we keep user from register
      const payload = JSON.parse(atob(token.split('.')[1] || '{}'))
      if (payload.sub) {
        setUser({ id: Number(payload.sub), username: '', email: '' })
      }
    }
  }, [token, user])

  const setUserAndPersist = useCallback((u: User | null) => {
    setUser(u)
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: login,
        logout,
        setUser: setUserAndPersist,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
