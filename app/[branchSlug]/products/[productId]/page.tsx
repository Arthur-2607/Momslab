import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"
import { getBranchBySlug, getProduct } from "@/lib/server"

interface ProductDetailPageProps {
  params: Promise<{ branchSlug: string; productId: string }>
}

export const revalidate = 0

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { branchSlug, productId } = await params

  // Fetch branch and product from database
  const [branchResult, productResult] = await Promise.all([
    getBranchBySlug(branchSlug),
    getProduct(productId),
  ])

  // Check if branch exists
  if (!branchResult.success || !branchResult.branch) {
    notFound()
  }

  // Check if product exists
  if (!productResult.success || !productResult.product) {
    notFound()
  }

  // Verify product belongs to this branch
  if (productResult.product.branchId !== branchResult.branch.id) {
    notFound()
  }

  return (
    <ProductDetailClient
      branchSlug={branchSlug}
      branch={branchResult.branch}
      product={productResult.product}
    />
  )
}
