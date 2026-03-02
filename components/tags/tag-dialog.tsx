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
import { Tag } from "@/lib/hooks/use-tags"

interface TagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: Tag | null
  onSubmit: (data: { name: string; code: string; displayOrder?: number }) => void
  isLoading?: boolean
}

export function TagDialog({
  open,
  onOpenChange,
  tag,
  onSubmit,
  isLoading,
}: TagDialogProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [displayOrder, setDisplayOrder] = useState("0")

  useEffect(() => {
    if (tag) {
      setName(tag.name)
      setCode(tag.code)
      setDisplayOrder(tag.displayOrder?.toString() || "0")
    } else {
      setName("")
      setCode("")
      setDisplayOrder("0")
    }
  }, [tag, open])

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
    if (!tag) {
      setCode(generateCode(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      code,
      displayOrder: parseInt(displayOrder) || 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{tag ? "Chỉnh sửa thẻ" : "Thêm thẻ"}</DialogTitle>
            <DialogDescription>
              {tag ? "Cập nhật thông tin thẻ" : "Tạo thẻ mới cho nội dung của bạn"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nhập tên thẻ"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Mã *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ma-the"
                required
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
