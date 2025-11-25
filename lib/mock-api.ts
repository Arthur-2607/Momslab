import type { Branch, Product, Order, Admin } from "@/lib/types"
import { mockBranches, mockProducts, mockOrders, mockAdmins } from "@/lib/mock-data"

const DEFAULT_BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

type FetchOptions = RequestInit & {
    next?: Record<string, unknown>
}

function resolveUrl(path: string) {
    try {
        return new URL(path, DEFAULT_BASE_URL).toString()
    } catch (error) {
        throw new Error(`Failed to resolve mock API URL: ${path} (${String(error)})`)
    }
}

async function fetchJson<T>(path: string, init?: FetchOptions): Promise<T> {
    const response = await fetch(resolveUrl(path), {
        cache: "no-store",
        ...init,
    })

    if (!response.ok) {
        throw new Error(`Mock API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

export async function fetchMockBranches(params?: { slug?: string; id?: string }): Promise<Branch[]> {
    let data = [...mockBranches]

    if (params?.slug || params?.id) {
        data = data.filter((branch) => {
            if (params.slug && branch.slug === params.slug) return true
            if (params.id && branch.id === params.id) return true
            return false
        })
    }

    return data
}

export async function fetchMockProducts(params?: { branchSlug?: string; status?: string }): Promise<Product[]> {
    let data = [...mockProducts]

    if (params?.branchSlug) {
        const normalizedSlug = params.branchSlug.toLowerCase()
        const branch = mockBranches.find(
            (b) => b.slug === normalizedSlug || b.id === normalizedSlug || b.id?.includes(normalizedSlug),
        )

        if (branch) {
            data = data.filter((product) => product.branchId.includes(branch.slug) || product.branchId === branch.id)
        } else {
            data = []
        }
    }

    if (params?.status) {
        data = data.filter((product) => product.status === params.status)
    }

    return data
}

export async function fetchMockOrders(params?: {
    branchId?: string
    userId?: string
    status?: string
}): Promise<Order[]> {
    let data = [...mockOrders]

    if (params?.branchId) {
        data = data.filter((order) => order.branchId === params.branchId)
    }

    if (params?.userId) {
        data = data.filter((order) => order.userId === params.userId)
    }

    if (params?.status) {
        data = data.filter((order) => order.status === params.status)
    }

    return data
}

export async function fetchMockAdmins(params?: { role?: string; branchId?: string }): Promise<Admin[]> {
    let data = [...mockAdmins]

    if (params?.role) {
        data = data.filter((admin) => admin.role === params.role)
    }

    if (params?.branchId) {
        data = data.filter((admin) => admin.branchId === params.branchId)
    }

    return data
}
