"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApiClient } from "@/lib/auth-api-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RoleLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState<"PROFESSOR" | "ADMIN">("PROFESSOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as "PROFESSOR" | "ADMIN");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApiClient.login({ ...form });
      if (res.role !== role) {
        setError("Role mismatch. Please select the correct role.");
        setLoading(false);
        return;
      }
      
      // Pass the backend response directly to login function
      login(res);
      
      if (res.role === "PROFESSOR") router.push("/teacher/dashboard");
      else if (res.role === "ADMIN") router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4">Teacher/Admin Login</h1>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <select value={role} onChange={handleRoleChange} className="w-full border rounded px-3 py-2 mb-2">
          <option value="PROFESSOR">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
      </form>
    </div>
  );
}
