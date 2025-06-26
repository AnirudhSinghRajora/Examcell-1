// File: src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/lib/auth-api-client'; // Import the AuthResponse type

interface User {
  userId: string; // Changed to string to match backend UUID
  studentId?: string; // Changed to string to match backend UUID
  teacherId?: string; // Changed to string to match backend UUID
  fullName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN"; // Changed TEACHER to PROFESSOR to match backend
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (authData: AuthResponse) => void; // <-- ADD THIS
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // --- ADD THIS LOGIN FUNCTION ---
  const login = (authData: AuthResponse) => {
    const userData: User = {
      userId: authData.id,
      // For students, use the user ID as studentId
      studentId: authData.role === "STUDENT" ? authData.id : undefined,
      // For professors, use the user ID as teacherId
      teacherId: authData.role === "PROFESSOR" ? authData.id : undefined,
      fullName: `${authData.firstName} ${authData.lastName}`,
      email: authData.email,
      role: authData.role
    };

    // 1. Update React state immediately
    setUser(userData);
    setToken(authData.token);

    // 2. Persist to localStorage
    localStorage.setItem('authToken', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const value = { user, token, loading, login, logout }; // <-- Add login to the value

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}