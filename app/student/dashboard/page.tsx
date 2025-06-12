"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calculator, MessageSquare, Award, Download, Eye } from "lucide-react";
import Link from "next/link";
import { studentApiClient, type StudentDashboard } from "@/lib/student-api";

// --- MODIFICATION 1: Import the necessary auth components ---
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

function DashboardContent() {
  // --- MODIFICATION 2: Move all state and logic into a new inner component ---
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- MODIFICATION 3: Get the authenticated user from our custom hook ---
  const { user } = useAuth();

  useEffect(() => {
    // Only run the effect if we have a user object
    if (!user || !user.studentId) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // --- MODIFICATION 4: Use the reliable studentId from the auth context ---
        const studentId = user.studentId!;

        const data = await studentApiClient.getStudentDashboard(studentId);
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // The effect now depends on the user object

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-gray-600">Loading your academic overview...</p>
        </div>
        {/* You can add a more detailed skeleton loader here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null; // Or show a 'no data' message

  const statsData = [
    {
      title: "Current CGPA",
      value: dashboardData.cgpa.toFixed(2),
      icon: Award,
      change: "+0.2 from last semester",
    },
    {
      title: "Completed Semesters",
      value: `${dashboardData.completedSemesters}`,
      icon: FileText,
      change: `Out of ${dashboardData.totalSemesters} semesters`,
    },
    {
      title: "Pending Queries",
      value: dashboardData.pendingQueries.toString(),
      icon: MessageSquare,
      change: `${dashboardData.pendingQueries} awaiting response`,
    },
    {
      title: "Certificates",
      value: dashboardData.availableCertificates.toString(),
      icon: Download,
      change: "Available for download",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {dashboardData.student.name}! Here's your academic overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions and other UI... (No changes needed here) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild className="h-20 flex-col">
          <Link href="/student/results">
            <Eye className="h-6 w-6 mb-2" />
            View Results
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/student/cgpa-calculator">
            <Calculator className="h-6 w-6 mb-2" />
            CGPA Calculator
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/student/bonafide">
            <FileText className="h-6 w-6 mb-2" />
            Bonafide Certificate
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/student/queries">
            <MessageSquare className="h-6 w-6 mb-2" />
            Submit Query
          </Link>
        </Button>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>Your latest examination results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{result.subjectName}</h4>
                  <p className="text-sm text-gray-600">{result.subjectCode}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{result.marks}</div>
                  <div className="text-sm text-gray-600">Grade: {result.grade}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/results">View All Results</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
          <CardDescription>Your submitted queries and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentQueries.map((query) => (
              <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{query.title}</h4>
                  <p className="text-sm text-gray-600">Subject: {query.subject}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    query.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : query.status === "RESOLVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {query.status}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/student/queries">View All Queries</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// The main export is now a simple component that wraps the content
export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}