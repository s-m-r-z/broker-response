import { Suspense } from 'react'
import { CaseTracker } from '@/components/case-tracker/case-tracker'

export default function Page() {
  return (
    <Suspense>
      <CaseTracker />
    </Suspense>
  )
}
