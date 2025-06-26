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
import { Plus, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { studentApiClient, type StudentQuery, type StudentSubject, type SubmitQueryRequest } from "@/lib/student-api"
import { useAuth } from "@/context/AuthContext"

export default function QueriesPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SubmitQueryRequest>({
    subject: "",
    queryText: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState<StudentQuery | null>(null)
  const [queries, setQueries] = useState<StudentQuery[]>([])
  const [subjects, setSubjects] = useState<StudentSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.studentId) {
        console.log("No studentId found in user:", user);
        return;
      }
      
      setLoading(true)
      try {
        console.log("Fetching queries and subjects for studentId:", user.studentId);
        const [queriesResponse, subjectsResponse] = await Promise.all([
          studentApiClient.getStudentQueries(user.studentId),
          studentApiClient.getSubjects(user.studentId),
        ])

        console.log("Queries response:", queriesResponse);
        console.log("Subjects response:", subjectsResponse);
        setQueries(queriesResponse.content)
        setSubjects(subjectsResponse)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.studentId) {
      alert("User not authenticated");
      return;
    }
    
    setIsSubmitting(true)

    try {
      await studentApiClient.submitQuery(user.studentId, formData)
      alert("Query submitted successfully!")

      setFormData({
        subject: "",
        queryText: "",
      })
      setShowDialog(false)

      // Refresh queries list
      const response = await studentApiClient.getStudentQueries(user.studentId)
      setQueries(response.content)
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
      case "OPEN":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "CLOSED":
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "OPEN":
        return "bg-yellow-100 text-yellow-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const selectedSubject = subjects.find((s) => s.name === formData.subject)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Academic Queries</h1>
          <p className="text-gray-600">Submit and track your academic queries</p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Query
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit New Query</DialogTitle>
              <DialogDescription>Fill out the form below to submit your academic query</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => {
                    const subject = subjects.find((s) => s.name === value)
                    setFormData({
                      ...formData,
                      subject: value,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.name}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="queryText">Detailed Description</Label>
                <Textarea
                  id="queryText"
                  placeholder="Provide detailed information about your query..."
                  value={formData.queryText}
                  onChange={(e) => setFormData({ ...formData, queryText: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !formData.subject || !formData.queryText}
              >
                {isSubmitting ? "Submitting..." : "Submit Query"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <Card key={query.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{query.subject}</CardTitle>
                    <CardDescription>
                      {new Date(query.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
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
                          <DialogTitle>{selectedQuery?.subject}</DialogTitle>
                          <DialogDescription>Query Details</DialogDescription>
                        </DialogHeader>
                        {selectedQuery && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Subject</Label>
                              <p className="text-sm text-gray-700">{selectedQuery.subject}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Query</Label>
                              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-700">{selectedQuery.queryText}</p>
                              </div>
                            </div>
                            {selectedQuery.response && (
                              <div>
                                <Label className="text-sm font-medium">Response</Label>
                                <div className="mt-2 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                  <p className="text-gray-700">{selectedQuery.response}</p>
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
                <p className="text-gray-700 line-clamp-2">{query.queryText}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && queries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">You haven't submitted any queries yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
