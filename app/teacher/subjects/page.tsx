"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, Search, ExternalLink, Upload, MessageSquare } from "lucide-react"
import { teacherApiClient, type TeacherSubject, type TeacherDashboard } from "@/lib/teacher-api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

export default function TeacherSubjectsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<TeacherSubject[]>([])
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      if (!user?.teacherId) throw new Error("No teacherId")
      const dashboardData = await teacherApiClient.getTeacherDashboard(user.teacherId)
      console.log("Dashboard data received:", dashboardData)
      setSubjects(dashboardData.assignedSubjects)
      setDashboard(dashboardData)
    } catch (error) {
      console.error("Error fetching subjects:", error)
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.department.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Subjects</h1>
          <p className="text-gray-600">Loading your assigned subjects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Subjects</h1>
          <p className="text-gray-600">View and manage your assigned subjects</p>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <Badge variant="outline">{subjects.length} subjects assigned</Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Subjects</CardTitle>
          <CardDescription>Find specific subjects by name, code, or department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription className="text-sm font-mono">{subject.code}</CardDescription>
                </div>
                <Badge variant="secondary">Sem {subject.semester}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{subject.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-medium">{subject.credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Faculty:</span>
                  <span className="font-medium">{subject.faculty}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/teacher/marks?subject=${subject.id}`}>
                    <Upload className="h-4 w-4 mr-2" />
                    Manage Marks
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/teacher/queries?subject=${subject.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Queries
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subjects Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects Overview</CardTitle>
          <CardDescription>Detailed view of all your assigned subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-mono">{subject.code}</TableCell>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Semester {subject.semester}</Badge>
                  </TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>{subject.faculty}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/teacher/marks?subject=${subject.id}`}>
                          <Upload className="h-4 w-4 mr-1" />
                          Marks
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/teacher/queries?subject=${subject.id}`}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Queries
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubjects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No subjects match your search" : "No subjects assigned yet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold">{subjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{dashboard?.totalStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Queries</p>
                  <p className="text-2xl font-bold">{dashboard?.pendingQueries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 