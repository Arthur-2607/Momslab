import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CheckoutClient } from "./checkout-client"
import { getBranchBySlug } from "@/lib/server"

interface CheckoutPageProps {
  params: Promise<{ branchSlug: string }>
}

export const revalidate = 0

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { branchSlug } = await params

  // Fetch branch from database
  const branchResult = await getBranchBySlug(branchSlug)

  // Check if branch exists
  if (!branchResult.success || !branchResult.branch) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CheckoutClient branchSlug={branchSlug} branch={branchResult.branch} />
    </Suspense>
  )
}
