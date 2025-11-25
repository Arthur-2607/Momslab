import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status:
  | "open"
  | "closed"
  | "soldout"
  | "ready_for_pickup"
  | "picked_up"
  | "preparing"
  | "converted_to_floor_sale"
  | "payment_completed"
  | "cancelled"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    open: { label: "판매중", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    closed: { label: "마감", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    soldout: { label: "마감", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    payment_completed: {
      label: "결제완료",
      color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    },
    ready_for_pickup: {
      label: "픽업대기",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    picked_up: { label: "픽업완료", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    preparing: { label: "준비중", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    converted_to_floor_sale: {
      label: "현장판매",
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
    cancelled: { label: "취소됨", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  }

  const variant = variants[status]

  return <Badge className={cn(variant.color, "font-medium", className)}>{variant.label}</Badge>
}
