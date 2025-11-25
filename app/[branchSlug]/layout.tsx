import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { notFound } from "next/navigation"
import { getBranchBySlug } from "@/lib/server"

interface BranchLayoutProps {
  children: ReactNode
  params: Promise<{ branchSlug: string }>
}

export default async function BranchLayout({ children, params }: BranchLayoutProps) {
  const { branchSlug } = await params

  // Fetch branch from database
  const result = await getBranchBySlug(branchSlug)

  if (!result.success || !result.branch) {
    notFound()
  }

  const branch = result.branch

  return (
    <div className="min-h-screen flex flex-col">
      <Header branchName={branch.name} branchSlug={branch.slug} branchAddress={branch.address || undefined} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
