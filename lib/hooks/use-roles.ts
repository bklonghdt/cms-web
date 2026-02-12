import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Role {
  id: string
  name: string
}

export interface CreateRoleInput {
  name: string
}

export interface UpdateRoleInput {
  id: string
  name: string
}

const API_URL = "/api"

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Roles`)
      if (!response.ok) {
        throw new Error("Failed to fetch roles")
      }
      return response.json()
    },
  })
}

export function useRole(id: string) {
  return useQuery<Role>({
    queryKey: ["roles", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Roles/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch role")
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoleInput) => {
      const response = await fetch(`${API_URL}/Roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create role")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateRoleInput) => {
      const response = await fetch(`${API_URL}/Roles/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/Roles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete role")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] })
    },
  })
}
