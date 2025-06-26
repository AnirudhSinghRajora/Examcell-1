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

export default function MarksTableClient() {
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

  const filteredMarks = marks.filter((mark) =>
    students
      .find((student) => student.id === mark.studentId)
      ?.name.toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )

  const getStudentName = (studentId: string) => {
    return students.find((student) => student.id === studentId)?.name || "N/A"
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>Subject Marks</CardTitle>
                <CardDescription>Manage marks for your assigned subjects.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading subjects...</p>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <Select value={selectedSubject?.id || ""} onValueChange={handleSubjectChange}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} - {subject.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="h-8 gap-1">
                              <Plus className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only">Add Mark</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Add New Mark</DialogTitle>
                              <DialogDescription>
                                Enter the details for the new mark.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="studentId" className="text-right">
                                  Student
                                </Label>
                                <Select
                                  value={formData.studentId}
                                  onValueChange={(value) => setFormData({ ...formData, studentId: value })}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a student" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {students.map((student) => (
                                      <SelectItem key={student.id} value={student.id}>
                                        {student.name} ({student.rollNumber})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal1" className="text-right">
                                  Internal 1
                                </Label>
                                <Input
                                  id="internal1"
                                  type="number"
                                  value={formData.internal1}
                                  onChange={(e) =>
                                    setFormData({ ...formData, internal1: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="internal2" className="text-right">
                                  Internal 2
                                </Label>
                                <Input
                                  id="internal2"
                                  type="number"
                                  value={formData.internal2}
                                  onChange={(e) =>
                                    setFormData({ ...formData, internal2: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="external" className="text-right">
                                  External
                                </Label>
                                <Input
                                  id="external"
                                  type="number"
                                  value={formData.external}
                                  onChange={(e) =>
                                    setFormData({ ...formData, external: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="academicYear" className="text-right">
                                  Academic Year
                                </Label>
                                <Input
                                  id="academicYear"
                                  value={formData.academicYear}
                                  onChange={(e) =>
                                    setFormData({ ...formData, academicYear: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleAddMark}>
                                Add Mark
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit Mark</DialogTitle>
                              <DialogDescription>
                                Make changes to the mark here.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editStudentName" className="text-right">
                                  Student Name
                                </Label>
                                <Input
                                  id="editStudentName"
                                  value={editingMark ? getStudentName(editingMark.studentId) : ""}
                                  className="col-span-3"
                                  readOnly
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editInternal1" className="text-right">
                                  Internal 1
                                </Label>
                                <Input
                                  id="editInternal1"
                                  type="number"
                                  value={formData.internal1}
                                  onChange={(e) =>
                                    setFormData({ ...formData, internal1: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editInternal2" className="text-right">
                                  Internal 2
                                </Label>
                                <Input
                                  id="editInternal2"
                                  type="number"
                                  value={formData.internal2}
                                  onChange={(e) =>
                                    setFormData({ ...formData, internal2: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editExternal" className="text-right">
                                  External
                                </Label>
                                <Input
                                  id="editExternal"
                                  type="number"
                                  value={formData.external}
                                  onChange={(e) =>
                                    setFormData({ ...formData, external: parseInt(e.target.value) })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="editAcademicYear" className="text-right">
                                  Academic Year
                                </Label>
                                <Input
                                  id="editAcademicYear"
                                  value={formData.academicYear}
                                  onChange={(e) =>
                                    setFormData({ ...formData, academicYear: e.target.value })
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" onClick={handleEditMark}>
                                Save changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <div className="relative ml-auto flex-1 md:grow-0">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search student..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <Input
                          type="file"
                          onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                          className="w-[200px]"
                        />
                        <Button size="sm" className="h-8 gap-1" onClick={handleFileUpload}>
                          <Upload className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only">Upload Marks</span>
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Internal 1</TableHead>
                          <TableHead>Internal 2</TableHead>
                          <TableHead>External</TableHead>
                          <TableHead>Academic Year</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMarks.map((mark) => (
                          <TableRow key={mark.id}>
                            <TableCell>{getStudentName(mark.studentId)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{mark.internal1}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{mark.internal2}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{mark.external}</Badge>
                            </TableCell>
                            <TableCell>{mark.academicYear}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => openEditDialog(mark)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteMark(mark.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}