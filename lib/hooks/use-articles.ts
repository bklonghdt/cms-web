import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export enum ArticleStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
  Scheduled = 3,
}

export enum ArticlePartType {
  Text = 0,
  Media = 1,
}

export interface ArticleTag {
  id: number
  code: string
  name: string
}

export interface ArticlePart {
  id?: number
  type: ArticlePartType
  order: number
  content?: string
  mediaId?: number
  mediaUrl?: string
  caption?: string
}

export interface ArticleBrief {
  id: number
  title: string
  slug: string
  description?: string
  excerpt?: string
  coverImageId?: number
  coverImageUrl?: string
  categoryId?: number
  categoryName?: string
  status: ArticleStatus
  publishedDate?: string
  scheduledPublishDate?: string
  isFeatured: boolean
  viewCount: number
  viewCountAnonymous: number
  viewCountAuthenticated: number
  likeCount: number
  dislikeCount: number
  authorName?: string
  created: string
  tagNames: string[]
}

export interface Article {
  id: number
  title: string
  slug: string
  description?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  coverImageId?: number
  coverImageUrl?: string
  categoryId?: number
  categoryName?: string
  status: ArticleStatus
  publishedDate?: string
  scheduledPublishDate?: string
  isFeatured: boolean
  viewCount: number
  viewCountAnonymous: number
  viewCountAuthenticated: number
  likeCount: number
  dislikeCount: number
  userReaction: number
  authorId?: string
  authorName?: string
  created: string
  lastModified?: string
  tags: ArticleTag[]
  parts: ArticlePart[]
}

export interface CreateArticleInput {
  title: string
  slug?: string
  description?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  coverImageId?: number
  categoryId?: number
  tagIds: number[]
  parts: Omit<ArticlePart, "id" | "mediaUrl">[]
  status: ArticleStatus
  isFeatured: boolean
  scheduledPublishDate?: string
}

export interface UpdateArticleInput {
  id: number
  title: string
  slug?: string
  description?: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  coverImageId?: number
  categoryId?: number
  tagIds: number[]
  parts: Omit<ArticlePart, "id" | "mediaUrl">[]
  status: ArticleStatus
  isFeatured: boolean
  scheduledPublishDate?: string
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

export function useArticles() {
  return useQuery<ArticleBrief[]>({
    queryKey: ["articles"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Articles/paginated?PageNumber=1&PageSize=100&SortDescending=true`)
      if (!response.ok) {
        throw new Error("Failed to fetch articles")
      }
      const data: PaginatedResponse<ArticleBrief> = await response.json()
      return data.items
    },
  })
}

export function useArticle(id: number) {
  return useQuery<Article>({
    queryKey: ["article", id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/Articles/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch article")
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateArticleInput) => {
      const response = await fetch(`${API_URL}/Articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create article")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] })
    },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateArticleInput) => {
      const response = await fetch(`${API_URL}/Articles/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update article")
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] })
      queryClient.invalidateQueries({ queryKey: ["article", variables.id] })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/Articles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete article")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] })
    },
  })
}

export function usePublishArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/Articles/${id}/publish`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to publish article")
      }

      return response.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] })
      queryClient.invalidateQueries({ queryKey: ["article", id] })
    },
  })
}
