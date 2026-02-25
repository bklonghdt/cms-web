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
import { Plus, Pencil, Trash2, Loader2, FolderOpen, LayoutGrid, List, ImageIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
} from "@/lib/hooks/use-categories"
import { CategoryDialog } from "@/components/categories/category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"

type ViewMode = "list" | "grid"

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const handleCreate = () => {
    setSelectedCategory(null)
    setDialogOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: { name: string; code: string; imageUrl?: string | null; parentCategoryId?: number | null; displayOrder?: number }) => {
    try {
      if (selectedCategory) {
        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          ...data,
        })
      } else {
        await createCategory.mutateAsync(data)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save category:", error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteCategory.mutateAsync(selectedCategory.id)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("Failed to delete category:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục nội dung
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tất cả danh mục</CardTitle>
              <CardDescription>
                Danh sách tất cả danh mục trong hệ thống
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories && categories.length > 0 ? (
            viewMode === "list" ? (
              <ListView
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <GridView
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Không tìm thấy danh mục</p>
              <Button variant="outline" onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo danh mục đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={createCategory.isPending || updateCategory.isPending}
      />

      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selectedCategory}
        onConfirm={handleConfirmDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}

function ListView({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const getParentName = (parentId?: number | null) => {
    if (!parentId) return "—"
    const parent = categories.find((c) => c.id === parentId)
    return parent ? parent.name : "—"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Ảnh</TableHead>
          <TableHead>Tên</TableHead>
          <TableHead>Mã</TableHead>
          <TableHead>Danh mục cha</TableHead>
          <TableHead>Thứ tự hiển thị</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">
              <Link
                href={`/admin/content/articles?categoryId=${category.id}`}
                className="inline-flex items-center gap-1 hover:text-primary hover:underline"
              >
                {category.name}
                <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover/row:opacity-50" />
              </Link>
            </TableCell>
            <TableCell>
              <code className="rounded bg-muted px-2 py-1 text-xs">
                {category.code}
              </code>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {getParentName(category.parentCategoryId)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {category.displayOrder}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function GridView({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  const getParentName = (parentId?: number | null) => {
    if (!parentId) return null
    const parent = categories.find((c) => c.id === parentId)
    return parent ? parent.name : null
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const parentName = getParentName(category.parentCategoryId)
        return (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
          >
            {/* Image */}
            <div className="aspect-square w-full overflow-hidden bg-muted">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <Link
              href={`/admin/content/articles?categoryId=${category.id}`}
              className="block p-3 hover:bg-accent/50 transition-colors"
            >
              <h3 className="truncate text-sm font-semibold">{category.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <code className="rounded bg-muted px-1 py-0.5">{category.code}</code>
              </p>
              {parentName && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  ↳ {parentName}
                </p>
              )}
            </Link>

            {/* Action overlay */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-sm"
                onClick={() => onEdit(category)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 shadow-sm"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
