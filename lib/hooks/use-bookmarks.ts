import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArticleBrief } from "./use-articles"

interface PaginatedResponse<T> {
    items: T[]
    pageNumber: number
    totalPages: number
    totalCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
}

const API_URL = "/api"

export function useBookmarks(page: number = 1, pageSize: number = 10) {
    return useQuery<PaginatedResponse<ArticleBrief>>({
        queryKey: ["bookmarks", page, pageSize],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/Bookmarks?Page=${page}&PageSize=${pageSize}`)
            if (!response.ok) {
                throw new Error("Failed to fetch bookmarks")
            }
            return response.json()
        },
    })
}

export function useIsBookmarked(articleId: number) {
    return useQuery<boolean>({
        queryKey: ["bookmark", articleId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/Bookmarks/check/${articleId}`)
            if (!response.ok) {
                throw new Error("Failed to check bookmark status")
            }
            return response.json()
        },
        enabled: !!articleId,
    })
}

export function useAddBookmark() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (articleId: number) => {
            const response = await fetch(`${API_URL}/Bookmarks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ articleId }),
            })

            if (!response.ok) {
                throw new Error("Failed to add bookmark")
            }

            return response.json()
        },
        onSuccess: (_, articleId) => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
            queryClient.invalidateQueries({ queryKey: ["bookmark", articleId] })
        },
    })
}

export function useRemoveBookmark() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (articleId: number) => {
            const response = await fetch(`${API_URL}/Bookmarks/${articleId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to remove bookmark")
            }

            return response.json()
        },
        onSuccess: (_, articleId) => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
            queryClient.invalidateQueries({ queryKey: ["bookmark", articleId] })
        },
    })
}
