import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Todo, Label, SortOption, FilterOptions, Priority } from '@/lib/supabase/types'

interface TodoState {
  todos: Todo[]
  loading: boolean
  sortOption: SortOption
  filterOptions: FilterOptions
  optimisticUpdates: Map<string, Partial<Todo>>
  
  // Actions
  fetchTodos: () => Promise<void>
  createTodo: (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  setSortOption: (option: SortOption) => void
  setFilterOptions: (options: Partial<FilterOptions>) => void
  reorderTodos: (todos: Todo[]) => void
  saveTodoPositions: (todos: Todo[]) => Promise<void>
  clearOptimisticUpdate: (id: string) => void
  rollbackOptimisticUpdate: (id: string) => void
}

const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  sortOption: 'position',
  filterOptions: {},
  optimisticUpdates: new Map(),

  fetchTodos: async () => {
    set({ loading: true })
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      set({ todos: [], loading: false })
      return
    }

    const { data: todos, error } = await supabase
      .from('todos')
      .select(`
        *,
        todo_labels (
          labels (
            id,
            name,
            color,
            is_predefined
          )
        )
      `)
      .eq('user_id', user.user.id)
      .is('deleted_at', null)
      .order('position', { ascending: true })

    // Transform the data to match the expected format
    const transformedTodos = (todos || []).map((todo: any) => ({
      ...todo,
      labels: todo.todo_labels?.map((tl: any) => tl.labels) || [],
    }))

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      set({ todos: transformedTodos, loading: false })
    }
  },

  createTodo: async (todoData) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticTodo: Todo = {
      id: tempId,
      user_id: user.user.id,
      title: todoData.title,
      description: todoData.description || null,
      due_date: todoData.due_date || null,
      priority: todoData.priority || 'medium',
      completed: false,
      position: get().todos.length,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      labels: todoData.labels || [],
    }

    set((state) => ({
      todos: [...state.todos, optimisticTodo],
      optimisticUpdates: new Map(state.optimisticUpdates).set(tempId, optimisticTodo),
    }))

    try {
      console.log('Creating todo:', todoData)
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.user.id,
          title: todoData.title,
          description: todoData.description,
          due_date: todoData.due_date,
          priority: todoData.priority,
          completed: false,
          position: get().todos.length,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Add labels if provided
      if (todoData.labels && todoData.labels.length > 0) {
        const labelIds = todoData.labels.map((l) => l.id)
        const { error: labelError } = await supabase.from('todo_labels').insert(
          labelIds.map((labelId) => ({
            todo_id: data.id,
            label_id: labelId,
          }))
        )
        if (labelError) {
          console.error('Error adding labels:', labelError)
        }
      }

      // Replace optimistic update with real data
      set((state) => {
        const updates = new Map(state.optimisticUpdates)
        updates.delete(tempId)
        return {
          todos: state.todos.map((t) =>
            t.id === tempId ? { ...data, labels: todoData.labels } : t
          ),
          optimisticUpdates: updates,
        }
      })
    } catch (error) {
      // Rollback on error
      console.error('Error creating todo in store:', error)
      get().rollbackOptimisticUpdate(tempId)
      throw error
    }
  },

  reorderTodos: async (todos: Todo[]) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    set({ todos })
    
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i]
      const { error } = await supabase
        .from('todos')
        .update({ position: i })
        .eq('id', todo.id)

      if (error) {
        console.error('Error reordering todos:', error)
      }
    }
  },

  updateTodo: async (id, updates) => {
    // Optimistic update
    const originalTodo = get().todos.find((t) => t.id === id)
    if (!originalTodo) return

    const optimisticTodo = { ...originalTodo, ...updates }
    
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? optimisticTodo : t)),
      optimisticUpdates: new Map(state.optimisticUpdates).set(id, optimisticTodo),
    }))

    try {
      const { error } = await supabase
        .from('todos')
        .update({
          title: updates.title,
          description: updates.description,
          due_date: updates.due_date,
          priority: updates.priority,
          completed: updates.completed,
          position: updates.position,
        })
        .eq('id', id)

      if (error) throw error

      // Update labels if changed
      if (updates.labels) {
        // Remove existing labels
        await supabase.from('todo_labels').delete().eq('todo_id', id)
        // Add new labels
        if (updates.labels.length > 0) {
          await supabase.from('todo_labels').insert(
            updates.labels.map((l) => ({
              todo_id: id,
              label_id: l.id,
            }))
          )
        }
      }

      get().clearOptimisticUpdate(id)
    } catch (error) {
      get().rollbackOptimisticUpdate(id)
      throw error
    }
  },

  deleteTodo: async (id) => {
    // Optimistic update - remove from list
    const originalTodo = get().todos.find((t) => t.id === id)
    if (!originalTodo) return

    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
      optimisticUpdates: new Map(state.optimisticUpdates).set(id, originalTodo),
    }))

    try {
      const { error } = await supabase
        .from('todos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      get().clearOptimisticUpdate(id)
    } catch (error) {
      get().rollbackOptimisticUpdate(id)
      throw error
    }
  },

  toggleComplete: async (id) => {
    const todo = get().todos.find((t) => t.id === id)
    if (!todo) return

    await get().updateTodo(id, { completed: !todo.completed })
  },

  setSortOption: (option) => set({ sortOption: option }),

  setFilterOptions: (options) =>
    set((state) => {
      // If options is empty object, clear all filters
      if (Object.keys(options).length === 0) {
        return { filterOptions: {} }
      }
      // Otherwise merge with existing filters
      return {
        filterOptions: { ...state.filterOptions, ...options },
      }
    }),

  saveTodoPositions: async (todos: Todo[]) => {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i]
      const { error } = await supabase
        .from('todos')
        .update({ position: i })
        .eq('id', todo.id)

      if (error) {
        console.error('Error saving todo position:', error)
      }
    }
  },

  clearOptimisticUpdate: (id) =>
    set((state) => {
      const updates = new Map(state.optimisticUpdates)
      updates.delete(id)
      return { optimisticUpdates: updates }
    }),

  rollbackOptimisticUpdate: (id) =>
    set((state) => {
      const optimisticTodo = state.optimisticUpdates.get(id)
      if (!optimisticTodo) return state

      const updates = new Map(state.optimisticUpdates)
      updates.delete(id)

      // Restore original todo
      const originalTodo = state.todos.find((t) => t.id === id)
      if (!originalTodo) {
        // If we can't find the original, it was a create operation
        return {
          todos: state.todos.filter((t) => t.id !== id),
          optimisticUpdates: updates,
        }
      }

      // Ensure optimisticTodo has all required Todo fields
      const todoToRestore: Todo = {
        ...originalTodo,
        ...optimisticTodo,
        id: originalTodo.id,
        user_id: originalTodo.user_id,
        created_at: originalTodo.created_at,
        updated_at: originalTodo.updated_at,
        deleted_at: originalTodo.deleted_at,
      }

      return {
        todos: state.todos.map((t) =>
          t.id === id ? todoToRestore : t
        ),
        optimisticUpdates: updates,
      }
    }),
}))

// Computed: Get filtered and sorted todos
export const getFilteredSortedTodos: (state: TodoState) => Todo[] = (state) => {
  let filtered = [...state.todos]

  // Apply filters
  if (state.filterOptions.priority && state.filterOptions.priority.length > 0) {
    filtered = filtered.filter((t) =>
      state.filterOptions.priority!.includes(t.priority)
    )
  }

  if (state.filterOptions.labels && state.filterOptions.labels.length > 0) {
    filtered = filtered.filter((t) =>
      t.labels?.some((l) => state.filterOptions.labels!.includes(l.id))
    )
  }

  if (state.filterOptions.completed !== undefined) {
    filtered = filtered.filter((t) => t.completed === state.filterOptions.completed)
  }

  if (state.filterOptions.search) {
    const searchLower = state.filterOptions.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  switch (state.sortOption) {
    case 'due_date_asc':
      filtered.sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
      break
    case 'due_date_desc':
      filtered.sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      })
      break
    case 'priority_asc':
      filtered.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      break
    case 'priority_desc':
      filtered.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority])
      break
    case 'created_asc':
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'created_desc':
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'position':
    default:
      filtered.sort((a, b) => a.position - b.position)
      break
  }

  return filtered
}
