import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function QueriesAdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
