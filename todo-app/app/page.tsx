'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/components/theme-provider'
import { TodoList } from '@/components/todo-list'
import { Moon, Sun } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading, signOut } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="text-sm text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <TodoList />
      </div>
    </main>
  )
}
