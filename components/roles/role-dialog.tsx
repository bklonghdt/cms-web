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
import { Role } from "@/lib/hooks/use-roles"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSubmit: (data: { name: string }) => void
  isLoading?: boolean
}

export function RoleDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  isLoading,
}: RoleDialogProps) {
  const [name, setName] = useState("")

  useEffect(() => {
    if (role) {
      setName(role.name)
    } else {
      setName("")
    }
  }, [role, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{role ? "Chỉnh sửa vai trò" : "Thêm vai trò"}</DialogTitle>
            <DialogDescription>
              {role ? "Cập nhật thông tin vai trò" : "Tạo vai trò mới cho hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên vai trò *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên vai trò"
                required
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
