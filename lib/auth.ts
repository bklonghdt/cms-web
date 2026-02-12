export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token?: string
  message?: string
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  return data
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
  })
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null
  
  const cookies = document.cookie.split(";")
  const authCookie = cookies.find(cookie => cookie.trim().startsWith("auth-token="))
  
  if (!authCookie) return null
  
  return authCookie.split("=")[1]
}
