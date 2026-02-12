import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface MediaItem {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  thumbnailUrl?: string
  altText?: string
  created: string
}

export interface PaginatedResponse {
  items: MediaItem[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const API_URL = "/api"

export function useMedia(mimeTypeFilter?: string, pageNumber: number = 1, pageSize: number = 12) {
  return useQuery<PaginatedResponse>({
    queryKey: ["media", mimeTypeFilter, pageNumber, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString()
      })

      if (mimeTypeFilter) {
        params.append("MimeTypeFilter", mimeTypeFilter)
      }

      const response = await fetch(`${API_URL}/Medias/paginated?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch media")
      }
      const data: PaginatedResponse = await response.json()
      return data
    },
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_URL}/Medias`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload media")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/Medias/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to delete media: ${error}`)
      }

      // DELETE returns 204 No Content, no JSON to parse
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] })
    },
  })
}
