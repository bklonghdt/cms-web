"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import {
  useArticle,
  useUpdateArticle,
  ArticleStatus,
  UpdateArticleInput,
  ArticlePart,
} from "@/lib/hooks/use-articles"
import { useCategories } from "@/lib/hooks/use-categories"
import { useTags } from "@/lib/hooks/use-tags"
import { TagSelector } from "@/components/articles/tag-selector"
import { MediaPickerDialog } from "@/components/media/media-picker-dialog"
import { MediaItem } from "@/lib/hooks/use-media"
import { ArticlePartsManager } from "@/components/articles/article-parts-manager"
import { CommentsManager } from "@/components/articles/comments-manager"
import Link from "next/link"
import { Image as ImageIcon, X } from "lucide-react"
import { NavigationGuard } from "@/components/navigation-guard"

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = parseInt(params.id as string)

  const { data: article, isLoading: isLoadingArticle } = useArticle(articleId)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const leafCategories = categories?.filter(
    (cat) => !categories.some((c) => c.parentCategoryId === cat.id)
  )
  const { data: tags, isLoading: isLoadingTags } = useTags()
  const updateArticle = useUpdateArticle()

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  // Helper to format date-time string for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch (e) {
      console.error("Invalid date string:", dateString)
      return ""
    }
  }

  const [formData, setFormData] = useState<(Partial<UpdateArticleInput> & { parts?: Omit<ArticlePart, "id">[], coverImageUrl?: string }) | null>(null)

  const [initialData, setInitialData] = useState<string | null>(null)
  const isDirty = initialData !== null && JSON.stringify(formData) !== initialData

  useEffect(() => {
    if (article) {
      const data = {
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description || "",
        excerpt: article.excerpt || "",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        coverImageId: article.coverImageId,
        coverImageUrl: article.coverImageUrl,
        categoryId: article.categoryId,
        tagIds: (article.tags ?? []).map(t => t.id),
        parts: (article.parts ?? []).map(p => ({
          type: p.type,
          order: p.order,
          content: p.content,
          mediaId: p.mediaId,
          mediaUrl: p.mediaUrl,
          caption: p.caption,
        })),
        status: article.status,
        isFeatured: article.isFeatured,
        scheduledPublishDate: formatDateTimeLocal(
          article.status === ArticleStatus.Scheduled ? article.scheduledPublishDate : article.publishedDate
        ),
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(data)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialData(JSON.stringify(data))
    }
  }, [article])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData || !formData.id || !formData.title) {
      return
    }

    try {
      await updateArticle.mutateAsync({
        id: formData.id,
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        excerpt: formData.excerpt,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        coverImageId: formData.coverImageId,
        categoryId: formData.categoryId,
        tagIds: formData.tagIds || [],
        parts: (formData.parts || []).map(p => ({
          type: p.type,
          order: p.order,
          content: p.content,
          mediaId: p.mediaId,
          caption: p.caption,
        })),
        status: formData.status ?? ArticleStatus.Draft,
        isFeatured: formData.isFeatured || false,
        scheduledPublishDate: (formData.status === ArticleStatus.Scheduled || formData.status === ArticleStatus.Published) && formData.scheduledPublishDate
          ? new Date(formData.scheduledPublishDate).toISOString()
          : undefined,
      })
      router.push("/admin/content/articles")
    } catch (error) {
      console.error("Failed to update article:", error)
    }
  }

  if (isLoadingArticle || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <NavigationGuard isDirty={isDirty} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa bài viết</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin bài viết
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={updateArticle.isPending}>
          {updateArticle.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Nhập thông tin cơ bản của bài viết
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Đường dẫn</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="duong-dan-bai-viet (tự động tạo nếu để trống)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn"
                rows={3}
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
            <CardDescription>
              Chọn ảnh đại diện cho bài viết
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formData.coverImageUrl ? (
              <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                <img
                  src={formData.coverImageUrl}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={() => setFormData({ ...formData, coverImageId: undefined, coverImageUrl: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="flex aspect-video w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed hover:bg-muted/50"
                onClick={() => setMediaPickerOpen(true)}
              >
                <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chọn ảnh đại diện</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân loại</CardTitle>
            <CardDescription>
              Phân loại và gắn thẻ cho bài viết
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={formData.categoryId?.toString()}
                onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                disabled={isLoadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"} />
                </SelectTrigger>
                <SelectContent>
                  {leafCategories && leafCategories.length > 0 ? (
                    leafCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Không có danh mục
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Thẻ</Label>
              <TagSelector
                tags={tags || []}
                selectedTagIds={formData.tagIds || []}
                onTagsChange={(tagIds) => setFormData({ ...formData, tagIds })}
                isLoading={isLoadingTags}
                placeholder="Chọn thẻ cho bài viết..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái *</Label>
              <Select
                value={formData.status !== undefined ? formData.status.toString() : ""}
                onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) as ArticleStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ArticleStatus.Draft.toString()}>Bản nháp</SelectItem>
                  <SelectItem value={ArticleStatus.Published.toString()}>Đã xuất bản</SelectItem>
                  <SelectItem value={ArticleStatus.Archived.toString()}>Đã lưu trữ</SelectItem>
                  <SelectItem value={ArticleStatus.Scheduled.toString()}>Lên lịch xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
              <Label htmlFor="featured">Bài viết nổi bật</Label>
            </div>

            {(formData.status === ArticleStatus.Scheduled || formData.status === ArticleStatus.Published) && (
              <div className="grid gap-2">
                <Label htmlFor="scheduledPublishDate">Ngày giờ xuất bản</Label>
                <Input
                  id="scheduledPublishDate"
                  type="datetime-local"
                  value={formData.scheduledPublishDate ?? ""}
                  onChange={(e) => setFormData({ ...formData, scheduledPublishDate: e.target.value || undefined })}
                />
                <p className="text-xs text-muted-foreground">
                  Bài viết sẽ tự động xuất bản vào thời điểm này (nếu chọn ngày trong quá khứ bài viết sẽ được xuất bản ngay).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <ArticlePartsManager
          parts={formData.parts || []}
          onChange={(parts) => setFormData({ ...formData, parts })}
          title={formData.title}
          description={formData.description}
          authorName={article?.authorName}
          publishedDate={article?.publishedDate}
        />

        <Card id="article-excerpt">
          <CardHeader>
            <CardTitle>Trích dẫn</CardTitle>
            <CardDescription>
              Đoạn văn ngắn giới thiệu hoặc tóm tắt bài viết của bạn. Nếu để trống hệ thống có thể sẽ lấy tự động.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Đoạn trích ngắn để hiển thị"
              rows={4}
            />
          </CardContent>
        </Card>
      </form>

      {/* Comment Section (Admin only displays comments for an existing article if they are editing) */}
      <div className="mt-8">
        <CommentsManager articleId={articleId} />
      </div>

      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media: MediaItem) => {
          setFormData({
            ...formData,
            coverImageId: parseInt(media.id),
            coverImageUrl: media.url,
          })
        }}
        selectedMediaId={formData.coverImageId?.toString()}
      />
    </div>
  )
}
