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
import { Download, FileText, Clock, CheckCircle } from "lucide-react"
import { studentApiClient, type BonafideRequest, type SubmitBonafideRequest } from "@/lib/student-api"

export default function BonafidePage() {
  const [formData, setFormData] = useState<SubmitBonafideRequest>({
    purpose: "",
    customPurpose: "",
    additionalInfo: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certificates, setCertificates] = useState<BonafideRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const studentId = user.studentId || 1

        const response = await studentApiClient.getBonafideRequests(studentId)
        setCertificates(response.content)
      } catch (error) {
        console.error("Failed to fetch certificates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const studentId = user.studentId || 1

      await studentApiClient.submitBonafideRequest(studentId, formData)
      alert("Bonafide certificate request submitted successfully!")

      setFormData({ purpose: "", customPurpose: "", additionalInfo: "" })

      // Refresh certificates list
      const response = await studentApiClient.getBonafideRequests(studentId)
      setCertificates(response.content)
    } catch (error) {
      console.error("Failed to submit request:", error)
      alert("Failed to submit request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = (certificateId: number) => {
    alert(`Downloading certificate ${certificateId}...`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bonafide Certificate</h1>
        <p className="text-gray-600">Request and download your bonafide certificates</p>
      </div>

      {/* Request New Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Request New Certificate</CardTitle>
          <CardDescription>Fill out the form below to request a new bonafide certificate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scholarship Application">Scholarship Application</SelectItem>
                  <SelectItem value="Bank Loan">Bank Loan</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Job Application">Job Application</SelectItem>
                  <SelectItem value="Visa Application">Visa Application</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.purpose === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customPurpose">Specify Purpose</Label>
                <Input
                  id="customPurpose"
                  placeholder="Enter the specific purpose"
                  value={formData.customPurpose || ""}
                  onChange={(e) => setFormData({ ...formData, customPurpose: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional details or special requirements"
                value={formData.additionalInfo || ""}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !formData.purpose}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Certificates */}
      <Card>
        <CardHeader>
          <CardTitle>Your Certificates</CardTitle>
          <CardDescription>View and download your previously requested certificates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{cert.purpose === "Other" ? cert.customPurpose : cert.purpose}</h4>
                      <p className="text-sm text-gray-600">
                        Requested: {new Date(cert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={cert.status === "APPROVED" ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {cert.status === "APPROVED" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {cert.status}
                    </Badge>

                    {cert.status === "APPROVED" && (
                      <Button size="sm" onClick={() => handleDownload(cert.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">You haven't requested any certificates yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Certificate requests are typically processed within 2-3 working days.</p>
            <p>• You will receive an email notification once your certificate is ready for download.</p>
            <p>• Downloaded certificates are valid for official purposes and contain a unique verification code.</p>
            <p>• For urgent requests, please contact the examination cell directly.</p>
            <p>• Certificates remain available for download for 30 days after approval.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
