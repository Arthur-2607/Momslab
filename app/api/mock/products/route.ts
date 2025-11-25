import { NextResponse } from "next/server"
import { mockProducts, mockBranches } from "@/lib/mock-data"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const branchSlug = searchParams.get("branchSlug")
    const status = searchParams.get("status")

    let data = [...mockProducts]

    if (branchSlug) {
        const normalizedSlug = branchSlug.toLowerCase()
        const branch = mockBranches.find(
            (b) => b.slug === normalizedSlug || b.id === normalizedSlug || b.id?.includes(normalizedSlug),
        )

        if (branch) {
            data = data.filter((product) => product.branchId.includes(branch.slug) || product.branchId === branch.id)
        } else {
            data = []
        }
    }

    if (status) {
        data = data.filter((product) => product.status === status)
    }

    return NextResponse.json({
        data,
        meta: {
            count: data.length,
        },
    })
}
