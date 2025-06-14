"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, BookOpen, Upload, TrendingUp, AlertCircle, GraduationCap } from "lucide-react"
import Link from "next/link"
import { teacherApiClient, type TeacherDashboard } from "@/lib/teacher-api"

export default function TeacherDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TeacherDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Get teacher ID from localStorage (from your auth system)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const teacherId = user.teacherId || user.id || 1

        const dashboard = await teacherApiClient.getTeacherDashboard(teacherId)
        setDashboardData(dashboard)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
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
      color: "text-blue-600",
    },
    {
      title: "Pending Queries",
      value: dashboardData.pendingQueries.toString(),
      icon: MessageSquare,
      change: "Awaiting response",
      color: "text-orange-600",
    },
    {
      title: "Total Students",
      value: dashboardData.totalStudents.toString(),
      icon: Users,
      change: "Across all subjects",
      color: "text-green-600",
    },
    {
      title: "Marks Uploaded",
      value: dashboardData.marksUploaded.toString(),
      icon: TrendingUp,
      change: "This semester",
      color: "text-purple-600",
    },
  ]

  // Group subjects by semester
  const subjectsBySemester = dashboardData.assignedSubjects.reduce(
    (acc, subject) => {
      const semester = subject.semester
      if (!acc[semester]) {
        acc[semester] = []
      }
      acc[semester].push(subject)
      return acc
    },
    {} as Record<string, typeof dashboardData.assignedSubjects>,
  )

  const semesters = Object.keys(subjectsBySemester).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {dashboardData.teacher.name}!</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{dashboardData.teacher.department}</Badge>
            <Badge variant="outline">ID: {dashboardData.teacher.employeeId}</Badge>
            <Badge variant="outline">{dashboardData.teacher.designation}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href="/teacher/marks">
            <Upload className="h-4 w-4 mr-2" />
            Manage Marks
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Semester Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Subjects by Semester
          </CardTitle>
          <CardDescription>Your assigned subjects organized by semester</CardDescription>
        </CardHeader>
        <CardContent>
          {semesters.length > 0 ? (
            <Tabs defaultValue={semesters[0]} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {semesters.map((semester) => (
                  <TabsTrigger key={semester} value={semester}>
                    Semester {semester}
                    <Badge variant="secondary" className="ml-2">
                      {subjectsBySemester[semester].length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {semesters.map((semester) => (
                <TabsContent key={semester} value={semester} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjectsBySemester[semester].map((subject) => (
                      <Card key={subject.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{subject.name}</CardTitle>
                          <CardDescription>
                            {subject.code} • {subject.credits} Credits
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{subject.department}</Badge>
                            <Button asChild size="sm">
                              <Link href={`/teacher/marks?subject=${subject.id}`}>Manage Marks</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No subjects assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-20 flex-col" variant="default">
          <Link href="/teacher/marks">
            <Upload className="h-6 w-6 mb-2" />
            Upload Marks
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/queries">
            <MessageSquare className="h-6 w-6 mb-2" />
            Student Queries
            {dashboardData.pendingQueries > 0 && (
              <Badge variant="destructive" className="ml-1">
                {dashboardData.pendingQueries}
              </Badge>
            )}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/subjects">
            <BookOpen className="h-6 w-6 mb-2" />
            My Subjects
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col">
          <Link href="/teacher/queries">
            <AlertCircle className="h-6 w-6 mb-2" />
            Query Admin
          </Link>
        </Button>
      </div>

      {/* Recent Queries */}
      {dashboardData.recentQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Student Queries</CardTitle>
            <CardDescription>Latest queries from your students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentQueries.map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{query.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {query.studentName} ({query.studentRollNo}) • {query.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(query.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        query.status === "PENDING"
                          ? "destructive"
                          : query.status === "RESOLVED"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {query.status}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/queries/${query.id}`}>View</Link>
                    </Button>
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
      )}
    </div>
  )
}
