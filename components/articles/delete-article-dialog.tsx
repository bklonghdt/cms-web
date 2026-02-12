"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArticleBrief } from "@/lib/hooks/use-articles"

interface DeleteArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: ArticleBrief | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteArticleDialog({
  open,
  onOpenChange,
  article,
  onConfirm,
  isLoading,
}: DeleteArticleDialogProps) {
  if (!article) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Bài viết sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-1">{article.title}</p>
            <p className="text-xs text-muted-foreground">
              {article.categoryName || "Không có danh mục"} • {article.viewCount} lượt xem
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
