"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, BookOpen, Upload, TrendingUp, AlertCircle } from "lucide-react"
import Link from "next/link"
import { teacherApiClient, type TeacherDashboard } from "@/lib/teacher-api"
import { useAuth } from "@/context/AuthContext"

export default function TeacherDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<TeacherDashboard | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== "TEACHER")) {
      router.push("/auth/login?role=teacher");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const teacherId = user.teacherId;

        if (!teacherId) {
          throw new Error("Teacher ID not found")
        }
        console.log("Fetching dashboard for teacher ID:", teacherId)
        const data = await teacherApiClient.getTeacherDashboard(teacherId)
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setDataLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  const statsData = [
    {
      title: "Subjects Teaching",
      value: dashboardData.subjectsTeaching.toString(),
      icon: BookOpen,
      change: `${dashboardData.assignedSubjects.length} active subjects`,
    },
    {
      title: "Pending Queries",
      value: dashboardData.pendingQueries.toString(),
      icon: MessageSquare,
      change: "Awaiting response",
    },
    {
      title: "Total Students",
      value: dashboardData.totalStudents.toString(),
      icon: Users,
      change: "Across all subjects",
    },
    {
      title: "Marks Uploaded",
      value: dashboardData.marksUploaded.toString(),
      icon: TrendingUp,
      change: "This semester",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back, {dashboardData.teacher.name}! Here's your teaching overview.</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild className="h-20 flex-col">
          <Link href="/teacher/marks">
            <Upload className="h-6 w-6 mb-2" />
            Upload Marks
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/queries">
            <MessageSquare className="h-6 w-6 mb-2" />
            Student Queries
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/subjects">
            <BookOpen className="h-6 w-6 mb-2" />
            My Subjects
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/query-admin">
            <AlertCircle className="h-6 w-6 mb-2" />
            Query Admin
          </Link>
        </Button>
      </div>

      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Subjects</CardTitle>
          <CardDescription>Subjects you are currently teaching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.assignedSubjects.map((subject) => (
              <div key={subject.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{subject.name}</h4>
                <p className="text-sm text-gray-600">{subject.code}</p>
                <p className="text-sm text-gray-500">
                  {subject.semester} • {subject.credits} Credits
                </p>
                <Button asChild size="sm" className="mt-2">
                  <Link href={`/teacher/subjects/${subject.id}`}>Manage</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Student Queries</CardTitle>
          <CardDescription>Latest queries from your students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentQueries.map((query) => (
              <div key={query.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{query.title}</h4>
                  <p className="text-sm text-gray-600">
                    {query.studentName} ({query.studentRollNo}) • {query.subject}
                  </p>
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
              <Link href="/teacher/queries">View All Queries</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
