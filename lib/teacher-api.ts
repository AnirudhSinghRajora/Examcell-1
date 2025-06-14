const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class TeacherApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    // Retrieve token from localStorage or another secure place
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Teacher Dashboard
  async getTeacherDashboard(teacherId: number) {
    return this.request<TeacherDashboard>(`/teacher/dashboard/${teacherId}`)
  }

  // Teacher Queries
  async getTeacherQueries(teacherId: number, status?: string, page = 0, size = 10) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (status) params.append("status", status)
    return this.request<PagedResponse<TeacherQuery>>(`/teacher/${teacherId}/queries?${params}`)
  }

  async respondToQuery(teacherId: number, queryId: number, response: string) {
    return this.request<TeacherQuery>(
      `/teacher/${teacherId}/queries/${queryId}/respond?response=${encodeURIComponent(response)}`,
      {
        method: "POST",
      },
    )
  }

  async submitQueryToAdmin(teacherId: number, query: SubmitQueryRequest) {
    return this.request<TeacherQuery>(`/teacher/${teacherId}/queries/admin`, {
      method: "POST",
      body: JSON.stringify(query),
    })
  }

  // Marks Management
  async getSubjectMarks(teacherId: number, subjectId: number) {
    return this.request<TeacherMark[]>(`/teacher/${teacherId}/subjects/${subjectId}/marks`)
  }

  async createMark(teacherId: number, mark: CreateMarkRequest) {
    return this.request<TeacherMark>(`/teacher/${teacherId}/marks`, {
      method: "POST",
      body: JSON.stringify(mark),
    })
  }

  async updateMark(teacherId: number, markId: number, mark: UpdateMarkRequest) {
    return this.request<TeacherMark>(`/teacher/${teacherId}/marks/${markId}`, {
      method: "PUT",
      body: JSON.stringify(mark),
    })
  }

  async deleteMark(teacherId: number, markId: number) {
    return this.request<void>(`/teacher/${teacherId}/marks/${markId}`, {
      method: "DELETE",
    })
  }

  async uploadMarks(teacherId: number, file: File, subjectId: number, semester: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subjectId", subjectId.toString())
    formData.append("semester", semester)

    return this.request<TeacherMark[]>(`/teacher/${teacherId}/marks/upload`, {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }
}

// Types
export interface TeacherDashboard {
  teacher: {
    id: number
    employeeId: string
    name: string
    email: string
    department: string
    designation: string
    specialization: string
  }
  totalStudents: number
  pendingQueries: number
  subjectsTeaching: number
  marksUploaded: number
  recentQueries: TeacherQuery[]
  assignedSubjects: TeacherSubject[]
}

export interface TeacherQuery {
  id: number
  studentId: number
  subject: string
  faculty: string
  title: string
  description: string
  status: string
  priority: string
  response?: string
  respondedBy?: string
  respondedAt?: string
  studentName: string
  studentRollNo: string
  studentEmail: string
  createdAt: string
  updatedAt: string
}

export interface TeacherMark {
  id: number
  studentId: number
  subjectId: number
  marks: number
  grade: string
  examType: string
  academicYear: string
  uploadedBy: string
  studentName: string
  studentRollNo: string
  subjectName: string
  subjectCode: string
  createdAt: string
  updatedAt: string
}

export interface TeacherSubject {
  id: number
  code: string
  name: string
  semester: string
  department: string
  credits: number
  faculty: string
}

export interface SubmitQueryRequest {
  subject: string
  faculty: string
  title: string
  description: string
  priority?: string
}

export interface CreateMarkRequest {
  studentId: number
  subjectId: number
  marks: number
  examType?: string
  academicYear?: string
}

export interface UpdateMarkRequest {
  marks: number
  examType?: string
  academicYear?: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export const teacherApiClient = new TeacherApiClient()
