"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Upload } from "lucide-react";
import {
  useMedia,
  useUploadMedia,
  useDeleteMedia,
  MediaItem,
} from "@/lib/hooks/use-media";
import { MediaUploadDialog } from "@/components/media/media-upload-dialog";
import { MediaGrid } from "@/components/media/media-grid";
import { DeleteMediaDialog } from "@/components/media/delete-media-dialog";
import { Pagination } from "@/components/ui/pagination";

export default function MediaPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { data: mediaData, isLoading } = useMedia(
    mediaTypeFilter === "all" ? "" : mediaTypeFilter,
    currentPage,
    pageSize
  );
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();

  const handleUpload = () => {
    setUploadDialogOpen(true);
  };

  const handleDelete = (media: MediaItem) => {
    setSelectedMedia(media);
    setDeleteDialogOpen(true);
  };

  const handleUploadSubmit = async (files: File[]) => {
    try {
      for (const file of files) {
        await uploadMedia.mutateAsync(file);
      }
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Failed to upload media:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedMedia) {
      try {
        await deleteMedia.mutateAsync(selectedMedia.id);
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete media:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thư viện Media</h1>
          <p className="text-muted-foreground">Quản lý tệp Media của bạn</p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Tải lên
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="media-type-filter" className="text-sm font-medium">
            Loại:
          </label>
          <Select 
            value={mediaTypeFilter} 
            onValueChange={(value) => {
              setMediaTypeFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger id="media-type-filter" className="w-[180px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="image/">Hình ảnh</SelectItem>
              <SelectItem value="video/">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm font-medium">
            Số lượng:
          </label>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger id="page-size" className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tất cả Media</CardTitle>
          <CardDescription>
            {mediaData ? `Hiển thị ${mediaData.items.length} / ${mediaData.totalCount} tệp` : "Danh sách tất cả tệp Media trong hệ thống"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mediaData?.items && mediaData.items.length > 0 ? (
            <>
              <MediaGrid items={mediaData.items} onDelete={handleDelete} />
              <Pagination
                currentPage={currentPage}
                totalPages={mediaData.totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Không tìm thấy tệp Media
              </p>
              <Button variant="outline" onClick={handleUpload}>
                <Plus className="mr-2 h-4 w-4" />
                Tải lên tệp đầu tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUploadSubmit}
        isLoading={uploadMedia.isPending}
      />

      <DeleteMediaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        media={selectedMedia}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMedia.isPending}
      />
    </div>
  );
}
