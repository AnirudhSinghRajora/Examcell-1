"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, MessageSquare, User, Building } from "lucide-react"
import Link from "next/link"

interface ContactForm {
  name: string
  email: string
  phone: string
  userType: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    userType: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Your message has been sent successfully! We'll get back to you within 24 hours.",
        })
        setFormData({
          name: "",
          email: "",
          phone: "",
          userType: "",
          subject: "",
          message: "",
        })
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Failed to send message. Please try again.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: ["examcell@college.edu", "admin@college.edu"],
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 12345 67890", "+91 98765 43210"],
      description: "Call us during office hours",
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["College Examination Cell", "Main Building, 2nd Floor", "College Campus, City - 123456"],
      description: "Visit us in person",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: ["Monday - Friday: 9:00 AM - 5:00 PM", "Saturday: 9:00 AM - 1:00 PM", "Sunday: Closed"],
      description: "When we're available",
    },
  ]

  const quickLinks = [
    { title: "Student Login", href: "/auth/login?role=student", icon: User },
    { title: "Teacher Login", href: "/auth/role-login", icon: Building },
    { title: "Admin Login", href: "/auth/role-login", icon: Building },
    { title: "Submit Query", href: "/student/queries", icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get in touch with the College Examination Cell for any assistance or inquiries
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus.type && (
                  <Alert
                    className={`mb-6 ${submitStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={submitStatus.type === "success" ? "text-green-800" : "text-red-800"}>
                      {submitStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userType">I am a *</Label>
                      <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher/Faculty</SelectItem>
                          <SelectItem value="parent">Parent/Guardian</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="results">Results & Grades</SelectItem>
                        <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="admission">Admission Related</SelectItem>
                        <SelectItem value="examination">Examination Schedule</SelectItem>
                        <SelectItem value="complaint">Complaint/Grievance</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your inquiry in detail..."
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isSubmitting ||
                      !formData.name ||
                      !formData.email ||
                      !formData.userType ||
                      !formData.subject ||
                      !formData.message
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <info.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-800">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access different portals and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Button key={index} asChild variant="outline" className="h-20 flex-col">
                  <Link href={link.href}>
                    <link.icon className="h-6 w-6 mb-2" />
                    {link.title}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Common questions and their answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How can I check my results?</h4>
                  <p className="text-sm text-gray-600">
                    Log in to the student portal using your credentials and navigate to the Results section.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How do I request a bonafide certificate?</h4>
                  <p className="text-sm text-gray-600">
                    Use the Bonafide Certificate section in the student portal to submit your request online.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What if I forgot my login credentials?</h4>
                  <p className="text-sm text-gray-600">
                    Contact the examination cell with your student ID and we'll help you reset your credentials.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How long does it take to process queries?</h4>
                  <p className="text-sm text-gray-600">
                    Most queries are resolved within 2-3 working days. Urgent matters are prioritized.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Can I submit documents online?</h4>
                  <p className="text-sm text-gray-600">
                    Yes, you can upload supporting documents when submitting queries or certificate requests.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Is there a mobile app available?</h4>
                  <p className="text-sm text-gray-600">
                    Currently, we offer a responsive web portal that works well on all devices including mobile.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
