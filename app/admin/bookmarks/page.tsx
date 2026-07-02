"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, FileText, Bookmark } from "lucide-react"
import { useBookmarks, useRemoveBookmark } from "@/lib/hooks/use-bookmarks"
import { ArticleStatus } from "@/lib/hooks/use-articles"
import Link from "next/link"

export default function BookmarksPage() {
  const [page, setPage] = useState(1)
  const { data: bookmarksData, isLoading } = useBookmarks(page, 20)
  const removeBookmark = useRemoveBookmark()

  const handleRemoveBookmark = async (articleId: number) => {
    try {
      await removeBookmark.mutateAsync(articleId)
    } catch (error) {
      console.error("Failed to remove bookmark:", error)
    }
  }

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.Published:
        return <Badge variant="default">Đã xuất bản</Badge>
      case ArticleStatus.Draft:
        return <Badge variant="secondary">Bản nháp</Badge>
      case ArticleStatus.Archived:
        return <Badge variant="outline">Đã lưu trữ</Badge>
      case ArticleStatus.Scheduled:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Lên lịch</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài viết đã lưu</h1>
          <p className="text-muted-foreground">
            Quản lý các bài viết bạn đã đánh dấu
          </p>
        </div>
        <Bookmark className="h-8 w-8 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết đã lưu</CardTitle>
          <CardDescription>
            {bookmarksData ? `${bookmarksData.totalCount} bài viết` : "Đang tải..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookmarksData && bookmarksData.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookmarksData.items.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {article.isFeatured && (
                            <FileText className="h-4 w-4 text-yellow-500" />
                          )}
                          <Link
                            href={`/admin/content/articles/${article.id}`}
                            className="hover:underline"
                          >
                            {article.title}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.categoryName || "-"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(article.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(article.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBookmark(article.id)}
                          disabled={removeBookmark.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {bookmarksData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!bookmarksData.hasPreviousPage}
                  >
                    Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {bookmarksData.pageNumber} / {bookmarksData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!bookmarksData.hasNextPage}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Bạn chưa lưu bài viết nào
              </p>
              <Link href="/admin/content/articles">
                <Button variant="outline">
                  Xem danh sách bài viết
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
