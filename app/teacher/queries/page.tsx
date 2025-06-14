"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Eye, Clock, CheckCircle, AlertCircle, MessageSquare, RefreshCw } from "lucide-react"
import { teacherApiClient, type TeacherQuery, type SubmitQueryRequest } from "@/lib/teacher-api"

export default function QueryAdminPage() {
  const [formData, setFormData] = useState<SubmitQueryRequest>({
    subject: "",
    faculty: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<TeacherQuery | null>(null)
  const [queries, setQueries] = useState<TeacherQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [teacherId, setTeacherId] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)

  const refreshQueries = async () => {
    try {
      console.log("Fetching queries for teacher ID:", teacherId)
      const response = await teacherApiClient.getTeacherQueries(teacherId)
      console.log("API Response:", response)

      // Handle both direct array and paginated response
      if (Array.isArray(response)) {
        setQueries(response)
      } else if (response && response.content && Array.isArray(response.content)) {
        setQueries(response.content)
      } else {
        console.warn("Unexpected response format:", response)
        setQueries([])
      }
      setError(null)
    } catch (error) {
      console.error("Failed to refresh queries:", error)
      setError(error instanceof Error ? error.message : "Failed to load queries")
      setQueries([])
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        console.log("User from localStorage:", user)

        const id = user.teacherId || user.id || 1
        console.log("Using teacher ID:", id)
        setTeacherId(id)

        await refreshQueries()
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        setError(error instanceof Error ? error.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teacherId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Submitting query:", formData)
      const result = await teacherApiClient.submitQueryToAdmin(teacherId, formData)
      console.log("Submit result:", result)

      // Reset form
      setFormData({
        subject: "",
        faculty: "Admin",
        title: "",
        description: "",
        priority: "MEDIUM",
      })
      setShowDialog(false)

      // Wait a moment then refresh
      setTimeout(async () => {
        await refreshQueries()
      }, 1000)

      alert("Query submitted to admin successfully!")
    } catch (error) {
      console.error("Failed to submit query:", error)
      alert("Failed to submit query. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const queryCategories = [
    "Academic Administration",
    "Student Issues",
    "Technical Support",
    "Resource Request",
    "Policy Clarification",
    "Examination Related",
    "Infrastructure",
    "Other",
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Query Admin</h1>
          <p className="text-gray-600">Submit and track your queries to administration</p>
          {/* Debug info */}
          <p className="text-xs text-gray-400">
            Teacher ID: {teacherId} | Queries: {queries.length}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshQueries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Query to Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Query to Admin</DialogTitle>
                <DialogDescription>Fill out the form below to submit your query to administration</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Query Category</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        subject: value,
                        faculty: "Admin",
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select query category" />
                    </SelectTrigger>
                    <SelectContent>
                      {queryCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Query Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your query"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your query to admin..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !formData.subject || !formData.title || !formData.description}
                >
                  {isSubmitting ? "Submitting..." : "Submit Query to Admin"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
            <Button variant="outline" size="sm" onClick={refreshQueries} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Existing Queries */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">Loading your queries...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <Card key={query.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      {query.title}
                    </CardTitle>
                    <CardDescription>
                      {query.subject} • To: {query.faculty} • {new Date(query.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`flex items-center gap-1 ${getPriorityColor(query.priority)}`}>
                      {query.priority}
                    </Badge>
                    <Badge className={`flex items-center gap-1 ${getStatusColor(query.status)}`}>
                      {getStatusIcon(query.status)}
                      {query.status}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedQuery(query)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            {selectedQuery?.title}
                          </DialogTitle>
                          <DialogDescription>Query to Administration</DialogDescription>
                        </DialogHeader>
                        {selectedQuery && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Category</Label>
                                <p className="text-sm text-gray-700">{selectedQuery.subject}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Priority</Label>
                                <Badge className={`${getPriorityColor(selectedQuery.priority)} text-xs`}>
                                  {selectedQuery.priority}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{selectedQuery.description}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`flex items-center gap-1 ${getStatusColor(selectedQuery.status)}`}>
                                  {getStatusIcon(selectedQuery.status)}
                                  {selectedQuery.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  Submitted on {new Date(selectedQuery.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {selectedQuery.response && (
                              <div>
                                <Label className="text-sm font-medium">Admin Response</Label>
                                <div className="mt-2 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                  <p className="text-gray-700">{selectedQuery.response}</p>
                                  {selectedQuery.respondedBy && selectedQuery.respondedAt && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      Responded by {selectedQuery.respondedBy} on{" "}
                                      {new Date(selectedQuery.respondedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2">{query.description}</p>
                {query.response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">
                      <strong>Admin Response:</strong> {query.response.substring(0, 100)}
                      {query.response.length > 100 && "..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && queries.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No queries submitted yet</h3>
            <p className="text-gray-500 mb-4">You haven't submitted any queries to admin yet.</p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Query
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
