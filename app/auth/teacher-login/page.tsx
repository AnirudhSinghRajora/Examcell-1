"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApiClient } from "@/lib/auth-api-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApiClient.login({ ...form });
      if (res.role !== "PROFESSOR") {
        setError("This login is only for teachers. Please use the correct login page.");
        setLoading(false);
        return;
      }
      
      // Pass the backend response directly to login function
      login(res);
      router.push("/teacher/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Teacher Login</CardTitle>
          <CardDescription>Access your teaching portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded">{error}</div>}
            <Input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <Input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login as Teacher"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 