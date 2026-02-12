"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2, Loader2, Shield } from "lucide-react"
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  Role,
} from "@/lib/hooks/use-roles"
import { RoleDialog } from "@/components/roles/role-dialog"
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog"

export default function RolesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const { data: roles, isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const handleCreate = () => {
    setSelectedRole(null)
    setDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: { name: string }) => {
    try {
      if (selectedRole) {
        await updateRole.mutateAsync({
          id: selectedRole.id,
          ...data,
        })
      } else {
        await createRole.mutateAsync(data)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save role:", error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedRole) {
      try {
        await deleteRole.mutateAsync(selectedRole.id)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("Failed to delete role:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vai trò</h1>
          <p className="text-muted-foreground">
            Quản lý vai trò người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm vai trò
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả vai trò</CardTitle>
          <CardDescription>
            Danh sách tất cả vai trò trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : roles && roles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {role.id}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Không tìm thấy vai trò</p>
              <Button variant="outline" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo vai trò đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={selectedRole}
        onSubmit={handleSubmit}
        isLoading={createRole.isPending || updateRole.isPending}
      />

      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        role={selectedRole}
        onConfirm={handleConfirmDelete}
        isLoading={deleteRole.isPending}
      />
    </div>
  )
}
