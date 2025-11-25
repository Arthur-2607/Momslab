import { notFound } from "next/navigation"
import ProductsPageClient from "./products-client"
import { getBranchBySlug, getProductsByBranchSlug } from "@/lib/server"

interface ProductsPageProps {
  params: Promise<{
    branchSlug: string
  }>
}

export const revalidate = 0

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { branchSlug } = await params

  // Fetch branch and products from database
  const [branchResult, productsResult] = await Promise.all([
    getBranchBySlug(branchSlug),
    getProductsByBranchSlug(branchSlug),
  ])

  // Check if branch exists
  if (!branchResult.success || !branchResult.branch) {
    notFound()
  }

  // Get products (empty array if failed)
  const products = productsResult.success && productsResult.products
    ? productsResult.products
    : []

  return (
    <ProductsPageClient
      branchSlug={branchSlug}
      branch={branchResult.branch}
      initialProducts={products}
    />
  )
}
