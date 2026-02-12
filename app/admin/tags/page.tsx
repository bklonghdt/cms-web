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
import { Plus, Pencil, Trash2, Loader2, Tag as TagIcon } from "lucide-react"
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  Tag,
} from "@/lib/hooks/use-tags"
import { TagDialog } from "@/components/tags/tag-dialog"
import { DeleteTagDialog } from "@/components/tags/delete-tag-dialog"

export default function TagsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  const { data: tags, isLoading } = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()

  const handleCreate = () => {
    setSelectedTag(null)
    setDialogOpen(true)
  }

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag)
    setDialogOpen(true)
  }

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async (data: { name: string; code: string; displayOrder?: number }) => {
    try {
      if (selectedTag) {
        await updateTag.mutateAsync({
          id: selectedTag.id,
          ...data,
        })
      } else {
        await createTag.mutateAsync(data)
      }
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save tag:", error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedTag) {
      try {
        await deleteTag.mutateAsync(selectedTag.id)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error("Failed to delete tag:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thẻ</h1>
          <p className="text-muted-foreground">
            Quản lý thẻ nội dung
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm thẻ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả thẻ</CardTitle>
          <CardDescription>
            Danh sách tất cả thẻ trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tags && tags.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Thứ tự hiển thị</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-muted-foreground" />
                        {tag.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-xs">
                        {tag.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tag.displayOrder}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tag)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tag)}
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
              <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Không tìm thấy thẻ</p>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo thẻ đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tag={selectedTag}
        onSubmit={handleSubmit}
        isLoading={createTag.isPending || updateTag.isPending}
      />

      <DeleteTagDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tag={selectedTag}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTag.isPending}
      />
    </div>
  )
}
