import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isDevMode: boolean
  setIsDevMode: (isDevMode: boolean) => void
  setError: (error: string | null) => void
  setUser: (user: User | null) => void
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isDevMode: process.env.NODE_ENV === 'development',

  setIsDevMode: (isDevMode) => set({ isDevMode }),

  setError: (error) => set({ error }),

  setUser: (user) => set({ user, loading: false }),

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && data.user) {
      set({ user: data.user, loading: false, error: null })
    } else if (error) {
      set({ loading: false, error: error.message })
    }
    return { error, data }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true, error: null })
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    
    if (!error && data.user) {
      // In dev mode, automatically sign in the user after sign-up
      if (get().isDevMode) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!signInError && signInData.user) {
          set({ user: signInData.user, loading: false, error: null })
        } else if (signInError) {
          set({ loading: false, error: signInError.message })
        }
        return { error: signInError, data: signInData }
      }
      // Normal flow - user needs to confirm email
      set({ user: data.user, loading: false, error: null })
    } else if (error) {
      set({ loading: false, error: error.message })
    }
    return { error, data }
  },

  signOut: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({ user: null, loading: false, error: null })
  },

  initializeAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
  },
}))
