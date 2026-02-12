"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2, Eye, FileText, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react"
import {
  useArticles,
  useDeleteArticle,
  usePublishArticle,
  ArticleBrief,
  ArticleStatus,
} from "@/lib/hooks/use-articles"
import { useAddBookmark, useRemoveBookmark, useIsBookmarked } from "@/lib/hooks/use-bookmarks"
import { DeleteArticleDialog } from "@/components/articles/delete-article-dialog"
import { BookmarkButton } from "@/components/articles/bookmark-button"
import { ArticleFilters, ArticleFiltersState, defaultFilters } from "@/components/articles/article-filters"
import Link from "next/link"

export default function ArticlesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<ArticleBrief | null>(null)
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ArticleFiltersState>(() => {
    const categoryId = searchParams.get("categoryId")
    return {
      ...defaultFilters,
      categoryId: categoryId ? parseInt(categoryId) : "all",
    }
  })

  const { data: articles, isLoading } = useArticles()

  const filteredArticles = articles?.filter((article) => {
    // Text search filter
    if (filters.search) {
      const query = filters.search.toLowerCase()
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.categoryName?.toLowerCase().includes(query) ||
        article.authorName?.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status !== "all" && article.status !== filters.status) {
      return false
    }

    // Category filter
    if (filters.categoryId !== "all" && article.categoryId !== filters.categoryId) {
      return false
    }

    // Featured filter
    if (filters.isFeatured !== "all" && article.isFeatured !== filters.isFeatured) {
      return false
    }

    return true
  })
  const deleteArticle = useDeleteArticle()
  const publishArticle = usePublishArticle()
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()

  const handleDelete = (article: ArticleBrief) => {
    setSelectedArticle(article)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedArticle) {
      try {
        await deleteArticle.mutateAsync(selectedArticle.id)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("Failed to delete article:", error)
      }
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await publishArticle.mutateAsync(id)
    } catch (error) {
      console.error("Failed to publish article:", error)
    }
  }

  const handleToggleBookmark = async (articleId: number, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(articleId)
      } else {
        await addBookmark.mutateAsync(articleId)
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
    }
  }

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.Published:
        return <Badge className="bg-green-500 hover:bg-green-600">Đã xuất bản</Badge>
      case ArticleStatus.Draft:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">Bản nháp</Badge>
      case ArticleStatus.Archived:
        return <Badge variant="destructive">Đã lưu trữ</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
          <p className="text-muted-foreground">
            Quản lý bài viết của bạn
          </p>
        </div>
        <Link href="/admin/content/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm bài viết
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Tất cả bài viết</CardTitle>
              <CardDescription>
                Danh sách tất cả bài viết trong hệ thống
              </CardDescription>
            </div>
            <ArticleFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredArticles && filteredArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead>Tổng lượt xem</TableHead>
                  <TableHead>Lượt xem (Auth)</TableHead>
                  <TableHead>Lượt xem (Guest)</TableHead>
                  <TableHead>Thích</TableHead>
                  <TableHead>Không thích</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {article.isFeatured && (
                          <FileText className="h-4 w-4 text-yellow-500" />
                        )}
                        {article.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.categoryName || "-"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {article.viewCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {article.viewCountAuthenticated}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {article.viewCountAnonymous}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        {article.likeCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ThumbsDown className="h-3 w-3" />
                        {article.dislikeCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.authorName || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {article.status === ArticleStatus.Draft && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(article.id)}
                            disabled={publishArticle.isPending}
                          >
                            Xuất bản
                          </Button>
                        )}
                        <Link href={`/admin/content/articles/${article.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <BookmarkButton
                          articleId={article.id}
                          onToggle={handleToggleBookmark}
                          isPending={addBookmark.isPending || removeBookmark.isPending}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {filters.search || filters.status !== "all" || filters.categoryId !== "all" || filters.isFeatured !== "all"
                  ? "Không tìm thấy bài viết phù hợp với bộ lọc"
                  : "Không tìm thấy bài viết"}
              </p>
              {filters.search === "" && filters.status === "all" && filters.categoryId === "all" && filters.isFeatured === "all" && (
                <Link href="/admin/content/articles/new">
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo bài viết đầu tiên
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteArticleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        article={selectedArticle}
        onConfirm={handleConfirmDelete}
        isLoading={deleteArticle.isPending}
      />
    </div>
  )
}
