import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name?: string
  }
  token?: string
  message?: string
}

async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
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

async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
  })
}

export function useLogin() {
  const router = useRouter()
  const { login: setAuthState } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuthState(data.user, data.token)
      queryClient.invalidateQueries({ queryKey: ["user"] })

      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      router.push(redirect || "/dashboard")
    },
  })
}

export function useLogout() {
  const { logout: clearAuthState } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuthState()
      queryClient.clear()
      router.push("/login")
    },
  })
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

async function changePasswordRequest(data: ChangePasswordInput): Promise<{ message: string }> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Đổi mật khẩu thất bại")
  }

  return result
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePasswordRequest,
  })
}
