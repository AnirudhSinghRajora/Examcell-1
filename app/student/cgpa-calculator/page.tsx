"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calculator } from "lucide-react"

interface Subject {
  id: string
  name: string
  credits: number
  grade: string
  gradePoints: number
}

const gradeToPoints: { [key: string]: number } = {
  "A+": 10,
  A: 9,
  "B+": 8,
  B: 7,
  "C+": 6,
  C: 5,
  D: 4,
  F: 0,
}

export default function CGPACalculatorPage() {
  const [subjects, setSubjects] = useState<Subject[]>([{ id: "1", name: "", credits: 0, grade: "", gradePoints: 0 }])
  const [cgpa, setCgpa] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: "",
      credits: 0,
      grade: "",
      gradePoints: 0,
    }
    setSubjects([...subjects, newSubject])
  }

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((subject) => subject.id !== id))
    }
  }

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(
      subjects.map((subject) => {
        if (subject.id === id) {
          const updated = { ...subject, [field]: value }
          if (field === "grade") {
            updated.gradePoints = gradeToPoints[value as string] || 0
          }
          return updated
        }
        return subject
      }),
    )
  }

  const calculateCGPA = () => {
    let totalGradePoints = 0
    let totalCreds = 0

    subjects.forEach((subject) => {
      if (subject.credits > 0 && subject.gradePoints > 0) {
        totalGradePoints += subject.credits * subject.gradePoints
        totalCreds += subject.credits
      }
    })

    const calculatedCGPA = totalCreds > 0 ? totalGradePoints / totalCreds : 0
    setCgpa(Math.round(calculatedCGPA * 100) / 100)
    setTotalCredits(totalCreds)
  }

  useEffect(() => {
    calculateCGPA()
  }, [subjects])

  const getCGPAColor = (cgpa: number) => {
    if (cgpa >= 9) return "text-green-600"
    if (cgpa >= 8) return "text-blue-600"
    if (cgpa >= 7) return "text-yellow-600"
    if (cgpa >= 6) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CGPA Calculator</h1>
        <p className="text-gray-600">Calculate your Cumulative Grade Point Average</p>
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
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getCGPAColor(cgpa)}`}>{cgpa.toFixed(2)}</div>
            <p className="text-gray-600">Based on {totalCredits} total credits</p>
            <div className="mt-4">
              <Badge
                variant={cgpa >= 8 ? "default" : cgpa >= 6 ? "secondary" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {cgpa >= 9
                  ? "Excellent"
                  : cgpa >= 8
                    ? "Very Good"
                    : cgpa >= 7
                      ? "Good"
                      : cgpa >= 6
                        ? "Satisfactory"
                        : cgpa > 0
                          ? "Needs Improvement"
                          : "No Data"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Input */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Subject Details</CardTitle>
          <CardDescription>Add your subjects with their respective credits and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <div key={subject.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label htmlFor={`name-${subject.id}`}>Subject Name</Label>
                  <Input
                    id={`name-${subject.id}`}
                    placeholder="e.g., Mathematics"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor={`credits-${subject.id}`}>Credits</Label>
                  <Input
                    id={`credits-${subject.id}`}
                    type="number"
                    min="0"
                    max="10"
                    placeholder="4"
                    value={subject.credits || ""}
                    onChange={(e) => updateSubject(subject.id, "credits", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor={`grade-${subject.id}`}>Grade</Label>
                  <select
                    id={`grade-${subject.id}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={subject.grade}
                    onChange={(e) => updateSubject(subject.id, "grade", e.target.value)}
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+ (10)</option>
                    <option value="A">A (9)</option>
                    <option value="B+">B+ (8)</option>
                    <option value="B">B (7)</option>
                    <option value="C+">C+ (6)</option>
                    <option value="C">C (5)</option>
                    <option value="D">D (4)</option>
                    <option value="F">F (0)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSubject(subject.id)}
                    disabled={subjects.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button onClick={addSubject} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grade Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(gradeToPoints).map(([grade, points]) => (
              <div key={grade} className="text-center p-3 border rounded-lg">
                <div className="font-bold text-lg">{grade}</div>
                <div className="text-gray-600">{points} points</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
