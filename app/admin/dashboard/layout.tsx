import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
