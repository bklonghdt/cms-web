"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  useCreateArticle,
  ArticleStatus,
  CreateArticleInput,
  ArticlePart,
} from "@/lib/hooks/use-articles"
import { useCategories } from "@/lib/hooks/use-categories"
import { useTags } from "@/lib/hooks/use-tags"
import { TagSelector } from "@/components/articles/tag-selector"
import { MediaPickerDialog } from "@/components/media/media-picker-dialog"
import { MediaItem } from "@/lib/hooks/use-media"
import { ArticlePartsManager } from "@/components/articles/article-parts-manager"
import Link from "next/link"
import { Image as ImageIcon, X } from "lucide-react"

export default function NewArticlePage() {
  const router = useRouter()
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: tags, isLoading: isLoadingTags } = useTags()
  const createArticle = useCreateArticle()

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const [formData, setFormData] = useState<CreateArticleInput & { parts: Omit<ArticlePart, "id">[], coverImageUrl?: string }>({
    title: "",
    slug: "",
    description: "",
    excerpt: "",
    metaTitle: "",
    metaDescription: "",
    coverImageId: undefined,
    coverImageUrl: undefined,
    categoryId: undefined,
    tagIds: [],
    parts: [],
    status: ArticleStatus.Draft,
    isFeatured: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title) {
      return
    }

    try {
      await createArticle.mutateAsync({
        ...formData,
        parts: formData.parts.map(p => ({
          type: p.type,
          order: p.order,
          content: p.content,
          mediaId: p.mediaId,
          caption: p.caption,
        })),
      })
      router.push("/admin/content/articles")
    } catch (error) {
      console.error("Failed to create article:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div id="create-article-header">
            <h1 className="text-3xl font-bold tracking-tight">Bài viết mới</h1>
            <p className="text-muted-foreground">
              Tạo bài viết mới
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={createArticle.isPending} id="save-article-btn">
          {createArticle.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Tạo bài viết
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card id="article-basic-info">
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

        <Card id="article-cover-image">
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

        <Card id="article-classification">
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
                <SelectTrigger id="article-category-select">
                  <SelectValue placeholder={isLoadingCategories ? "Đang tải danh mục..." : "Chọn danh mục"} />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
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

            <div className="grid gap-2" id="article-tags-selector">
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
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) as ArticleStatus })}
              >
                <SelectTrigger id="article-status-select">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ArticleStatus.Draft.toString()}>Bản nháp</SelectItem>
                  <SelectItem value={ArticleStatus.Published.toString()}>Đã xuất bản</SelectItem>
                  <SelectItem value={ArticleStatus.Archived.toString()}>Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2" id="article-featured-switch">
              <Switch
                id="featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
              <Label htmlFor="featured">Bài viết nổi bật</Label>
            </div>
          </CardContent>
        </Card>

        <div id="article-content-parts">
        <ArticlePartsManager
          parts={formData.parts || []}
          onChange={(parts) => setFormData({ ...formData, parts })}
          title={formData.title}
          description={formData.description}
        />
        </div>

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
