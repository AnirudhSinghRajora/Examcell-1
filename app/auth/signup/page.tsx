"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApiClient } from "@/lib/auth-api-client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"STUDENT" | "PROFESSOR" | "ADMIN">("STUDENT");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "STUDENT" as "STUDENT" | "PROFESSOR" | "ADMIN",
    rollNo: "",
    semester: "",
    department: "",
    phoneNumber: "",
    address: "",
    // Teacher fields
    employeeId: "",
    designation: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "STUDENT" | "PROFESSOR" | "ADMIN";
    setRole(newRole);
    setForm((prev) => ({ ...prev, role: newRole }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApiClient.signup(form);
      login(res);
      if (role === "STUDENT") router.push("/student/dashboard");
      else if (role === "PROFESSOR") router.push("/teacher/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">Signup</h1>
        <select name="role" value={role} onChange={handleRoleChange} className="w-full border rounded px-3 py-2 mb-2">
          <option value="STUDENT">Student</option>
          <option value="PROFESSOR">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        {role === "STUDENT" && (
          <>
            <Input name="rollNo" placeholder="Roll Number" value={form.rollNo} onChange={handleChange} required />
            <Input name="semester" placeholder="Semester" value={form.semester} onChange={handleChange} required />
            <Input name="department" placeholder="Department" value={form.department} onChange={handleChange} required />
            <Input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} />
            <Input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          </>
        )}
        {role === "PROFESSOR" && (
          <>
            <Input name="employeeId" placeholder="Employee ID" value={form.employeeId} onChange={handleChange} required />
            <Input name="designation" placeholder="Designation" value={form.designation} onChange={handleChange} required />
            <Input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
            <Input name="department" placeholder="Department" value={form.department} onChange={handleChange} required />
          </>
        )}
        {role === "ADMIN" && (
          <>
            <Input name="department" placeholder="Department" value={form.department} onChange={handleChange} required />
          </>
        )}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? `Signing up...` : `Sign Up as ${role.charAt(0) + role.slice(1).toLowerCase()}`}</Button>
        <div className="text-center text-sm mt-2">
          Already have an account? <a href="/auth/login?role=student" className="text-blue-600 hover:underline">Login</a>
        </div>
      </form>
    </div>
  );
}
