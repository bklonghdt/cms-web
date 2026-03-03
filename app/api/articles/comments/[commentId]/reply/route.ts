import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ commentId: string }> }
) {
    try {
        const token = request.cookies.get("auth-token")?.value

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { commentId } = await params
        const body = await request.json()

        const backendUrl = process.env.BACKEND_URL || "https://cms-binhphu.vkhealth.vn"

        const response = await fetch(
            `${backendUrl}/api/Articles/comments/${commentId}/reply`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        )

        const text = await response.text()
        const data = text ? JSON.parse(text) : {}

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Failed to reply to comment" },
                { status: response.status }
            )
        }

        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Reply comment error:", error)
        return NextResponse.json({ message: "An error occurred" }, { status: 500 })
    }
}
