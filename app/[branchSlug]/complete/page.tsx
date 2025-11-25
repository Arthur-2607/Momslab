import { Suspense } from "react"
import { CompleteClient } from "./complete-client"

interface CompletePageProps {
  params: Promise<{ branchSlug: string }>
}

export default async function CompletePage({ params }: CompletePageProps) {
  const { branchSlug } = await params

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CompleteClient branchSlug={branchSlug} />
    </Suspense>
  )
}
