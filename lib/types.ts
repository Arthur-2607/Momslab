// Core data types for the group-buying platform

export interface Branch {
  id: string
  name: string // "강남점"
  slug: string // "gangnam" (URL용)
  kakaoChannelId: string
  notificationPhone: string
  status: "active" | "inactive"
  websiteUrl?: string // "https://gangnam.momslab.com"
  themeColor?: string // Hex color for branch theme (e.g., "#10b981")
  address?: string // Branch address (e.g., "대구 수성구 OOO로 123")
}

export interface Product {
  id: string
  branchId: string
  name: string // "제주 한라봉"
  price: number // 12000
  moq: number // 최소 주문 수량 (100)
  stock: number | null // null이면 무제한
  status: "open" | "closed" | "soldout"
  imageUrl: string
  images?: string[] // 추가 이미지들
  description: string // HTML
  category?: string
  startAt: string // ISO 8601
  endAt: string // ISO 8601
  currentOrders?: number // 현재 주문 수량 합계 (계산됨)
}

export interface User {
  id: string
  branchId: string
  kakaoId: string
  name: string
  phone: string
}

export interface Order {
  id: string
  orderNumber: string // "ORD20251105001"
  userId: string
  branchId: string
  productId: string
  product?: Product // 조인된 상품 정보
  quantity: number
  totalAmount: number
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "refunded"
  fulfillmentStatus: "payment_completed" | "preparing" | "ready_for_pickup" | "picked_up" | "converted_to_floor_sale"
  paymentMethod?: "card" | "kakao_pay" | "naver_pay"
  createdAt: string
  paidAt?: string
  pickedUpAt?: string
}

export interface Admin {
  id: string
  username: string
  password: string
  name: string // Added name field for displaying admin names
  role: "super_admin" | "branch_owner"
  branchId?: string // branch_owner인 경우에만
}
