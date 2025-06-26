"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FileText, Eye, Check, X, Search, Filter, Download } from "lucide-react"
import { apiClient, type BonafideRequest, type BonafideFilters } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

export default function BonafidePage() {
  const [filters, setFilters] = useState<BonafideFilters>({ page: 0, size: 10 })
  const [selectedRequest, setSelectedRequest] = useState<BonafideRequest | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    data: requestsData,
    loading,
    error,
    refetch,
  } = useApi(() => apiClient.getBonafideRequests(filters), [filters])

  const requests = requestsData?.content || []
  const totalElements = requestsData?.totalElements || 0

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true)
    try {
      await apiClient.approveBonafideRequest(requestId, "Admin")
      refetch()
      if (selectedRequest?.id === requestId) {
        const updatedRequest = await apiClient.getBonafideRequest(requestId)
        setSelectedRequest(updatedRequest)
      }
      alert("Bonafide request approved successfully!")
    } catch (error) {
      console.error("Failed to approve request:", error)
      alert("Failed to approve request")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      setIsProcessing(true)
      try {
        await apiClient.rejectBonafideRequest(requestId, "Request rejected by admin", "Admin")
        refetch()
        if (selectedRequest?.id === requestId) {
          const updatedRequest = await apiClient.getBonafideRequest(requestId)
          setSelectedRequest(updatedRequest)
        }
        alert("Bonafide request rejected.")
      } catch (error) {
        console.error("Failed to reject request:", error)
        alert("Failed to reject request")
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const handleGenerateCertificate = (requestId: string) => {
    alert(`Generating bonafide certificate for request ${requestId}...`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
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

  // Calculate stats
  const totalRequests = requests.length
  const pendingRequests = requests.filter((r) => r.status === "PENDING").length
  const approvedRequests = requests.filter((r) => r.status === "APPROVED").length
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bonafide Certificate Requests</h1>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bonafide Certificate Requests</h1>
          <p className="text-red-600">Error loading requests: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bonafide Certificate Requests</h1>
        <p className="text-gray-600">Review and approve student bonafide certificate requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
          </CardContent>
        </Card>
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
                  placeholder="Search requests..."
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {request.purpose === "Other" ? request.customPurpose : request.purpose}
                  </CardTitle>
                  <CardDescription>
                    {request.studentName || 'N/A'} ({request.studentRollNo || 'N/A'}) • {request.studentSemester ? `${request.studentSemester} Semester` : 'N/A'}
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{request.additionalInfo || 'No additional information provided.'}</p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Bonafide Certificate Request</DialogTitle>
                      <DialogDescription>Request details from {selectedRequest?.studentName || 'N/A'}</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                      <div className="space-y-6">
                        {/* Student Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Student Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Name:</strong> {selectedRequest.studentName || 'N/A'}
                              </p>
                              <p>
                                <strong>Roll No:</strong> {selectedRequest.studentRollNo || 'N/A'}
                              </p>
                              <p>
                                <strong>Email:</strong> {selectedRequest.studentEmail || 'N/A'}
                              </p>
                              <p>
                                <strong>Semester:</strong> {selectedRequest.studentSemester ? `${selectedRequest.studentSemester} Semester` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Request Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Purpose:</strong>{" "}
                                {selectedRequest.purpose === "Other"
                                  ? selectedRequest.customPurpose || 'N/A'
                                  : selectedRequest.purpose || 'N/A'}
                              </p>
                              <p>
                                <strong>Submitted:</strong> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                              <p>
                                <strong>Status:</strong>
                                <Badge className={`ml-2 ${getStatusColor(selectedRequest.status || '')}`}>
                                  {selectedRequest.status || 'N/A'}
                                </Badge>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h4 className="font-medium mb-2">Additional Information</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{selectedRequest.additionalInfo || 'No additional information provided.'}</p>
                          </div>
                        </div>

                        {/* Approval Information */}
                        {selectedRequest.status !== "PENDING" && (
                          <div>
                            <h4 className="font-medium mb-2">Approval Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Status:</strong> {selectedRequest.status || 'N/A'}
                              </p>
                              <p>
                                <strong>Date:</strong>{" "}
                                {selectedRequest.approvedAt
                                  ? new Date(selectedRequest.approvedAt).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <p>
                                <strong>Approved By:</strong> {selectedRequest.approvedBy || "N/A"}
                              </p>
                              {selectedRequest.certificateNumber && (
                                <p>
                                  <strong>Certificate Number:</strong> {selectedRequest.certificateNumber}
                                </p>
                              )}
                              {selectedRequest.rejectionReason && (
                                <p>
                                  <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {selectedRequest.status === "PENDING" && (
                            <>
                              <Button
                                onClick={() => handleApprove(selectedRequest.id)}
                                className="flex-1"
                                disabled={isProcessing}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                {isProcessing ? "Processing..." : "Approve"}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(selectedRequest.id)}
                                className="flex-1"
                                disabled={isProcessing}
                              >
                                <X className="h-4 w-4 mr-2" />
                                {isProcessing ? "Processing..." : "Reject"}
                              </Button>
                            </>
                          )}
                          {selectedRequest.status === "APPROVED" && (
                            <Button onClick={() => handleGenerateCertificate(selectedRequest.id)} className="w-full">
                              <Download className="h-4 w-4 mr-2" />
                              Generate Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {request.status === "PENDING" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(request.id)} disabled={isProcessing}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(request.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}

                {request.status === "APPROVED" && (
                  <Button size="sm" variant="outline" onClick={() => handleGenerateCertificate(request.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status
                ? "No requests match your current filters."
                : "All bonafide certificate requests will appear here."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {requestsData && requestsData.totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
            disabled={requestsData.first}
            className="mr-2"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(requestsData.totalPages - 1, prev.page + 1) }))}
            disabled={requestsData.last}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
