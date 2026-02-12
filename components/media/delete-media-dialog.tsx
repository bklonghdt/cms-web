"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaItem } from "@/lib/hooks/use-media"
import { AlertTriangle } from "lucide-react"

interface DeleteMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  media: MediaItem | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DeleteMediaDialog({
  open,
  onOpenChange,
  media,
  onConfirm,
  isLoading,
}: DeleteMediaDialogProps) {
  if (!media) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Media
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-1">{media.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {media.mimeType} • {Math.round(media.fileSize / 1024)} KB
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
