import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: "Vui lòng nhập đầy đủ thông tin" },
                { status: 400 }
            )
        }

        const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

        const response = await fetch(`${backendUrl}/api/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        })

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error("Backend response is not JSON:", text)
            return NextResponse.json(
                { message: text || "Lỗi hệ thống" },
                { status: response.status }
            )
        }

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || data || "Đổi mật khẩu thất bại" },
                { status: response.status }
            )
        }

        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error("Change password error:", error)
        return NextResponse.json(
            { message: "Đã xảy ra lỗi khi đổi mật khẩu" },
            { status: 500 }
        )
    }
}
