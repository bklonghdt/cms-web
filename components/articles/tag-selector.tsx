"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown, Tags } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Tag } from "@/lib/hooks/use-tags"

interface TagSelectorProps {
  tags: Tag[]
  selectedTagIds: number[]
  onTagsChange: (tagIds: number[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function TagSelector({
  tags,
  selectedTagIds,
  onTagsChange,
  isLoading = false,
  placeholder = "Chọn thẻ...",
  className,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onTagsChange([...selectedTagIds, tagId])
    }
  }

  const handleRemoveTag = (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagsChange(selectedTagIds.filter((id) => id !== tagId))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-10 h-auto",
            className
          )}
          disabled={isLoading}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedTags.length > 0 ? (
              selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="mr-1 mb-0"
                >
                  {tag.name}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => handleRemoveTag(tag.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-normal">
                {isLoading ? "Đang tải..." : placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <div className="border-b px-3 py-2">
            <input
              type="text"
              placeholder="Tìm kiếm thẻ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-64 overflow-auto">
            {filteredTags.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                <Tags className="mx-auto mb-2 h-6 w-6" />
                Không tìm thấy thẻ nào
              </div>
            ) : (
              filteredTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id)
                return (
                  <div
                    key={tag.id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => handleToggleTag(tag.id)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">{tag.code}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
