"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, BookOpen, Shield } from "lucide-react"
// --- MODIFICATION START ---
import { authApiClient, LoginRequest } from "@/lib/auth-api-client" // Adjust path if needed


import { useAuth } from '@/context/AuthContext';

// ... inside your LoginPage component

// --- MODIFICATION END ---

export default function LoginPage() {
  const [username, setUsername] = useState("") // Can be username or email
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()

  const router = useRouter()
  const searchParams = useSearchParams()
  const roleQueryParam = searchParams.get("role") || "student"

// In your LoginPage.tsx file

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const loginData: LoginRequest = {
        usernameOrEmail: username,
        password: password,
    };

    try {
        const response = await authApiClient.login(loginData);

        // --- THIS IS THE FIX ---
        // Instead of setting localStorage here, call the context's login function.
        // This updates the global state AND localStorage in one atomic step.
        login(response);

        // The redirection logic remains the same.
        // By the time this runs, the AuthContext state is already updated.
        switch (response.role) {
            case "ADMIN":
                router.push("/admin/dashboard");
                break;
            case "TEACHER":
                router.push("/teacher/dashboard");
                break;
            case "STUDENT":
                router.push("/student/dashboard");
                break;
            default:
                router.push("/");
        }

    } catch (err: any) {
        setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
        setLoading(false);
    }
};
  // --- MODIFICATION END ---


  const getRoleIcon = () => {
    switch (roleQueryParam) {
      case "admin":
        return <Shield className="w-6 h-6 text-white" />
      case "teacher":
        return <BookOpen className="w-6 h-6 text-white" />
      default:
        return <GraduationCap className="w-6 h-6 text-white" />
    }
  }

  const getRoleColor = () => {
    switch (roleQueryParam) {
      case "admin":
        return "bg-red-600"
      case "teacher":
        return "bg-green-600"
      default:
        return "bg-blue-600"
    }
  }

  const getRoleTitle = () => {
    switch (roleQueryParam) {
      case "admin":
        return "Administrator"
      case "teacher":
        return "Teacher"
      default:
        return "Student"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 w-12 h-12 ${getRoleColor()} rounded-full flex items-center justify-center`}>
            {getRoleIcon()}
          </div>
          <CardTitle className="text-2xl">{getRoleTitle()} Login</CardTitle>
          <CardDescription>Enter your credentials to access the exam cell system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username or Email</Label> { /* Changed label for clarity */ }
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link href="/" className="text-gray-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}