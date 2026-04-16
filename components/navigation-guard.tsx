"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NavigationGuardProps {
  isDirty: boolean
  message?: string
}

export function NavigationGuard({ 
  isDirty, 
  message = "Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang này? Những thay đổi của bạn sẽ bị mất." 
}: NavigationGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const [showDialog, setShowDialog] = useState(false)
  const [targetUrl, setTargetUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isDirty) return

    // Browser level: window close, refresh, or manual URL change
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = message
      return message
    }

    // Framework level: Intercept internal navigation (clicks on links)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")
      
      if (!anchor || !anchor.href) return
      
      // Ignore anchor links, target="_blank", mailto:, etc.
      if (
        anchor.target === "_blank" ||
        anchor.href.startsWith("mailto:") ||
        anchor.href.startsWith("tel:")
      ) {
        return
      }
      
      try {
        const currentUrlObj = new URL(window.location.href)
        const targetUrlObj = new URL(anchor.href, window.location.href)
        
        // If navigating away from the current path
        if (targetUrlObj.pathname !== currentUrlObj.pathname) {
          e.preventDefault()
          e.stopPropagation()
          setTargetUrl(anchor.href)
          setShowDialog(true)
        }
      } catch (err) {
        // Fallback for invalid URLs
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    // Use capture phase to intercept the click before next/link handles it
    document.addEventListener("click", handleClick, { capture: true })

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleClick, { capture: true })
    }
  }, [isDirty, message])

  const handleConfirm = () => {
    setShowDialog(false)
    if (targetUrl) {
      // Small delay to allow the dialog to close smoothly before navigating
      setTimeout(() => {
        router.push(targetUrl)
      }, 100)
    }
  }

  const handleCancel = () => {
    setShowDialog(false)
    setTargetUrl(null)
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cảnh báo dữ liệu chưa lưu</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Hủy, ở lại trang</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Vẫn rời đi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
