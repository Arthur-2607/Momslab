/**
 * Internal server-only exports
 * 
 * ⚠️ WARNING: Do NOT import this file in client components!
 * 
 * This file exports server-only utilities that use next/headers,
 * database clients, and other server-only APIs.
 * 
 * Use this ONLY in:
 * - Server Actions
 * - Server Components
 * - API Routes
 * - Middleware
 */

// Services (business logic)
export { AuthService } from "./services/auth.service"
export { ProductService } from "./services/product.service"
export { BranchService } from "./services/branch.service"
export { OrderService } from "./services/order.service"

// Repositories (data access)
export { adminRepository } from "./repositories/admin.repository"
export { productRepository } from "./repositories/product.repository"
export { branchRepository } from "./repositories/branch.repository"
export { orderRepository } from "./repositories/order.repository"

// Auth utilities (session management)
export { SessionManager } from "./auth/session"

// Schemas (can also be imported from lib/server/index.ts)
export * from "./schemas/admin.schema"
export * from "./schemas/product.schema"
export * from "./schemas/branch.schema"
export * from "./schemas/order.schema"

