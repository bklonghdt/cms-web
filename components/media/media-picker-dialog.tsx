"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaItem, useMedia, useUploadMedia } from "@/lib/hooks/use-media";
import { cn } from "@/lib/utils";
import { Check, Loader2, Search, Upload, X, Image as ImageIcon, FileIcon } from "lucide-react";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaItem) => void;
  selectedMediaId?: string;
}

interface LazyImageProps {
  src: string;
  thumbnailSrc?: string;
  alt: string;
  className?: string;
}

function LazyImage({ src, thumbnailSrc, alt, className }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" },
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const imageSrc = isInView ? src : thumbnailSrc || src;

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        className,
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-50",
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setIsLoaded(true)}
    />
  );
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedMediaId,
}: MediaPickerDialogProps) {
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const { data: media, isLoading } = useMedia(mediaTypeFilter === "all" ? "" : mediaTypeFilter);
  const uploadMedia = useUploadMedia();
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      if (selectedMediaId && media?.items) {
        const preselected = media.items.find((m) => m.id === selectedMediaId);
        setSelected(preselected || null);
      } else {
        setSelected(null);
      }
      setSearchQuery("");
      setMediaTypeFilter("");
      setActiveTab("library");
      setSelectedFile(null);
    }
  }, [open, selectedMediaId, media]);

  const filteredMedia = media?.items.filter((item) => {
    if (!searchQuery) return true;
    return item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isImage = (mimeType: string) => {
    return mimeType.startsWith("image/");
  };

  const isVideo = (mimeType: string) => {
    return mimeType.startsWith("video/");
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onOpenChange(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndSelect = async () => {
    if (!selectedFile) return;

    try {
      const uploadedMedia = await uploadMedia.mutateAsync(selectedFile);
      onSelect(uploadedMedia);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to upload media:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn hình ảnh</DialogTitle>
          <DialogDescription>
            Chọn từ thư viện hoặc tải lên hình ảnh mới
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "library" | "upload")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Thư viện</TabsTrigger>
            <TabsTrigger value="upload">Tải lên mới</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <label htmlFor="media-type-filter-picker" className="text-sm font-medium whitespace-nowrap">
                  Loại:
                </label>
                <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
                  <SelectTrigger id="media-type-filter-picker" className="w-[140px]">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="image/">Hình ảnh</SelectItem>
                    <SelectItem value="video/">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên file..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-75">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMedia && filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                  {filteredMedia.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={cn(
                        "relative rounded-lg border-2 overflow-hidden transition-all hover:border-primary/50",
                        selected?.id === item.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent",
                      )}
                    >
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        {isImage(item.mimeType) ? (
                          <LazyImage
                            src={item.url}
                            thumbnailSrc={item.thumbnailUrl}
                            alt={item.altText || item.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : isVideo(item.mimeType) ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl mb-1">📄</div>
                              <p className="text-xs text-muted-foreground px-2 truncate">
                                {item.mimeType.split("/")[1]?.toUpperCase() ||
                                  "FILE"}
                              </p>
                            </div>
                          </div>
                        )}

                        {selected?.id === item.id && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <div className="bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-card">
                        <p
                          className="text-xs font-medium truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.fileSize)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {searchQuery
                    ? "Không tìm thấy kết quả"
                    : "Chưa có hình ảnh nào trong thư viện"}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handleConfirm} disabled={!selected}>
                Chọn
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex-1 flex flex-col gap-4">
              <div
                className={cn(
                  "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors flex-1 flex flex-col items-center justify-center",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  Kéo thả file vào đây, hoặc nhấn để chọn file
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Hỗ trợ hình ảnh và video
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn file
                </Button>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="shrink-0">
                    {isImageFile(selectedFile) ? (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMedia.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploadMedia.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUploadAndSelect}
                disabled={!selectedFile || uploadMedia.isPending}
              >
                {uploadMedia.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  "Tải lên và chọn"
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
