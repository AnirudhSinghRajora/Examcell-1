"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Search } from "lucide-react"
import { studentApiClient, type StudentResult } from "@/lib/student-api"
import { useAuth } from "@/context/AuthContext"

interface SemesterResult {
  semester: string
  subjects: StudentResult[]
  sgpa: number
  totalCredits: number
}

export default function ResultsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [results, setResults] = useState<SemesterResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.studentId) {
        console.log("No studentId found in user:", user);
        return;
      }
      
      setLoading(true)
      try {
        console.log("Fetching results for studentId:", user.studentId);
        const studentResults = await studentApiClient.getStudentResults(user.studentId)
        console.log("Results response:", studentResults);
        console.log("First result details:", studentResults[0]);

        // Group results by semester
        const groupedResults = groupResultsBySemester(studentResults)
        console.log("Grouped results:", groupedResults);
        setResults(groupedResults)
      } catch (error) {
        console.error("Failed to fetch results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  const groupResultsBySemester = (results: StudentResult[]): SemesterResult[] => {
    const grouped = results.reduce(
      (acc, result) => {
        const semester = `Semester ${result.semester}` || "Current Semester"
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
        totalCredits: typedSubjects.reduce((sum, subject) => sum + subject.subject.credits, 0),
      };
    })
  }

  const calculateSGPA = (subjects: StudentResult[]): number => {
    if (subjects.length === 0) return 0

    const totalGradePoints = subjects.reduce((sum, subject) => {
      const gradePoint = subject.gradePoint || 0;
      return sum + gradePoint * subject.subject.credits
    }, 0)

    const totalCredits = subjects.reduce((sum, subject) => sum + subject.subject.credits, 0)
    const sgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    // Round to nearest 0.05
    return Math.round(sgpa * 20) / 20;
  }

  const formatMarks = (marks: number): string => {
    return marks.toFixed(2);
  }

  const filteredResults = results.filter((result) => {
    if (selectedSemester !== "all" && !result.semester.toLowerCase().includes(selectedSemester)) {
      return false
    }
    if (searchTerm) {
      return result.subjects.some(
        (subject) =>
          subject.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.subject.code.toLowerCase().includes(searchTerm.toLowerCase()),
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
                          <td className="py-3 font-mono text-sm">{subject.subject.code}</td>
                          <td className="py-3">{subject.subject.name}</td>
                          <td className="py-3 text-center font-semibold">{formatMarks(subject.marksObtained)}/{subject.maxMarks || 100}</td>
                          <td className="py-3 text-center">
                            <Badge variant={subject.grade && subject.grade.includes("A") ? "default" : "secondary"}>
                              {subject.grade || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 text-center text-sm text-gray-600">Final</td>
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
