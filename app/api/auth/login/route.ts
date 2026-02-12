import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("Backend response is not JSON:", text)
      return NextResponse.json(
        { message: "Backend service error" },
        { status: 500 }
      )
    }

    const text = await response.text()
    if (!text) {
      console.error("Backend returned empty response")
      return NextResponse.json(
        { message: "Backend returned empty response" },
        { status: 500 }
      )
    }

    const data = JSON.parse(text)

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Invalid credentials" },
        { status: response.status }
      )
    }

    const nextResponse = NextResponse.json(
      { message: "Login successful", user: data.user },
      { status: 200 }
    )

    if (data.token) {
      nextResponse.cookies.set("auth-token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return nextResponse
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    )
  }
}
