import { Suspense } from 'react'
import { TestCaseDashboard } from '@/components/test-cases/test-case-dashboard'

export default function Page() {
  return (
    <Suspense>
      <TestCaseDashboard />
    </Suspense>
  )
}
