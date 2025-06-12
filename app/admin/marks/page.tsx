"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, Download, FileSpreadsheet, Plus, Edit, Trash2 } from "lucide-react"
import { apiClient, type Mark, type MarkFilters, type CreateMarkRequest } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

export default function MarksPage() {
  const [filters, setFilters] = useState<MarkFilters>({ page: 0, size: 10 })
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editingMark, setEditingMark] = useState<Mark | null>(null)
  const [newMark, setNewMark] = useState<CreateMarkRequest>({
    studentId: 0,
    subjectId: 0,
    marks: 0,
    examType: "FINAL",
    uploadedBy: "Admin",
  })
  const [showAddDialog, setShowAddDialog] = useState(false)

  const {
    data: marksData,
    loading: marksLoading,
    error: marksError,
    refetch: refetchMarks,
  } = useApi(() => apiClient.getMarks(filters), [filters])

  const { data: subjects, loading: subjectsLoading } = useApi(() => apiClient.getSubjects(), [])

  const marks = marksData?.content || []
  const totalElements = marksData?.totalElements || 0

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !selectedSubject || !selectedSemester) return

    setIsUploading(true)
    try {
      await apiClient.uploadMarks(uploadFile, Number.parseInt(selectedSubject), selectedSemester, "Admin")
      alert("Marks uploaded successfully!")
      setUploadFile(null)
      setSelectedSubject("")
      setSelectedSemester("")
      refetchMarks()
    } catch (error) {
      console.error("Failed to upload marks:", error)
      alert("Failed to upload marks")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await apiClient.downloadMarksTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = "marks_template.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download template:", error)
      alert("Failed to download template")
    }
  }

  const handleEditMark = (mark: Mark) => {
    setEditingMark(mark)
  }

  const handleSaveMark = async () => {
    if (!editingMark) return

    try {
      await apiClient.updateMark(editingMark.id, {
        marks: editingMark.marks,
        examType: editingMark.examType,
        uploadedBy: "Admin",
      })
      alert("Mark updated successfully!")
      setEditingMark(null)
      refetchMarks()
    } catch (error) {
      console.error("Failed to update mark:", error)
      alert("Failed to update mark")
    }
  }

  const handleDeleteMark = async (id: number) => {
    if (confirm("Are you sure you want to delete this mark?")) {
      try {
        await apiClient.deleteMark(id)
        alert("Mark deleted successfully!")
        refetchMarks()
      } catch (error) {
        console.error("Failed to delete mark:", error)
        alert("Failed to delete mark")
      }
    }
  }

  const handleAddMark = async () => {
    try {
      await apiClient.createMark(newMark)
      alert("Mark added successfully!")
      setShowAddDialog(false)
      setNewMark({
        studentId: 0,
        subjectId: 0,
        marks: 0,
        examType: "FINAL",
        uploadedBy: "Admin",
      })
      refetchMarks()
    } catch (error) {
      console.error("Failed to add mark:", error)
      alert("Failed to add mark")
    }
  }

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, studentSearch: search, page: 0 }))
  }

  const handleSubjectFilter = (subjectCode: string) => {
    setFilters((prev) => ({
      ...prev,
      subjectCode: subjectCode === "all" ? undefined : subjectCode,
      page: 0,
    }))
  }

  if (marksLoading || subjectsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marks Management</h1>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    )
  }

  if (marksError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marks Management</h1>
          <p className="text-red-600">Error loading marks: {marksError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marks Management</h1>
        <p className="text-gray-600">Upload and manage student marks</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Marks
          </CardTitle>
          <CardDescription>Upload student marks via Excel file or enter manually</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">Semester 1</SelectItem>
                    <SelectItem value="2nd">Semester 2</SelectItem>
                    <SelectItem value="3rd">Semester 3</SelectItem>
                    <SelectItem value="4th">Semester 4</SelectItem>
                    <SelectItem value="5th">Semester 5</SelectItem>
                    <SelectItem value="6th">Semester 6</SelectItem>
                    <SelectItem value="7th">Semester 7</SelectItem>
                    <SelectItem value="8th">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500">
                Upload Excel file with student marks. Download template for format reference.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isUploading || !uploadFile || !selectedSubject || !selectedSemester}>
                {isUploading ? "Uploading..." : "Upload Marks"}
              </Button>
              <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Student Marks</CardTitle>
              <CardDescription>View and manage individual student marks</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mark
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Mark</DialogTitle>
                  <DialogDescription>Enter student mark details manually</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student ID</Label>
                    <Input
                      type="number"
                      placeholder="Enter student ID"
                      value={newMark.studentId || ""}
                      onChange={(e) =>
                        setNewMark((prev) => ({ ...prev, studentId: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={newMark.subjectId.toString()}
                      onValueChange={(value) => setNewMark((prev) => ({ ...prev, subjectId: Number.parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marks</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter marks"
                      value={newMark.marks || ""}
                      onChange={(e) => setNewMark((prev) => ({ ...prev, marks: Number.parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddMark}>
                    Add Mark
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by student name or roll number..."
                value={filters.studentSearch || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Select value={filters.subjectCode || "all"} onValueChange={handleSubjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.code}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Roll No</th>
                  <th className="text-left py-2">Student Name</th>
                  <th className="text-left py-2">Subject</th>
                  <th className="text-center py-2">Marks</th>
                  <th className="text-center py-2">Grade</th>
                  <th className="text-center py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => (
                  <tr key={mark.id} className="border-b">
                    <td className="py-3 font-mono text-sm">{mark.studentRollNo}</td>
                    <td className="py-3">{mark.studentName}</td>
                    <td className="py-3">{mark.subjectName}</td>
                    <td className="py-3 text-center font-semibold">{mark.marks}</td>
                    <td className="py-3 text-center">
                      <Badge variant={mark.grade.includes("A") ? "default" : "secondary"}>{mark.grade}</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditMark(mark)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMark(mark.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {marks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No marks found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Mark Dialog */}
      <Dialog open={!!editingMark} onOpenChange={() => setEditingMark(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mark</DialogTitle>
            <DialogDescription>Update student mark details</DialogDescription>
          </DialogHeader>
          {editingMark && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Input value={`${editingMark.studentRollNo} - ${editingMark.studentName}`} disabled />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={editingMark.subjectName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editingMark.marks}
                  onChange={(e) =>
                    setEditingMark((prev) => (prev ? { ...prev, marks: Number.parseInt(e.target.value) || 0 } : null))
                  }
                />
              </div>
              <Button className="w-full" onClick={handleSaveMark}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {marks.length} of {totalElements} marks
          </p>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Download the Excel template to ensure proper format</p>
            <p>• Include columns: Roll Number, Marks</p>
            <p>• Marks should be between 0-100</p>
            <p>• Ensure all roll numbers are valid and exist in the system</p>
            <p>• File size should not exceed 5MB</p>
            <p>• Supported formats: .xlsx, .xls</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
