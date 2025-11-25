import { createAdminClient } from "@/lib/supabase/admin"
import type { Order, OrderWithDetails, CreateOrderDto, UpdateOrderDto, OrderListQuery } from "../schemas/order.schema"

/**
 * Order Repository
 * Handles all database operations for orders
 * Uses Supabase Admin Client for full access
 */

export const orderRepository = {
    /**
     * Get order by ID
     */
    async findById(id: string): Promise<OrderWithDetails | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("orders")
            .select(`
                *,
                customers (
                    name,
                    email
                ),
                branches (
                    name
                ),
                products (
                    name,
                    image_url
                )
            `)
            .eq("id", id)
            .single()

        if (error) {
            console.error("Error finding order:", error)
            return null
        }

        if (!data) return null

        // Map joined data to flat structure
        return {
            ...data,
            customerName: data.customers?.name,
            customerEmail: data.customers?.email,
            branchName: data.branches?.name,
            productName: data.products?.name,
            productImageUrl: data.products?.image_url,
        } as OrderWithDetails
    },

    /**
     * Get order by order number
     */
    async findByOrderNumber(orderNumber: string): Promise<OrderWithDetails | null> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("orders")
            .select(`
                *,
                customers (
                    name,
                    email
                ),
                branches (
                    name
                ),
                products (
                    name,
                    image_url
                )
            `)
            .eq("order_number", orderNumber)
            .single()

        if (error) {
            console.error("Error finding order by number:", error)
            return null
        }

        if (!data) return null

        return {
            ...data,
            customerName: data.customers?.name,
            customerEmail: data.customers?.email,
            branchName: data.branches?.name,
            productName: data.products?.name,
            productImageUrl: data.products?.image_url,
        } as OrderWithDetails
    },

    /**
     * List orders with filters and pagination
     */
    async list(query: OrderListQuery): Promise<{ orders: OrderWithDetails[]; total: number }> {
        const supabase = createAdminClient()

        let queryBuilder = supabase
            .from("orders")
            .select(`
                *,
                customers (
                    name,
                    email
                ),
                branches (
                    name
                ),
                products (
                    name,
                    image_url
                )
            `, { count: "exact" })

        // Apply filters
        if (query.branchId) {
            queryBuilder = queryBuilder.eq("branch_id", query.branchId)
        }

        if (query.customerId) {
            queryBuilder = queryBuilder.eq("customer_id", query.customerId)
        }

        if (query.productId) {
            queryBuilder = queryBuilder.eq("product_id", query.productId)
        }

        if (query.paymentStatus) {
            queryBuilder = queryBuilder.eq("payment_status", query.paymentStatus)
        }

        if (query.fulfillmentStatus) {
            queryBuilder = queryBuilder.eq("fulfillment_status", query.fulfillmentStatus)
        }

        if (query.dateFrom) {
            queryBuilder = queryBuilder.gte("created_at", query.dateFrom)
        }

        if (query.dateTo) {
            queryBuilder = queryBuilder.lte("created_at", query.dateTo)
        }

        // Note: Search filter will be applied in memory after fetch
        // because Supabase doesn't support OR queries across joined tables

        // Apply pagination
        const { limit = 50, offset = 0 } = query
        queryBuilder = queryBuilder
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        const { data, error, count } = await queryBuilder

        if (error) {
            console.error("Error listing orders:", error)
            throw new Error(`Failed to list orders: ${error.message}`)
        }

        let orders = (data || []).map(order => ({
            ...order,
            customerName: order.customers?.name,
            customerEmail: order.customers?.email,
            branchName: order.branches?.name,
            productName: order.products?.name,
            productImageUrl: order.products?.image_url,
        })) as OrderWithDetails[]

        // Apply search filter in memory if provided
        if (query.search) {
            const searchLower = query.search.toLowerCase()
            orders = orders.filter(order =>
                order.orderNumber?.toLowerCase().includes(searchLower) ||
                order.productName?.toLowerCase().includes(searchLower) ||
                order.customerName?.toLowerCase().includes(searchLower)
            )
        }

        return {
            orders,
            total: query.search ? orders.length : (count || 0), // Adjust count if search applied
        }
    },

    /**
     * Get orders by branch ID with optional filters
     */
    async findByBranch(branchId: string, filters?: Partial<OrderListQuery>): Promise<OrderWithDetails[]> {
        const { orders } = await this.list({
            branchId,
            limit: filters?.limit || 1000,
            offset: filters?.offset || 0,
            ...filters
        })
        return orders
    },

    /**
     * Get orders by customer ID with optional filters
     */
    async findByCustomer(customerId: string, filters?: Partial<OrderListQuery>): Promise<OrderWithDetails[]> {
        const { orders } = await this.list({
            customerId,
            limit: filters?.limit || 1000,
            offset: filters?.offset || 0,
            ...filters
        })
        return orders
    },

    /**
     * Create new order
     */
    async create(orderData: CreateOrderDto & { orderNumber: string; totalAmount: number }): Promise<Order> {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from("orders")
            .insert({
                order_number: orderData.orderNumber,
                customer_id: orderData.customerId,
                branch_id: orderData.branchId,
                product_id: orderData.productId,
                quantity: orderData.quantity,
                unit_price: orderData.unitPrice,
                total_amount: orderData.totalAmount,
                payment_status: "pending",
                fulfillment_status: "preparing",
                notes: orderData.notes,
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating order:", error)
            throw new Error(`Failed to create order: ${error.message}`)
        }

        return data as Order
    },

    /**
     * Update existing order
     */
    async update(id: string, orderData: Partial<UpdateOrderDto>): Promise<Order> {
        const supabase = createAdminClient()

        const updateData: any = {}

        if (orderData.paymentStatus !== undefined) {
            updateData.payment_status = orderData.paymentStatus
        }

        if (orderData.fulfillmentStatus !== undefined) {
            updateData.fulfillment_status = orderData.fulfillmentStatus
        }

        if (orderData.pickupDate !== undefined) {
            updateData.pickup_date = orderData.pickupDate
        }

        if (orderData.notes !== undefined) {
            updateData.notes = orderData.notes
        }

        const { data, error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            console.error("Error updating order:", error)
            throw new Error(`Failed to update order: ${error.message}`)
        }

        return data as Order
    },

    /**
     * Delete order (soft delete by marking as cancelled)
     */
    async delete(id: string): Promise<boolean> {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from("orders")
            .update({ fulfillment_status: "cancelled" })
            .eq("id", id)

        if (error) {
            console.error("Error deleting order:", error)
            throw new Error(`Failed to delete order: ${error.message}`)
        }

        return true
    },

    /**
     * Get order statistics for a branch
     */
    async getStats(branchId?: string): Promise<{
        totalOrders: number
        totalRevenue: number
        ordersByStatus: Record<string, number>
    }> {
        const supabase = createAdminClient()

        let query = supabase
            .from("orders")
            .select("fulfillment_status, total_amount")

        if (branchId) {
            query = query.eq("branch_id", branchId)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error getting order stats:", error)
            throw new Error(`Failed to get order stats: ${error.message}`)
        }

        const orders = data || []

        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)

        const ordersByStatus: Record<string, number> = {
            preparing: 0,
            ready_for_pickup: 0,
            picked_up: 0,
            cancelled: 0,
        }

        orders.forEach(order => {
            const status = order.fulfillment_status
            if (status in ordersByStatus) {
                ordersByStatus[status]++
            }
        })

        return {
            totalOrders,
            totalRevenue,
            ordersByStatus,
        }
    },
}

