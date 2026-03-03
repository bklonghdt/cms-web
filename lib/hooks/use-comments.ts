import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/stores/auth-store"

export interface CommentDto {
    id: number
    articleId: number
    content: string
    authorId: string
    authorName: string
    created: string
    lastModified?: string
    parentCommentId?: number
    replies: CommentDto[]
}

const API_URL = "/api"

export function useArticleComments(articleId: number) {
    return useQuery<CommentDto[]>({
        queryKey: ["articles", articleId, "comments"],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/Articles/${articleId}/comments`)
            if (!response.ok) {
                throw new Error("Failed to fetch comments")
            }
            return response.json()
        },
        enabled: !!articleId,
    })
}

export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { articleId: number; content: string }) => {
            const response = await fetch(`${API_URL}/Articles/${data.articleId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: data.content }),
            })

            if (!response.ok) {
                throw new Error("Failed to create comment")
            }
            return response.json()
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["articles", variables.articleId, "comments"] })
        },
    })
}

export function useReplyComment() {
    const queryClient = useQueryClient()
    const token = useAuthStore((state) => state.token)

    return useMutation({
        mutationFn: async (data: { articleId: number; commentId: number; content: string }) => {
            const response = await fetch(`${API_URL}/Articles/comments/${data.commentId}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ content: data.content }),
            })

            if (!response.ok) {
                throw new Error("Failed to reply to comment")
            }
            return response.json()
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["articles", variables.articleId, "comments"] })
        },
    })
}

export function useDeleteComment() {
    const queryClient = useQueryClient()
    const token = useAuthStore((state) => state.token)

    return useMutation({
        mutationFn: async (data: { articleId: number; commentId: number }) => {
            const response = await fetch(`${API_URL}/Articles/comments/${data.commentId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            })

            if (!response.ok) {
                throw new Error("Failed to delete comment")
            }
            const text = await response.text()
            try {
                return text ? JSON.parse(text) : {}
            } catch (e) {
                return {}
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["articles", variables.articleId, "comments"] })
        },
    })
}
