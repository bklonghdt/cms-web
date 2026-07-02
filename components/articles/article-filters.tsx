"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { ArticleStatus } from "@/lib/hooks/use-articles"
import { useCategories } from "@/lib/hooks/use-categories"

export interface ArticleFiltersState {
  search: string
  status: ArticleStatus | "all"
  categoryId: number | "all"
  isFeatured: boolean | "all"
}

interface ArticleFiltersProps {
  filters: ArticleFiltersState
  onFiltersChange: (filters: ArticleFiltersState) => void
}

export const defaultFilters: ArticleFiltersState = {
  search: "",
  status: "all",
  categoryId: "all",
  isFeatured: "all",
}

export function ArticleFilters({ filters, onFiltersChange }: ArticleFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? "all" : (parseInt(value) as ArticleStatus),
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoryId: value === "all" ? "all" : parseInt(value),
    })
  }

  const handleFeaturedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isFeatured: value === "all" ? "all" : value === "true",
    })
  }

  const handleClearFilters = () => {
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.status !== "all") count++
    if (filters.categoryId !== "all") count++
    if (filters.isFeatured !== "all") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const getStatusLabel = (status: ArticleStatus | "all") => {
    if (status === "all") return null
    switch (status) {
      case ArticleStatus.Draft:
        return "Bản nháp"
      case ArticleStatus.Published:
        return "Đã xuất bản"
      case ArticleStatus.Archived:
        return "Đã lưu trữ"
      case ArticleStatus.Scheduled:
        return "Lên lịch"
      default:
        return null
    }
  }

  const getCategoryLabel = (categoryId: number | "all") => {
    if (categoryId === "all") return null
    return categories?.find((c) => c.id === categoryId)?.name || null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề, danh mục, tác giả..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Bộ lọc nâng cao</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>

              <Separator />

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={filters.status === "all" ? "all" : filters.status.toString()}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value={ArticleStatus.Draft.toString()}>Bản nháp</SelectItem>
                    <SelectItem value={ArticleStatus.Published.toString()}>Đã xuất bản</SelectItem>
                    <SelectItem value={ArticleStatus.Archived.toString()}>Đã lưu trữ</SelectItem>
                    <SelectItem value={ArticleStatus.Scheduled.toString()}>Lên lịch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={filters.categoryId === "all" ? "all" : filters.categoryId.toString()}
                  onValueChange={handleCategoryChange}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Tất cả danh mục"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Featured Filter */}
              <div className="space-y-2">
                <Label>Nổi bật</Label>
                <Select
                  value={filters.isFeatured === "all" ? "all" : filters.isFeatured.toString()}
                  onValueChange={handleFeaturedChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Bài viết nổi bật</SelectItem>
                    <SelectItem value="false">Bài viết thường</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {(activeFiltersCount > 0 || filters.search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Đang lọc:</span>

          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Tìm kiếm: "{filters.search}"
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Trạng thái: {getStatusLabel(filters.status)}
              <button
                onClick={() => onFiltersChange({ ...filters, status: "all" })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.categoryId !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Danh mục: {getCategoryLabel(filters.categoryId)}
              <button
                onClick={() => onFiltersChange({ ...filters, categoryId: "all" })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.isFeatured !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.isFeatured ? "Nổi bật" : "Thường"}
              <button
                onClick={() => onFiltersChange({ ...filters, isFeatured: "all" })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(activeFiltersCount > 0 || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-xs"
            >
              Xóa tất cả
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
