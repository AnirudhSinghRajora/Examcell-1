import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function BonafideAdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}
