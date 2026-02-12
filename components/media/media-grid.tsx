"use client"

import { useState, useRef, useEffect } from "react"
import { MediaItem } from "@/lib/hooks/use-media"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaGridProps {
  items: MediaItem[]
  onDelete: (item: MediaItem) => void
}

interface LazyImageProps {
  src: string
  thumbnailSrc?: string
  alt: string
  className?: string
}

function LazyImage({ src, thumbnailSrc, alt, className }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: "50px" }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  const imageSrc = isInView ? src : thumbnailSrc || src

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        className,
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-50"
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setIsLoaded(true)}
    />
  )
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const isImage = (mimeType: string) => {
    return mimeType.startsWith("image/")
  }

  const isVideo = (mimeType: string) => {
    return mimeType.startsWith("video/")
  }

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement("a")
    link.href = item.url
    link.download = item.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getResizedImageUrl = (item: MediaItem, width: number, height: number) => {
    // Extract the media ID from the URL
    // URL format: /api/Medias/{id}/download
    const match = item.url.match(/\/api\/Medias\/([^\/]+)\/download/)
    if (match && match[1]) {
      return `/api/Medias/${match[1]}/resize?width=${width}&height=${height}`
    }
    return item.url
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
        >
          <div 
            className="aspect-square bg-muted relative overflow-hidden cursor-pointer"
            onClick={() => handleDownload(item)}
            title="Nhấn để tải xuống bản gốc"
          >
            {isImage(item.mimeType) ? (
              <LazyImage
                src={getResizedImageUrl(item, 400, 400)}
                thumbnailSrc={item.thumbnailUrl || getResizedImageUrl(item, 200, 200)}
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
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-xs text-muted-foreground px-2 truncate">
                    {item.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                  </p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyUrl(item.url, item.id)
                }}
                title="Copy URL"
              >
                {copiedId === item.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(item)
                }}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item)
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-3">
            <p className="text-sm font-medium truncate" title={item.fileName}>
              {item.fileName}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {formatFileSize(item.fileSize)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.created).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
