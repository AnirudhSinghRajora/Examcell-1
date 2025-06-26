"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Upload, 
  TrendingUp, 
  AlertCircle, 
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { teacherApiClient, type TeacherDashboard } from "@/lib/teacher-api"
import { useAuth } from "@/context/AuthContext"

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<TeacherDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.teacherId) {
        console.log("No teacherId found in user:", user);
        setError("Teacher ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        console.log("Fetching dashboard for teacherId:", user.teacherId);

        const dashboard = await teacherApiClient.getTeacherDashboard(user.teacherId)
        console.log("Dashboard data received:", dashboard);
        setDashboardData(dashboard)
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "CLOSED":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <Badge variant="destructive">Open</Badge>
      case "RESOLVED":
        return <Badge variant="default">Resolved</Badge>
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome back, {dashboardData.teacher.name}!</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button asChild className="h-20 flex-col" variant="default">
          <Link href="/teacher/marks">
            <Upload className="h-6 w-6 mb-2" />
            Upload Marks
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col relative">
          <Link href="/teacher/queries">
            <MessageSquare className="h-6 w-6 mb-2" />
            Student Queries
            {dashboardData.pendingQueries > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
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
        <Button asChild variant="outline" className="h-20 flex-col relative">
          <Link href="/teacher/queries">
            <AlertCircle className="h-6 w-6 mb-2" />
            Query Admin
            {dashboardData.pendingQueries < 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                {dashboardData.pendingQueries} 
              </Badge>
            )}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects by Semester */}
        <Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <GraduationCap className="h-5 w-5" />
      Subjects by Semester
    </CardTitle>
    <CardDescription>
      Your assigned subjects organized by semester
    </CardDescription>
  </CardHeader>
  <CardContent>
    {semesters.length > 0 ? (
      <Tabs defaultValue={semesters[0]} className="w-full">
        {/* allow horizontal scroll, add padding & larger gaps */}
        <TabsList className="flex items-center justify-around space-x-4 overflow-x-auto pb-4 mb-6 px-1">
          {semesters.map((semester) => (
            <TabsTrigger
              key={semester}
              value={semester}
              // bigger font, padding & rounded corners for breathing room
              className="flex-shrink-0 text-sm px-4 py-2 rounded-md"
            >
              Sem {semester}
              <Badge variant="secondary" className="ml-2 text-sm">
                {subjectsBySemester[semester].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {semesters.map((semester) => (
          <TabsContent key={semester} value={semester} className="space-y-3">
            {subjectsBySemester[semester].map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-base">{subject.name}</h4>
                  <p className="text-sm text-gray-600">
                    {subject.code} • {subject.credits} Credits
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    {subject.department}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/teacher/marks?subject=${subject.id}`}>Manage</Link>
                  </Button>
                </div>
              </div>
            ))}
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


        {/* Recent Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Student Queries</CardTitle>
            <CardDescription>Latest queries from your students</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentQueries.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentQueries.slice(0, 5).map((query) => (
                  <div
                    key={query.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="mt-1">
                      {getStatusIcon(query.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{query.title || "Query"}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {query.studentName} ({query.studentRollNo}) • {query.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(query.status)}
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/teacher/queries/${query.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/teacher/queries">View All Queries</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent queries</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Marks Uploads */}
      {dashboardData.recentMarksUploads && dashboardData.recentMarksUploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Marks Uploads</CardTitle>
            <CardDescription>Your latest marks uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentMarksUploads.map((upload, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{upload.subjectName}</h4>
                    <p className="text-xs text-gray-600">Semester {upload.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(upload.uploadDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">Uploaded</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
