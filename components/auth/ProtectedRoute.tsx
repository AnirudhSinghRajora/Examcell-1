"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

// Optional: Define props to allow role-based access
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"STUDENT" | "TEACHER" | "PROFESSOR" | "ADMIN">;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading the auth state
    if (loading) {
      return;
    }

    // If not loading and there's no user, redirect to login
    if (!user) {
      router.push('/auth/login'); // Or your main login selection page
      return;
    }

    // Optional: If roles are specified, check if the user has one of them
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to an unauthorized page or back to their own dashboard
      console.warn(`Access denied for role: ${user.role}`);
      router.push('/'); // Or a dedicated '/unauthorized' page
    }

  }, [user, loading, router, allowedRoles]);

  // While loading, you can show a spinner or a blank page
  if (loading || !user) {
    return <div>Loading...</div>; // Or a proper loading spinner component
  }
  
  // If user is authenticated (and has the right role if specified), render the children
  if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
      return <>{children}</>;
  }
  
  // Fallback in case checks fail (shouldn't be reached with the useEffect logic)
  return null;
}