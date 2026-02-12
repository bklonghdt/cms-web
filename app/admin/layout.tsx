import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  )
}
