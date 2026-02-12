"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useIsBookmarked } from "@/lib/hooks/use-bookmarks"

interface BookmarkButtonProps {
  articleId: number
  onToggle: (articleId: number, isBookmarked: boolean) => void
  isPending?: boolean
}

export function BookmarkButton({ articleId, onToggle, isPending }: BookmarkButtonProps) {
  const { data: isBookmarked, isLoading } = useIsBookmarked(articleId)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(articleId, isBookmarked || false)}
      disabled={isLoading || isPending}
      title={isBookmarked ? "Bỏ lưu" : "Lưu bài viết"}
    >
      <Bookmark
        className={`h-4 w-4 ${isBookmarked ? "fill-current text-yellow-500" : ""}`}
      />
    </Button>
  )
}
