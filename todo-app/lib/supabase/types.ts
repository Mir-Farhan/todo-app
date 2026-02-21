export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export type SortOption = 'due_date_asc' | 'due_date_desc' | 'priority_asc' | 'priority_desc' | 'created_asc' | 'created_desc' | 'position'

export type FilterOptions = {
  priority?: Priority[]
  labels?: string[]
  completed?: boolean | null
  search?: string
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: Priority
  completed: boolean
  position: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  labels?: Label[]
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  is_predefined: boolean
  deleted_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string
}

export interface TodoLabel {
  id: string
  todo_id: string
  label_id: string
  created_at: string
}

export type TablesInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

export type TablesUpdate<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
