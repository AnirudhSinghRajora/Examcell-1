"use client"


import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { apiClient, type Student, type StudentFilters, type CreateStudentRequest, type UpdateStudentRequest, type PagedResponse, type CourseInfo, type Branch } from "@/lib/api"
import { useApi } from "@/hooks/use-api"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentsPage() {
  const [filters, setFilters] = useState<StudentFilters>({ page: 0, size: 10 })
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 400)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [isClient, setIsClient] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newStudent, setNewStudent] = useState<StudentFormFields>({
    rollNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    semester: "",
    department: "",
    phoneNumber: "",
    address: "",
    active: true,
  })
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState("all")

  type StudentFormFields = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

  useEffect(() => {
    setIsClient(true)
    apiClient.getCourses().then(setCourses)
  }, [])

  useEffect(() => {
    if (selectedCourse !== "all") {
      apiClient.getBranches(selectedCourse).then(setBranches)
    } else {
      setBranches([])
    }
    setSelectedBranch("all") // Reset branch when course changes
  }, [selectedCourse])

  const selectedCourseObj = courses.find(c => c.name === selectedCourse)
  const semesterOptions = selectedCourseObj ? Array.from({ length: selectedCourseObj.totalSemesters }, (_, i) => `${i + 1}`) : []

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      course: selectedCourse === "all" ? undefined : selectedCourse.toUpperCase(),
      branch: selectedBranch === "all" ? undefined : selectedBranch.toUpperCase(),
      semester: selectedSemester === "all" ? undefined : selectedSemester,
      page: 0,
    }))
    // eslint-disable-next-line
  }, [debouncedSearch, selectedCourse, selectedBranch, selectedSemester])

  const {
    data: studentsData,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useApi<PagedResponse<Student>>(
    () => (isClient
      ? apiClient.getStudents(filters)
      : Promise.resolve({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true })
    ),
    [filters, isClient]
  );

  const students = studentsData?.content || []
  const totalElements = studentsData?.totalElements || 0
  const totalPages = studentsData?.totalPages || 0

  console.log("Current filters:", filters);
  console.log("Students data:", students);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  const handleCourseChange = (value: string) => {
    setSelectedCourse(value)
    setSelectedSemester("all") // Reset semester when course changes
  }
  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value)
  }
  const handleBranchChange = (value: string) => {
    setSelectedBranch(value)
  }

  // ... rest of the student management logic (add/edit/delete, dialogs, table, etc.)

  // For brevity, only the filter UI is shown here, but the rest of the page should follow the previous structure
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-gray-600">Manage student records</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Students
          </CardTitle>
          <CardDescription>Search for students by name, email, or roll number.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <Input
              placeholder="Search by name, email, or roll number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-72"
            />
            <Select value={selectedCourse} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.name} value={course.name}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCourse !== "all" && (
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedSemester} onValueChange={handleSemesterChange} disabled={selectedCourse === "all"}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesterOptions.map((sem) => (
                  <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Students Table */}
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No students found.</TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.firstName}</TableCell>
                      <TableCell>{student.lastName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.semester}</TableCell>
                      <TableCell>{student.department}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* ... rest of the student management UI (table, dialogs, etc.) ... */}
    </div>
  )
}