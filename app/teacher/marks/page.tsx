"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Plus, Edit, Trash2, Search } from "lucide-react"
import {
  teacherApiClient,
  type TeacherMark,
  type TeacherSubject,
  type CreateMarkRequest,
  type UpdateMarkRequest,
  type StudentDto,
} from "@/lib/teacher-api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"

export default function TeacherMarksPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [subjects, setSubjects] = useState<TeacherSubject[]>([])
  const [marks, setMarks] = useState<TeacherMark[]>([])
  const [students, setStudents] = useState<StudentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMark, setEditingMark] = useState<TeacherMark | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  // Form state for add/edit mark
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: selectedSubject?.id || "",
    internal1: 0,
    internal2: 0,
    external: 0,
    academicYear: "",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const subjectId = searchParams.get("subject")
    if (subjectId && subjects.length > 0) {
      const subject = subjects.find((s) => s.id === subjectId)
      if (subject) {
        setSelectedSubject(subject)
        fetchMarks(subject.id)
        fetchStudents(subject.id)
      }
    } else if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0])
      fetchMarks(subjects[0].id)
      fetchStudents(subjects[0].id)
    }
  }, [subjects, searchParams])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      if (!user?.teacherId) throw new Error("No teacherId")
      const dashboard = await teacherApiClient.getTeacherDashboard(user.teacherId)
      setSubjects(dashboard.assignedSubjects)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMarks = async (subjectId: string) => {
    try {
      if (!user?.teacherId) throw new Error("No teacherId")
      const marksData = await teacherApiClient.getSubjectMarks(user.teacherId, subjectId)
      setMarks(marksData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load marks",
        variant: "destructive",
      })
    }
  }

  const fetchStudents = async (subjectId: string) => {
    try {
      const studentsData = await teacherApiClient.getStudentsForSubject(subjectId)
      setStudents(studentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    }
  }

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId)
    if (subject) {
      setSelectedSubject(subject)
      fetchMarks(subject.id)
      fetchStudents(subject.id)
    }
  }

  const handleAddMark = async () => {
    try {
      if (!user?.teacherId) throw new Error("No teacherId")
      const markData = {
        ...formData,
        subjectId: selectedSubject?.id || "",
      }
      await teacherApiClient.createMark(user.teacherId, markData)

      toast({
        title: "Success",
        description: "Mark added successfully",
      })

      setIsAddDialogOpen(false)
      resetForm()
      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mark",
        variant: "destructive",
      })
    }
  }

  const handleEditMark = async () => {
    if (!editingMark) return

    try {
      if (!user?.teacherId) throw new Error("No teacherId")
      const updateData: UpdateMarkRequest = {
        internal1: formData.internal1,
        internal2: formData.internal2,
        external: formData.external,
        academicYear: formData.academicYear,
      }

      await teacherApiClient.updateMark(user.teacherId, editingMark.id, updateData)

      toast({
        title: "Success",
        description: "Mark updated successfully",
      })

      setIsEditDialogOpen(false)
      setEditingMark(null)
      resetForm()
      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mark",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMark = async (markId: string) => {
    if (!confirm("Are you sure you want to delete this mark?")) return

    try {
      if (!user?.teacherId) throw new Error("No teacherId")
      await teacherApiClient.deleteMark(user.teacherId, markId)

      toast({
        title: "Success",
        description: "Mark deleted successfully",
      })

      if (selectedSubject) {
        fetchMarks(selectedSubject.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mark",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile || !selectedSubject) return

    try {
      if (!user?.teacherId) throw new Error("No teacherId")
      await teacherApiClient.uploadMarks(user.teacherId, uploadFile, selectedSubject.id, selectedSubject.semester)

      toast({
        title: "Success",
        description: "Marks uploaded successfully",
      })

      setUploadFile(null)
      fetchMarks(selectedSubject.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload marks",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      subjectId: selectedSubject?.id || "",
      internal1: 0,
      internal2: 0,
      external: 0,
      academicYear: "",
    })
  }

  const openEditDialog = (mark: TeacherMark) => {
    setEditingMark(mark)
    setFormData({
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      internal1: mark.internal1,
      internal2: mark.internal2,
      external: mark.external,
      academicYear: mark.academicYear,
    })
    setIsEditDialogOpen(true)
  }

  const filteredMarks = marks.filter((mark) => {
    const matchesSearch =
      mark.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Marks</h1>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Manage Marks</h1>
          <p className="text-gray-600">Add, edit, and manage student marks by subject</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!selectedSubject}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Marks via Excel</DialogTitle>
                <DialogDescription>
                  Upload an Excel file with student marks for {selectedSubject?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="excel-file">Excel File</Label>
                  <Input
                    id="excel-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleFileUpload} disabled={!uploadFile}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSubject}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mark
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Mark</DialogTitle>
                <DialogDescription>Add marks for {selectedSubject?.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student</Label>
                  <Select
                    value={formData.studentId}
                    onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.rollNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="internal1">Internal 1</Label>
                  <Input
                    id="internal1"
                    type="number"
                    max="100"
                    value={formData.internal1 ?? ""}
                    onChange={e => setFormData({ ...formData, internal1: Number(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="internal2">Internal 2</Label>
                  <Input
                    id="internal2"
                    type="number"
                    max="100"
                    value={formData.internal2 ?? ""}
                    onChange={e => setFormData({ ...formData, internal2: Number(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="external">External</Label>
                  <Input
                    id="external"
                    type="number"
                    max="100"
                    value={formData.external ?? ""}
                    onChange={e => setFormData({ ...formData, external: Number(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <Input id="examType" value="Final" disabled />
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input id="academicYear" value={formData.academicYear ?? ""} readOnly />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddMark} disabled={!formData.studentId || !selectedSubject}>
                  Add Mark
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
          <CardDescription>Choose a subject to manage marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Select value={selectedSubject?.id || ""} onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code}) - Sem {subject.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedSubject && (
              <div className="flex gap-2">
                <Badge variant="outline">Semester {selectedSubject.semester}</Badge>
                <Badge variant="outline">{selectedSubject.credits} Credits</Badge>
                <Badge variant="outline">{selectedSubject.department}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Marks Management */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Marks for {selectedSubject.name}
                <Badge variant="outline" className="ml-2">
                  {filteredMarks.length} students
                </Badge>
              </span>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Internal 1</TableHead>
                  <TableHead>Internal 2</TableHead>
                  <TableHead>External</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell className="font-medium">{mark.studentName}</TableCell>
                    <TableCell>{mark.studentRollNo}</TableCell>
                    <TableCell>{mark.internal1}</TableCell>
                    <TableCell>{mark.internal2}</TableCell>
                    <TableCell>{mark.external}</TableCell>
                    <TableCell>
                      <Badge variant={mark.grade === "F" ? "destructive" : "default"}>{mark.grade}</Badge>
                    </TableCell>
                    <TableCell>{mark.examType}</TableCell>
                    <TableCell>{mark.academicYear}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(mark)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMark(mark.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMarks.length === 0 && (
              <div className="text-center py-8 text-gray-500">No marks found for this subject</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mark</DialogTitle>
            <DialogDescription>Update marks for {editingMark?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-studentId">Student</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => setFormData({ ...formData, studentId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-internal1">Internal 1</Label>
              <Input
                id="edit-internal1"
                type="number"
                max="100"
                value={formData.internal1 ?? ""}
                onChange={e => setFormData({ ...formData, internal1: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="edit-internal2">Internal 2</Label>
              <Input
                id="edit-internal2"
                type="number"
                max="100"
                value={formData.internal2 ?? ""}
                onChange={e => setFormData({ ...formData, internal2: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="edit-external">External</Label>
              <Input
                id="edit-external"
                type="number"
                max="100"
                value={formData.external ?? ""}
                onChange={e => setFormData({ ...formData, external: Number(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="edit-academicYear">Academic Year</Label>
              <Input
                id="edit-academicYear"
                value={formData.academicYear ?? ""}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditMark}>Update Mark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
