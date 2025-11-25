import { CompletePageClient } from "./complete-client"

interface CompletePageProps {
  params: Promise<{ branchSlug: string }>
}

export default async function CompletePage({ params }: CompletePageProps) {
  const { branchSlug } = await params
  return <CompletePageClient branchSlug={branchSlug} />
}
