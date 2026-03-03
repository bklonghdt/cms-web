import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Category {
  id: number
  code: string
  name: string
  imageUrl?: string | null
  parentCategoryId?: number | null
  displayOrder: number
}

export interface CreateCategoryInput {
  name: string
  code: string
  imageUrl?: string | null
  parentCategoryId?: number | null
  displayOrder?: number
}

export interface UpdateCategoryInput {
  id: number
  name: string
  code: string
  imageUrl?: string | null
  parentCategoryId?: number | null
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

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Categories/paginated?PageNumber=1&PageSize=100`)
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data: PaginatedResponse<Category> = await response.json()
      return data.items
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCategoryInput) => {
      const response = await fetch(`${API_URL}/Categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create category")
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
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCategoryInput) => {
      const response = await fetch(`${API_URL}/Categories/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
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
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/Categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
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
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
