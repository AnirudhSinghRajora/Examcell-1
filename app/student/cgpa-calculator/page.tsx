"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Download } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { studentApiClient, type StudentDashboard } from "@/lib/student-api"

export default function CGPACalculatorPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run the effect if we have a user object
    if (!user || !user.studentId) {
      console.log("DEBUG: User or studentId missing:", { user, studentId: user?.studentId });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const studentId = user.studentId!;
        console.log("DEBUG: Fetching CGPA for studentId:", studentId);

        const data = await studentApiClient.getStudentDashboard(studentId);
        console.log("DEBUG: Dashboard data received:", data);
        setDashboardData(data);
      } catch (err) {
        console.error("DEBUG: CGPA fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load CGPA");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // The effect depends on the user object

  const getCGPAColor = (cgpa: number) => {
    if (cgpa >= 9) return "text-green-600"
    if (cgpa >= 8) return "text-blue-600"
    if (cgpa >= 7) return "text-yellow-600"
    if (cgpa >= 6) return "text-orange-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
          <p className="text-gray-600">Loading your CGPA...</p>
        </div>
        {/* You can add a more detailed skeleton loader here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">CGPA Calculator</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CGPA Calculator</h1>
        <p className="text-gray-600">Your Cumulative Grade Point Average</p>
      </div>

      {/* CGPA Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Your CGPA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboardData ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No CGPA data available</p>
            </div>
          ) : (
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getCGPAColor(dashboardData.cgpa)}`}>
                {dashboardData.cgpa.toFixed(2)}
              </div>
              <p className="text-gray-600">
                Based on {dashboardData.completedSemesters} completed semesters
              </p>
              <div className="mt-4">
                <Badge
                  variant={dashboardData.cgpa >= 8 ? "default" : dashboardData.cgpa >= 6 ? "secondary" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {dashboardData.cgpa >= 9
                    ? "Excellent"
                    : dashboardData.cgpa >= 8
                      ? "Very Good"
                      : dashboardData.cgpa >= 7
                        ? "Good"
                        : dashboardData.cgpa >= 6
                          ? "Satisfactory"
                          : dashboardData.cgpa > 0
                            ? "Needs Improvement"
                            : "No Data"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Info */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{dashboardData.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="font-medium">{dashboardData.student.rollNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Semester</p>
                <p className="font-medium">{dashboardData.student.semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{dashboardData.student.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { grade: "A+", points: 10, range: "90-100" },
              { grade: "A", points: 9, range: "80-89" },
              { grade: "B+", points: 8, range: "70-79" },
              { grade: "B", points: 7, range: "60-69" },
              { grade: "C+", points: 6, range: "50-59" },
              { grade: "C", points: 5, range: "40-49" },
              { grade: "D", points: 4, range: "35-39" },
              { grade: "F", points: 0, range: "0-34" },
            ].map((item) => (
              <div key={item.grade} className="text-center p-3 border rounded-lg">
                <div className="font-bold text-lg">{item.grade}</div>
                <div className="text-gray-600">{item.points} points</div>
                <div className="text-xs text-gray-500">{item.range}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
