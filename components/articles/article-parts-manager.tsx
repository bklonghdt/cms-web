"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditor } from "@/components/ui/tiptap-editor"
import { GripVertical, Trash2, Type, Image as ImageIcon, ImagePlus, Eye, User, Calendar, Smartphone, Tablet, Monitor } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ArticlePart, ArticlePartType } from "@/lib/hooks/use-articles"
import { MediaPickerDialog } from "@/components/media/media-picker-dialog"
import { MediaItem } from "@/lib/hooks/use-media"

interface ArticlePartsManagerProps {
  parts: Omit<ArticlePart, "id">[]
  onChange: (parts: Omit<ArticlePart, "id">[]) => void
  title?: string
  description?: string
  authorName?: string
  publishedDate?: string
}

interface SortablePartItemProps {
  part: Omit<ArticlePart, "id">
  index: number
  mediaPreviewUrl?: string
  onUpdate: (index: number, part: Omit<ArticlePart, "id">) => void
  onDelete: (index: number) => void
  onOpenMediaPicker: (index: number) => void
}

function SortablePartItem({
  part,
  index,
  mediaPreviewUrl,
  onUpdate,
  onDelete,
  onOpenMediaPicker,
}: SortablePartItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `part-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start p-4 border rounded-lg bg-card"
    >
      <button
        className="mt-2 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          {part.type === ArticlePartType.Text ? (
            <Type className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className="text-sm font-medium">
            {part.type === ArticlePartType.Text ? "Văn bản" : "Hình ảnh"}
          </Label>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </div>

        {part.type === ArticlePartType.Text ? (
          <div className="grid gap-2">
            <Label>Nội dung</Label>
            <TiptapEditor
              content={part.content || ""}
              onChange={(content) => onUpdate(index, { ...part, content })}
              placeholder="Nhập nội dung văn bản..."
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Hình ảnh</Label>
              {(mediaPreviewUrl || part.mediaUrl) ? (
                <div className="relative group">
                  <img
                    src={mediaPreviewUrl || part.mediaUrl}
                    alt="Media preview"
                    className="w-full max-h-48 object-cover rounded-md border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenMediaPicker(index)}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Đổi hình ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 border-dashed"
                  onClick={() => onOpenMediaPicker(index)}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="h-8 w-8" />
                    <span>Chọn hình ảnh từ thư viện</span>
                  </div>
                </Button>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`part-caption-${index}`}>Chú thích</Label>
              <Input
                id={`part-caption-${index}`}
                value={part.caption || ""}
                onChange={(e) => onUpdate(index, { ...part, caption: e.target.value })}
                placeholder="Nhập chú thích cho hình ảnh..."
              />
            </div>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(index)}
        className="mt-2"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

interface ArticlePreviewProps {
  parts: Omit<ArticlePart, "id">[]
  mediaPreviewUrls: Record<number, string>
  title?: string
  description?: string
  authorName?: string
  publishedDate?: string
}

function ArticlePreview({
  parts,
  mediaPreviewUrls,
  title,
  description,
  authorName,
  publishedDate,
}: ArticlePreviewProps) {
  const hasMetadata = title || description || authorName || publishedDate
  const hasContent = parts.length > 0

  if (!hasMetadata && !hasContent) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Xem trước nội dung sẽ hiển thị ở đây
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {/* Article Header */}
      {hasMetadata && (
        <header className="mb-6 pb-4 border-b">
          {title ? (
            <h1 className="text-2xl font-bold mb-2 leading-tight">{title}</h1>
          ) : (
            <h1 className="text-2xl font-bold mb-2 text-muted-foreground italic">
              Chưa có tiêu đề
            </h1>
          )}

          {description && (
            <p className="text-muted-foreground leading-relaxed mb-3">
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {authorName && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{authorName}</span>
              </div>
            )}
            {publishedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(publishedDate)}</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Article Content */}
      {parts.map((part, index) => (
        <div key={index} className="mb-4">
          {part.type === ArticlePartType.Text ? (
            part.content ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            ) : (
              <p className="text-muted-foreground italic">Chưa có nội dung...</p>
            )
          ) : (mediaPreviewUrls[index] || part.mediaUrl) ? (
            <figure className="my-4">
              <img
                src={mediaPreviewUrls[index] || part.mediaUrl}
                alt={part.caption || `Hình ảnh ${index + 1}`}
                className="w-full rounded-lg"
              />
              {part.caption && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                  {part.caption}
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-muted-foreground text-sm">
              Chưa chọn hình ảnh
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ArticlePartsManager({
  parts,
  onChange,
  title,
  description,
  authorName,
  publishedDate,
}: ArticlePartsManagerProps) {
  const [mediaPickerIndex, setMediaPickerIndex] = useState<number | null>(null)
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<Record<number, string>>({})
  const [previewMode, setPreviewMode] = useState<"mobile" | "tablet" | "desktop">("desktop")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace("part-", ""))
      const newIndex = parseInt(over.id.toString().replace("part-", ""))

      const newParts = arrayMove(parts, oldIndex, newIndex).map((part, idx) => ({
        ...part,
        order: idx,
      }))

      onChange(newParts)

      // Reorder preview URLs to match new part positions
      const urlsArray = parts.map((_, idx) => mediaPreviewUrls[idx])
      const reorderedUrls = arrayMove(urlsArray, oldIndex, newIndex)
      const newPreviewUrls: Record<number, string> = {}
      reorderedUrls.forEach((url, idx) => {
        if (url) newPreviewUrls[idx] = url
      })
      setMediaPreviewUrls(newPreviewUrls)
    }
  }

  const handleAddPart = (type: ArticlePartType) => {
    const newPart: Omit<ArticlePart, "id"> = {
      type,
      order: parts.length,
      content: type === ArticlePartType.Text ? "" : undefined,
      mediaId: type === ArticlePartType.Media ? undefined : undefined,
      mediaUrl: undefined,
      caption: type === ArticlePartType.Media ? "" : undefined,
    }
    onChange([...parts, newPart])
  }

  const handleUpdatePart = (index: number, updatedPart: Omit<ArticlePart, "id">) => {
    const newParts = [...parts]
    newParts[index] = updatedPart
    onChange(newParts)
  }

  const handleDeletePart = (index: number) => {
    const newParts = parts.filter((_, i) => i !== index).map((part, idx) => ({
      ...part,
      order: idx,
    }))
    onChange(newParts)

    // Clean up preview URLs - shift indices for parts after the deleted one
    const newPreviewUrls: Record<number, string> = {}
    Object.entries(mediaPreviewUrls).forEach(([key, url]) => {
      const idx = parseInt(key)
      if (idx < index) {
        newPreviewUrls[idx] = url
      } else if (idx > index) {
        newPreviewUrls[idx - 1] = url
      }
    })
    setMediaPreviewUrls(newPreviewUrls)
  }

  const handleMediaSelect = (media: MediaItem) => {
    if (mediaPickerIndex === null) return

    const updatedPart = {
      ...parts[mediaPickerIndex],
      mediaId: parseInt(media.id),
      mediaUrl: media.url,
    }

    const newParts = [...parts]
    newParts[mediaPickerIndex] = updatedPart
    onChange(newParts)

    // Also store in preview URLs for immediate display (faster than re-render from parts)
    setMediaPreviewUrls((prev) => ({
      ...prev,
      [mediaPickerIndex]: media.url,
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Section */}
      <Card>
        <CardHeader>
          <CardTitle>Nội dung bài viết</CardTitle>
          <CardDescription>
            Quản lý các phần của bài viết. Kéo thả để sắp xếp thứ tự.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {parts.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={parts.map((_, idx) => `part-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {parts.map((part, index) => (
                    <SortablePartItem
                      key={`part-${index}`}
                      part={part}
                      index={index}
                      mediaPreviewUrl={mediaPreviewUrls[index]}
                      onUpdate={handleUpdatePart}
                      onDelete={handleDeletePart}
                      onOpenMediaPicker={setMediaPickerIndex}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có phần nào. Thêm phần đầu tiên bên dưới.
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddPart(ArticlePartType.Text)}
              className="flex-1"
            >
              <Type className="mr-2 h-4 w-4" />
              Thêm văn bản
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddPart(ArticlePartType.Media)}
              className="flex-1"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Thêm hình ảnh
            </Button>
          </div>

          <MediaPickerDialog
            open={mediaPickerIndex !== null}
            onOpenChange={(open) => {
              if (!open) setMediaPickerIndex(null)
            }}
            onSelect={handleMediaSelect}
            selectedMediaId={
              mediaPickerIndex !== null && parts[mediaPickerIndex]?.mediaId
                ? parts[mediaPickerIndex].mediaId!.toString()
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="lg:sticky lg:top-4 lg:self-start">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Xem trước
              </CardTitle>
              <CardDescription>
                Xem trước nội dung bài viết khi hiển thị
              </CardDescription>
            </div>
            <ToggleGroup
              type="single"
              value={previewMode}
              onValueChange={(value) => {
                if (value) setPreviewMode(value as "mobile" | "tablet" | "desktop")
              }}
              className="border rounded-lg"
            >
              <ToggleGroupItem value="mobile" aria-label="Mobile" title="Mobile (375px)">
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" aria-label="Tablet" title="Tablet (768px)">
                <Tablet className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Desktop" title="Desktop (100%)">
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          <div
            className={`mx-auto transition-all duration-300 ${
              previewMode === "mobile"
                ? "w-80 h-[600px] border rounded-2xl bg-background shadow-lg overflow-hidden"
                : previewMode === "tablet"
                  ? "w-full h-[800px] border rounded-xl bg-background shadow-lg overflow-hidden"
                  : "w-full max-h-[800px] overflow-y-auto"
            }`}
          >
            <div
              className={
                previewMode !== "desktop"
                  ? "h-full overflow-y-auto p-4"
                  : ""
              }
            >
              <ArticlePreview
                parts={parts}
                mediaPreviewUrls={mediaPreviewUrls}
                title={title}
                description={description}
                authorName={authorName}
                publishedDate={publishedDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
