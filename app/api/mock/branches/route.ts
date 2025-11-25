import { NextResponse } from "next/server"
import { mockBranches } from "@/lib/mock-data"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const id = searchParams.get("id")

    let data = [...mockBranches]

    if (slug || id) {
        data = data.filter((branch) => {
            if (slug && branch.slug === slug) return true
            if (id && branch.id === id) return true
            return false
        })
    }

    return NextResponse.json({
        data,
        meta: {
            count: data.length,
        },
    })
}
