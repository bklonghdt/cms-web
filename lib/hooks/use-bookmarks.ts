import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/stores/auth-store"
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

function authHeaders(token: string | null): HeadersInit {
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useBookmarks(page: number = 1, pageSize: number = 10) {
    const token = useAuthStore((state) => state.token)

    return useQuery<PaginatedResponse<ArticleBrief>>({
        queryKey: ["bookmarks", page, pageSize],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/Bookmarks?Page=${page}&PageSize=${pageSize}`, {
                headers: authHeaders(token),
            })
            if (!response.ok) {
                throw new Error("Failed to fetch bookmarks")
            }
            return response.json()
        },
        enabled: !!token,
    })
}

export function useIsBookmarked(articleId: number) {
    const token = useAuthStore((state) => state.token)

    return useQuery<boolean>({
        queryKey: ["bookmark", articleId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/Bookmarks/check/${articleId}`, {
                headers: authHeaders(token),
            })
            if (!response.ok) {
                throw new Error("Failed to check bookmark status")
            }
            return response.json()
        },
        enabled: !!articleId && !!token,
    })
}

export function useAddBookmark() {
    const queryClient = useQueryClient()
    const token = useAuthStore((state) => state.token)

    return useMutation({
        mutationFn: async (articleId: number) => {
            const response = await fetch(`${API_URL}/Bookmarks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(token),
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
    const token = useAuthStore((state) => state.token)

    return useMutation({
        mutationFn: async (articleId: number) => {
            const response = await fetch(`${API_URL}/Bookmarks/${articleId}`, {
                method: "DELETE",
                headers: authHeaders(token),
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
