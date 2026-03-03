"use client"

import { useState } from "react"
import { useArticleComments, useReplyComment, useDeleteComment, CommentDto } from "@/lib/hooks/use-comments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Trash2, Reply } from "lucide-react"

interface CommentsManagerProps {
  articleId: number
}

function CommentItem({ comment, articleId }: { comment: CommentDto, articleId: number }) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  
  const replyMutation = useReplyComment()
  const deleteMutation = useDeleteComment()

  const handleReply = async () => {
    if (!replyContent.trim()) return
    await replyMutation.mutateAsync({
      articleId,
      commentId: comment.id,
      content: replyContent
    })
    setIsReplying(false)
    setReplyContent("")
  }

  const handleDelete = async () => {
    if (confirm("Bạn có chắc muốn xoá bình luận này?")) {
      await deleteMutation.mutateAsync({ articleId, commentId: comment.id })
    }
  }

  return (
    <div className="border rounded-md p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{comment.authorName}</div>
          <div className="text-xs text-muted-foreground">{new Date(comment.created).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          {!comment.parentCommentId && (
            <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
              <Reply className="w-4 h-4 mr-2" /> Trả lời
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm border p-3 rounded bg-secondary/20">{comment.content}</div>

      {isReplying && (
        <div className="mt-4 space-y-2 py-2">
          <Textarea 
            placeholder="Nhập nội dung trả lời..." 
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>Huỷ</Button>
            <Button size="sm" onClick={handleReply} disabled={replyMutation.isPending}>Gửi trả lời</Button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4 border-l-2 border-primary/20 pl-6 ml-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} articleId={articleId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentsManager({ articleId }: CommentsManagerProps) {
  const { data: comments, isLoading } = useArticleComments(articleId)

  if (isLoading) {
    return <div>Đang tải bình luận...</div>
  }

  if (!comments || comments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> 
            Bình luận
          </CardTitle>
          <CardDescription>Bài viết này chưa có bình luận nào.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> 
          Bình luận ({comments.length})
        </CardTitle>
        <CardDescription>Quản lý bình luận của người dùng trên bài viết</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.map((comment: CommentDto) => (
          <CommentItem key={comment.id} comment={comment} articleId={articleId} />
        ))}
      </CardContent>
    </Card>
  )
}
