import { OrderReceiptClient } from "./order-receipt-client"

interface PageProps {
  params: Promise<{
    branchSlug: string
    orderId: string
  }>
}

export default async function OrderReceiptPage({ params }: PageProps) {
  const { branchSlug, orderId } = await params

  return <OrderReceiptClient branchSlug={branchSlug} orderId={orderId} />
}
