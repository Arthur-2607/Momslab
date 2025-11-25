import { NextResponse } from "next/server"
import { mockOrders } from "@/lib/mock-data"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get("branchId")
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    let data = [...mockOrders]

    if (branchId) {
        data = data.filter((order) => order.branchId === branchId)
    }

    if (userId) {
        data = data.filter((order) => order.userId === userId)
    }

    if (status) {
        data = data.filter((order) => order.paymentStatus === status || order.fulfillmentStatus === status)
    }

    return NextResponse.json({
        data,
        meta: {
            count: data.length,
        },
    })
}
