import { NextResponse } from "next/server"
import { mockAdmins } from "@/lib/mock-data"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const branchId = searchParams.get("branchId")

    let data = [...mockAdmins]

    if (role) {
        data = data.filter((admin) => admin.role === role)
    }

    if (branchId) {
        data = data.filter((admin) => admin.branchId === branchId)
    }

    return NextResponse.json({
        data,
        meta: {
            count: data.length,
        },
    })
}
