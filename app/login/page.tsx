'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.href = from
    } else {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-2xl">
      <h2 className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">Sign in</h2>
      <p className="mb-5 text-xs text-zinc-500">Enter the team password to continue</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors dark:hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || !password}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Broker Response</h1>
            <p className="mt-1 text-sm text-zinc-500">PureWL Compliance Dashboard</p>
          </div>
        </div>

        <Suspense fallback={
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="h-32 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Internal tool · PureWL
        </p>
      </div>
    </div>
  )
}
