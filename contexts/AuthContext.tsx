'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import type { UserInfo } from '@/types/auth'
import { authApi } from '@/lib/api'

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authApi.login({ username, password })
      const { user, accessToken } = response.data

      setUser(user)
      setToken(accessToken)
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authApi.register(userData)
      const { user, accessToken } = response.data
      setUser(user)
      setToken(accessToken)
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
