/**
 * Server-side exports
 * Clean barrel exports following Next.js Full-Stack Architecture
 * 
 * NOTE: Only export Server Actions and types here.
 * Do NOT export server-only utilities (SessionManager, repositories, services)
 * as they will be bundled into client components.
 */

// ✅ Server Actions - Safe to import in client components
export * from "./actions/admin-auth.actions"
export * from "./actions/product.actions"
export * from "./actions/branch.actions"
export * from "./actions/order.actions"

// ✅ Schemas & Types - Safe to import in client components
export * from "./schemas/admin.schema"
export * from "./schemas/product.schema"
export * from "./schemas/branch.schema"
export * from "./schemas/order.schema"

// ❌ Do NOT export these (server-only):
// - SessionManager (uses next/headers)
// - AuthService, ProductService (server-only business logic)
// - Repositories (server-only data access)
//
// These should only be imported within server code (actions, services, etc.)

