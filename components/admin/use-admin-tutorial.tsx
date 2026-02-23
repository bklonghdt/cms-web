"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { driver, DriveStep } from "driver.js"
import "driver.js/dist/driver.css"

export function useAdminTutorial() {
  const driverObj = useRef<ReturnType<typeof driver> | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    let steps: DriveStep[] = []

    if (pathname === "/admin/content/articles/new") {
      steps = [
        {
          element: "#create-article-header",
          popover: {
            title: "Tạo bài viết mới",
            description: "Trang này cho phép bạn soạn thảo và xuất bản bài viết mới.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#title",
          popover: {
            title: "Tiêu đề bài viết",
            description: "Nhập tiêu đề cho bài viết. Đây là thông tin bắt buộc.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#slug",
          popover: {
            title: "Đường dẫn (Slug)",
            description: "Đường dẫn thân thiện cho SEO. Nếu để trống, hệ thống sẽ tự động tạo từ tiêu đề.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#description",
          popover: {
            title: "Mô tả ngắn",
            description: "Nhập mô tả ngắn gọn về nội dung bài viết. Thông tin này thường hiển thị dưới tiêu đề trong danh sách.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-cover-image",
          popover: {
            title: "Ảnh đại diện",
            description: "Chọn ảnh đại diện cho bài viết từ thư viện Media. Ảnh này sẽ hiển thị trong danh sách và đầu bài viết.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#article-category-select",
          popover: {
            title: "Danh mục",
            description: "Chọn danh mục chính cho bài viết để phân loại nội dung.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-tags-selector",
          popover: {
            title: "Thẻ (Tags)",
            description: "Gắn các thẻ liên quan để giúp người dùng dễ dàng tìm kiếm bài viết.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-status-select",
          popover: {
            title: "Trạng thái",
            description: "Thiết lập trạng thái bài viết: Bản nháp (chưa công khai) hoặc Đã xuất bản.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-featured-switch",
          popover: {
            title: "Bài viết nổi bật",
            description: "Bật tùy chọn này để ghim bài viết lên các vị trí nổi bật trên trang chủ.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-content-parts",
          popover: {
            title: "Nội dung bài viết",
            description: "Sử dụng công cụ kéo thả để thêm văn bản, hình ảnh và sắp xếp nội dung bài viết.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#article-seo",
          popover: {
            title: "Tối ưu hóa SEO",
            description: "Thiết lập tiêu đề và mô tả SEO để tối ưu hóa công cụ tìm kiếm.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#save-article-btn",
          popover: {
            title: "Lưu bài viết",
            description: "Nhấn nút này để tạo bài viết mới.",
            side: "left",
            align: "end",
          },
        },
      ]
    } else if (pathname === "/admin/content/articles") {
      steps = [
        {
          element: "#articles-title",
          popover: {
            title: "Quản lý bài viết",
            description: "Tại đây bạn có thể xem và quản lý tất cả bài viết trong hệ thống.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#create-article-btn",
          popover: {
            title: "Tạo bài viết mới",
            description: "Nhấn vào nút này để chuyển sang trang soạn thảo bài viết mới.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#articles-filter",
          popover: {
            title: "Bộ lọc và Tìm kiếm",
            description: "Sử dụng các bộ lọc này để tìm kiếm bài viết theo tiêu đề, trạng thái, danh mục hoặc tác giả.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#articles-table",
          popover: {
            title: "Danh sách bài viết",
            description: "Danh sách các bài viết sẽ hiển thị ở đây. Bạn có thể thực hiện các hành động như Chỉnh sửa, Xuất bản, hoặc Xóa từng bài viết.",
            side: "top",
            align: "start",
          },
        },
        {
          element: ".btn-action-publish",
          popover: {
            title: "Xuất bản bài viết",
            description: "Nhấn nút này để xuất bản bài viết nháp.",
            side: "left",
            align: "center",
          },
        },
        {
          element: ".btn-action-edit",
          popover: {
            title: "Chỉnh sửa bài viết",
            description: "Nhấn vào đây để chỉnh sửa nội dung bài viết.",
            side: "left",
            align: "center",
          },
        },
        {
          element: ".btn-action-bookmark",
          popover: {
            title: "Lưu bài viết",
            description: "Đánh dấu bài viết để dễ dàng tìm kiếm sau này.",
            side: "left",
            align: "center",
          },
        },
        {
          element: ".btn-action-delete",
          popover: {
            title: "Xóa bài viết",
            description: "Xóa bài viết khỏi hệ thống. Hành động này không thể hoàn tác.",
            side: "left",
            align: "center",
          },
        },
      ]
    } else {
      // Default / Dashboard steps
      steps = [
        {
          element: "#admin-header",
          popover: {
            title: "Khu vực quản trị",
            description: "Chào mừng bạn đến với trang quản trị. Đây là nơi bạn quản lý toàn bộ hệ thống.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#admin-sidebar",
          popover: {
            title: "Menu điều hướng",
            description: "Sử dụng menu bên trái để truy cập các tính năng khác nhau như Quản lý người dùng, Bài viết, và Cài đặt.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#admin-content",
          popover: {
            title: "Khu vực nội dung chính",
            description: "Nội dung của từng trang sẽ hiển thị ở đây. Bạn có thể xem thống kê, danh sách dữ liệu và thực hiện các thao tác chính tại đây.",
            side: "left",
            align: "start",
          },
        },
        {
          element: "#admin-profile-menu",
          popover: {
            title: "Tài khoản của bạn",
            description: "Nhấp vào đây để xem hồ sơ, đổi mật khẩu hoặc đăng xuất khỏi hệ thống.",
            side: "bottom",
            align: "end",
          },
        },
      ]
    }

    driverObj.current = driver({
      showProgress: true,
      animate: true,
      steps: steps,
      nextBtnText: "Tiếp theo",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
    })
  }, [pathname])

  const startTutorial = () => {
    driverObj.current?.drive()
  }

  return { startTutorial }
}
