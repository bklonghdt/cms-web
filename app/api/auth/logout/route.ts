import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    )

    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { message: "An error occurred during logout" },
      { status: 500 }
    )
  }
}
