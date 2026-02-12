"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Category } from "@/lib/hooks/use-categories"
import { MediaPickerDialog } from "@/components/media/media-picker-dialog"
import { MediaItem } from "@/lib/hooks/use-media"
import { ImageIcon, Upload, X } from "lucide-react"

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: { name: string; code: string; imageUrl?: string | null; displayOrder?: number }) => void
  isLoading?: boolean
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading,
}: CategoryDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [displayOrder, setDisplayOrder] = useState("0")

  useEffect(() => {
    if (category) {
      setName(category.name)
      setCode(category.code)
      setImageUrl(category.imageUrl || "")
      setDisplayOrder(category.displayOrder.toString())
    } else {
      setName("")
      setCode("")
      setImageUrl("")
      setDisplayOrder("0")
    }
  }, [category, open])

  const generateCode = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!category) {
      setCode(generateCode(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      code,
      imageUrl: imageUrl.trim() || null,
      displayOrder: parseInt(displayOrder) || 0,
    })
  }

  const [imageError, setImageError] = useState(false)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [imageUrl])

  const handleMediaSelect = (media: MediaItem) => {
    setImageUrl(media.url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</DialogTitle>
            <DialogDescription>
              {category ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới cho nội dung của bạn"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nhập tên danh mục"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Mã *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ma-danh-muc"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Hình ảnh</Label>
              {imageUrl.trim() ? (
                <div className="flex items-start gap-3">
                  <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
                    {!imageError ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaPickerOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Thay đổi
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageUrl("")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Xóa ảnh
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 w-full border-dashed"
                  onClick={() => setMediaPickerOpen(true)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Chọn hoặc tải lên hình ảnh</span>
                  </div>
                </Button>
              )}
              <MediaPickerDialog
                open={mediaPickerOpen}
                onOpenChange={setMediaPickerOpen}
                onSelect={handleMediaSelect}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
