import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MarksAdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
