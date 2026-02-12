import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface User {
  id: string
  userName: string
  email: string
  emailConfirmed: boolean
  roles: string[]
}

export interface CreateUserInput {
  userName: string
  email: string
  password: string
  roles: string[]
}

export interface UpdateUserInput {
  id: string
  userName: string
  email: string
  roles: string[]
}

const API_URL = "/api"

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/UserManagement`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      return response.json()
    },
  })
}

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/UserManagement/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const response = await fetch(`${API_URL}/UserManagement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create user")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const response = await fetch(`${API_URL}/UserManagement/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to update user")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/UserManagement/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to delete user")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
