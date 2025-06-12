"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Search } from "lucide-react"
import { studentApiClient, type StudentResult } from "@/lib/student-api"

interface SemesterResult {
  semester: string
  subjects: StudentResult[]
  sgpa: number
  totalCredits: number
}

export default function ResultsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [results, setResults] = useState<SemesterResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const studentId = user.studentId || 1

        const studentResults = await studentApiClient.getStudentResults(studentId)

        // Group results by semester
        const groupedResults = groupResultsBySemester(studentResults)
        setResults(groupedResults)
      } catch (error) {
        console.error("Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  const groupResultsBySemester = (results: StudentResult[]): SemesterResult[] => {
    const grouped = results.reduce(
      (acc, result) => {
        const semester = result.academicYear || "Current Semester"
        if (!acc[semester]) {
          acc[semester] = []
        }
        acc[semester].push(result)
        return acc
      },
      {} as Record<string, StudentResult[]>,
    )

    return Object.entries(grouped).map(([semester, subjects]) => {
      const typedSubjects = subjects as StudentResult[];
      return {
        semester,
        subjects: typedSubjects,
        sgpa: calculateSGPA(typedSubjects),
        totalCredits: typedSubjects.length * 4, // Assuming 4 credits per subject
      };
    })
  }

  const calculateSGPA = (subjects: StudentResult[]): number => {
    if (subjects.length === 0) return 0

    const totalGradePoints = subjects.reduce((sum, subject) => {
      const gradePoints = getGradePoints(subject.grade)
      return sum + gradePoints * 4 // Assuming 4 credits per subject
    }, 0)

    const totalCredits = subjects.length * 4
    return Math.round((totalGradePoints / totalCredits) * 100) / 100
  }

  const getGradePoints = (grade: string): number => {
    switch (grade) {
      case "A+":
        return 10
      case "A":
        return 9
      case "B+":
        return 8
      case "B":
        return 7
      case "C+":
        return 6
      case "C":
        return 5
      case "D":
        return 4
      default:
        return 0
    }
  }

  const filteredResults = results.filter((result) => {
    if (selectedSemester !== "all" && !result.semester.toLowerCase().includes(selectedSemester)) {
      return false
    }
    if (searchTerm) {
      return result.subjects.some(
        (subject) =>
          subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    return true
  })

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert("Results downloaded successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Academic Results</h1>
          <p className="text-gray-600">View and download your examination results</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="semester 6">Semester 6</SelectItem>
                <SelectItem value="semester 5">Semester 5</SelectItem>
                <SelectItem value="semester 4">Semester 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading your results...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredResults.map((semester, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle>{semester.semester}</CardTitle>
                    <CardDescription>
                      Total Credits: {semester.totalCredits} | SGPA: {semester.sgpa}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    SGPA: {semester.sgpa}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Subject Code</th>
                        <th className="text-left py-2">Subject Name</th>
                        <th className="text-center py-2">Marks</th>
                        <th className="text-center py-2">Grade</th>
                        <th className="text-center py-2">Exam Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.subjects.map((subject, subIndex) => (
                        <tr key={subIndex} className="border-b">
                          <td className="py-3 font-mono text-sm">{subject.subjectCode}</td>
                          <td className="py-3">{subject.subjectName}</td>
                          <td className="py-3 text-center font-semibold">{subject.marks}</td>
                          <td className="py-3 text-center">
                            <Badge variant={subject.grade.includes("A") ? "default" : "secondary"}>
                              {subject.grade}
                            </Badge>
                          </td>
                          <td className="py-3 text-center text-sm text-gray-600">{subject.examType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No results found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
