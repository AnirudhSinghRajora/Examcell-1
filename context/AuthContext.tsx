// File: src/context/AuthContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse } from '@/lib/auth-api-client'; // Import the AuthResponse type

interface User {
  userId: number;
  studentId?: number;
  teacherId?: number;
  fullName: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
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
      userId: authData.userId,
      studentId: authData.studentId,
      teacherId: authData.teacherId,
      fullName: authData.fullName,
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