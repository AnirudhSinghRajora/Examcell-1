"use client"

import { useState } from "react"
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
import { MessageSquare, Eye, Reply, Search, Filter } from "lucide-react"
import { apiClient, type Query, type QueryFilters } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

export default function QueriesPage() {
  const [filters, setFilters] = useState<QueryFilters>({ page: 0, size: 10 })
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [response, setResponse] = useState("")
  const [isResponding, setIsResponding] = useState(false)

  const { data: queriesData, loading, error, refetch } = useApi(() => apiClient.getQueries(filters), [filters])

  const queries = queriesData?.content || []
  const totalElements = queriesData?.totalElements || 0

  const handleStatusChange = async (queryId: string, newStatus: string) => {
    try {
      await apiClient.updateQueryStatus(queryId, newStatus)
      refetch()
      if (selectedQuery?.id === queryId) {
        const updatedQuery = await apiClient.getQuery(queryId)
        setSelectedQuery(updatedQuery)
      }
    } catch (error) {
      console.error("Failed to update query status:", error)
      alert("Failed to update query status")
    }
  }

  const handleSendResponse = async () => {
    if (!selectedQuery || !response.trim()) return

    setIsResponding(true)
    try {
      await apiClient.respondToQuery(selectedQuery.id, response, "Admin")
      setResponse("")
      setSelectedQuery(null)
      refetch()
      alert("Response sent successfully!")
    } catch (error) {
      console.error("Failed to send response:", error)
      alert("Failed to send response")
    } finally {
      setIsResponding(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "RESOLVED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 0 }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status.toUpperCase(),
      page: 0,
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Query Management</h1>
          <p className="text-gray-600">Loading queries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Query Management</h1>
          <p className="text-red-600">Error loading queries: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Query Management</h1>
        <p className="text-gray-600">Manage and respond to student queries</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search queries..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries List */}
      <div className="space-y-4">
        {queries.map((query) => (
          <Card key={query.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{query.title}</CardTitle>
                  <CardDescription>
                    {query.studentName} ({query.studentRollNo}) • {query.subject} • {query.faculty}
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted: {new Date(query.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(query.priority)}>{query.priority}</Badge>
                  <Badge className={getStatusColor(query.status)}>{query.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 line-clamp-2">{query.description}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedQuery(query)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedQuery?.title}</DialogTitle>
                      <DialogDescription>
                        Query from {selectedQuery?.studentName} ({selectedQuery?.studentRollNo})
                      </DialogDescription>
                    </DialogHeader>

                    {selectedQuery && (
                      <div className="space-y-6">
                        {/* Query Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Student</Label>
                            <p className="text-sm text-gray-700">
                              {selectedQuery.studentName} ({selectedQuery.studentRollNo})
                            </p>
                            <p className="text-sm text-gray-500">{selectedQuery.studentEmail}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Subject & Faculty</Label>
                            <p className="text-sm text-gray-700">{selectedQuery.subject}</p>
                            <p className="text-sm text-gray-500">{selectedQuery.faculty}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Priority</Label>
                            <Badge className={`w-fit ${getPriorityColor(selectedQuery.priority)}`}>
                              {selectedQuery.priority}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <Select
                              value={selectedQuery.status}
                              onValueChange={(value) => handleStatusChange(selectedQuery.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Query Description */}
                        <div>
                          <Label className="text-sm font-medium">Query Description</Label>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{selectedQuery.description}</p>
                          </div>
                        </div>

                        {/* Attachments */}
                        {selectedQuery.attachments && selectedQuery.attachments.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Attachments</Label>
                            <div className="mt-2 space-y-2">
                              {selectedQuery.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                                  <span className="text-sm">{attachment}</span>
                                  <Button size="sm" variant="outline">
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Previous Response */}
                        {selectedQuery.response && (
                          <div>
                            <Label className="text-sm font-medium">Previous Response</Label>
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

                        {/* Response Form */}
                        <div>
                          <Label htmlFor="response" className="text-sm font-medium">
                            {selectedQuery.response ? "Additional Response" : "Response"}
                          </Label>
                          <Textarea
                            id="response"
                            placeholder="Type your response here..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                          <Button
                            className="mt-3"
                            onClick={handleSendResponse}
                            disabled={!response.trim() || isResponding}
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            {isResponding ? "Sending..." : "Send Response"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {query.status !== "RESOLVED" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedQuery(query)
                    }}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {queries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status
                ? "No queries match your current filters."
                : "No student queries have been submitted yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="flex justify-center">
          <p className="text-sm text-gray-600">
            Showing {queries.length} of {totalElements} queries
          </p>
        </div>
      )}
    </div>
  )
}
