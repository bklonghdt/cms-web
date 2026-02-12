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
import { User } from "@/lib/hooks/use-users"
import { useRoles, Role } from "@/lib/hooks/use-roles"
import { Badge } from "@/components/ui/badge"
import { X, Check, ChevronsUpDown } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSubmit: (data: {
    userName: string
    email: string
    password?: string
    roles: string[]
  }) => void
  isLoading?: boolean
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading,
}: UserDialogProps) {
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [rolesOpen, setRolesOpen] = useState(false)

  const { data: roles, isLoading: isLoadingRoles } = useRoles()

  useEffect(() => {
    if (user) {
      setUserName(user.userName)
      setEmail(user.email)
      setPassword("")
      setSelectedRoles(user.roles)
    } else {
      setUserName("")
      setEmail("")
      setPassword("")
      setSelectedRoles([])
    }
  }, [user, open])

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName))
    } else {
      setSelectedRoles([...selectedRoles, roleName])
    }
  }

  const handleRemoveRole = (roleName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRoles(selectedRoles.filter((r) => r !== roleName))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      userName,
      email,
      password: user ? undefined : password,
      roles: selectedRoles,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Cập nhật thông tin người dùng"
                : "Tạo người dùng mới cho hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Tên đăng nhập *</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                required
              />
            </div>
            {!user && (
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required={!user}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Vai trò</Label>
              <Popover open={rolesOpen} onOpenChange={setRolesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={rolesOpen}
                    className="w-full justify-between min-h-10 h-auto"
                    disabled={isLoadingRoles}
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      {selectedRoles.length > 0 ? (
                        selectedRoles.map((roleName) => (
                          <Badge key={roleName} variant="secondary" className="mr-1">
                            {roleName}
                            <button
                              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onClick={(e) => handleRemoveRole(roleName, e)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground font-normal">
                          {isLoadingRoles ? "Đang tải..." : "Chọn vai trò..."}
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-64 overflow-auto">
                    {roles && roles.length > 0 ? (
                      roles.map((role) => {
                        const isSelected = selectedRoles.includes(role.name)
                        return (
                          <div
                            key={role.id}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent",
                              isSelected && "bg-accent"
                            )}
                            onClick={() => handleToggleRole(role.name)}
                          >
                            <span className="text-sm">{role.name}</span>
                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                          </div>
                        )
                      })
                    ) : (
                      <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        Không có vai trò nào
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
