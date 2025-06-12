import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, FileText, Calculator, BookOpen } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">College Exam Cell</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamlined examination management system for students, teachers, and administrators
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/login?role=student">Student Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/auth/login?role=teacher">Teacher Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/auth/login?role=admin">Admin Login</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>View Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Access your examination results and academic performance</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calculator className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <CardTitle>CGPA Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Calculate your CGPA based on your semester marks</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Bonafide Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Generate and download official bonafide certificates</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="w-12 h-12 mx-auto text-orange-600 mb-2" />
              <CardTitle>Teacher Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage subjects, marks, and student queries</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">Contact the examination cell for any assistance or technical support</p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
