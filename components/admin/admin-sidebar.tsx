"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Folder,
  Image,
  Database,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const menuItems = [
  // {
  //   title: "Tổng quan",
  //   href: "/admin",
  //   icon: LayoutDashboard,
  // },
  {
    title: "Quản lý nội dung",
    icon: Folder,
    items: [
      { title: "Bài viết", href: "/admin/content/articles", icon: FileText },
      // { title: "Trang", href: "/admin/content/pages", icon: FileText },
      { title: "Danh mục", href: "/admin/categories", icon: Folder },
      { title: "Thẻ", href: "/admin/tags", icon: Shield },
      { title: "Media", href: "/admin/content/media", icon: Image },
    ],
  },
  {
    title: "Quản lý hệ thống",
    icon: Settings,
    items: [
      { title: "Người dùng", href: "/admin/users", icon: Users },
      { title: "Vai trò", href: "/admin/roles", icon: Shield },
    ],
  },
  // {
  //   title: "Thống kê",
  //   href: "/admin/analytics",
  //   icon: BarChart3,
  // },
  // {
  //   title: "Loại nội dung",
  //   href: "/admin/content-types",
  //   icon: Database,
  // },
  // {
  //   title: "Cài đặt",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
];

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full border-r bg-zinc-50 dark:bg-zinc-900 transition-all duration-300 lg:sticky",
          isCollapsed ? "w-14" : "w-56",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!isCollapsed && <span className="text-sm font-semibold">Admin</span>}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-7 w-7"
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-7 w-7"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <nav className={cn("flex flex-col gap-0.5 p-3", isCollapsed && "px-2")}>
          {menuItems.map((item, index) => {
            if (item.items) {
              if (isCollapsed) {
                return (
                  <div key={index} className="mb-1">
                    <div className="flex items-center justify-center rounded-md px-2 py-1.5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <item.icon className="h-4 w-4" />
                    </div>
                  </div>
                );
              }
              return (
                <div key={index} className="mb-1">
                  <div className="mb-1 flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <item.icon className="h-3 w-3" />
                    {item.title}
                  </div>
                  <div className="ml-1.5 space-y-0.5">
                    {item.items.map((subItem, subIndex) => {
                      const isActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground",
                          )}
                          onClick={onClose}
                        >
                          <subItem.icon className="h-3.5 w-3.5" />
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Type guard: only render if item has href (direct link, not a group)
            if (!('href' in item)) {
              return null;
            }

            const directItem = item as { title: string; href: string; icon: any };
            const isActive = pathname === directItem.href;
            return (
              <Link
                key={index}
                href={directItem.href}
                className={cn(
                  "flex items-center rounded-md py-1.5 text-xs font-medium transition-colors",
                  isCollapsed ? "justify-center px-2" : "gap-2 px-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground",
                )}
                onClick={onClose}
                title={isCollapsed ? directItem.title : undefined}
              >
                <directItem.icon
                  className={cn("h-3.5 w-3.5", isCollapsed && "h-4 w-4")}
                />
                {!isCollapsed && directItem.title}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
