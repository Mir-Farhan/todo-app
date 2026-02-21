'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/authStore'

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, loading, error: authError, isDevMode } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    const result = await signUp(email, password, fullName)
    if (!result.error) {
      setSuccess(true)
      if (isDevMode) {
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        setTimeout(() => {
          router.push('/sign-in')
        }, 3000)
      }
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {isDevMode ? 'Account created!' : 'Check your email'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isDevMode
              ? 'Your account has been created successfully. You can now start using the app.'
              : 'We\'ve sent you a confirmation link. Please click it to activate your account.'}
          </p>
          {isDevMode && (
            <p className="mt-2 text-xs text-muted-foreground">
              (Development mode - email verification skipped)
            </p>
          )}
        </div>
        <Button asChild className="w-full">
          <Link href={isDevMode ? '/' : '/sign-in'}>
            {isDevMode ? 'Go to Dashboard' : 'Go to Sign In'}
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
        <p className="mt-2 text-muted-foreground">
          Enter your information to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 6 characters
          </p>
        </div>

        {authError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {authError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
