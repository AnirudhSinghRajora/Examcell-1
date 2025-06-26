"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApiClient } from "@/lib/auth-api-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const role = searchParams.get("role") || "student";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApiClient.login({ ...form });
      
      // Map frontend role to backend role
      const expectedRole = role === "student" ? "STUDENT" : 
                          role === "teacher" ? "PROFESSOR" : 
                          role === "admin" ? "ADMIN" : "STUDENT";
      
      if (res.role !== expectedRole) {
        setError("Role mismatch. Please use the correct login page.");
        setLoading(false);
        return;
      }
      
      // Pass the backend response directly to login function
      login(res);
      
      if (res.role === "STUDENT") router.push("/student/dashboard");
      else if (res.role === "PROFESSOR") router.push("/teacher/dashboard");
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
        <h1 className="text-2xl font-bold text-center mb-4">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h1>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
        {role === "student" && (
          <div className="text-center text-sm mt-2">
            Don't have an account? <a href="/auth/signup" className="text-blue-600 hover:underline">Sign up</a>
          </div>
        )}
      </form>
    </div>
  );
} 