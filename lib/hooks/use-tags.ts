import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Tag {
  id: number
  code: string
  name: string
  parentTagId?: number | null
  displayOrder: number
}

export interface CreateTagInput {
  name: string
  code: string
  parentTagId?: number | null
  displayOrder?: number
}

export interface UpdateTagInput {
  id: number
  name: string
  code: string
  parentTagId?: number | null
  displayOrder?: number
}

interface PaginatedResponse<T> {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const API_URL = "/api"

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Tags/paginated?PageNumber=1&PageSize=100`)
      if (!response.ok) {
        throw new Error("Failed to fetch tags")
      }
      const data: PaginatedResponse<Tag> = await response.json()
      return data.items
    },
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTagInput) => {
      const response = await fetch(`${API_URL}/Tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create tag")
      }

      // Read response text first to avoid JSON parse errors on empty responses
      const text = await response.text()
      try {
        return text ? JSON.parse(text) : {}
      } catch (error) {
        return {}
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateTagInput) => {
      const response = await fetch(`${API_URL}/Tags/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update tag")
      }

      // Read response text first to avoid JSON parse errors on empty responses
      const text = await response.text()
      try {
        return text ? JSON.parse(text) : {}
      } catch (error) {
        return {}
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/Tags/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete tag")
      }

      // Read response text first to avoid JSON parse errors on empty responses
      const text = await response.text()
      try {
        return text ? JSON.parse(text) : {}
      } catch (error) {
        return {}
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] })
    },
  })
}
