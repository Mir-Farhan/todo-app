import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Label } from '@/lib/supabase/types'

interface LabelState {
  labels: Label[]
  loading: boolean
  
  // Actions
  fetchLabels: () => Promise<void>
  createLabel: (label: Omit<Label, 'id' | 'created_at'>) => Promise<void>
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  loading: false,

  fetchLabels: async () => {
    set({ loading: true })
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      set({ labels: [], loading: false })
      return
    }

    const { data: labels, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', user.user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching labels:', error)
    } else {
      set({ labels: labels || [], loading: false })
    }
  },

  createLabel: async (labelData) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const { data, error } = await supabase
      .from('labels')
      .insert({
        user_id: user.user.id,
        name: labelData.name,
        color: labelData.color,
        is_predefined: false,
      })
      .select()
      .single()

    if (error) throw error

    set((state) => ({
      labels: [...state.labels, data],
    }))
  },

  updateLabel: async (id, updates) => {
    const { error } = await supabase
      .from('labels')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    set((state) => ({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }))
  },

  deleteLabel: async (id) => {
    const { error } = await supabase
      .from('labels')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    set((state) => ({
      labels: state.labels.filter((l) => l.id !== id),
    }))
  },
}))
