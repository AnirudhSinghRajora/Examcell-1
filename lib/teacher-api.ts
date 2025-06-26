const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class TeacherApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    // Retrieve token from localStorage (authToken key used by AuthContext)
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : undefined
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    console.log("Request config:", { url, headers: config.headers });

    try {
      const response = await fetch(url, config)

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Response error data:", errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json();
      console.log("Response data:", data);
      return data;
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Teacher Dashboard
  async getTeacherDashboard(teacherId: string) {
    return this.request<TeacherDashboard>(`/teacher/dashboard/${teacherId}`)
  }

  // Teacher Queries
  async getTeacherQueries(teacherId: string, status?: string, page = 0, size = 10) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() })
    if (status) params.append("status", status)
    return this.request<PagedResponse<TeacherQuery>>(`/teacher/${teacherId}/queries?${params}`)
  }

  async respondToQuery(teacherId: string, queryId: string, response: string) {
    return this.request<TeacherQuery>(
      `/teacher/${teacherId}/queries/${queryId}/respond?response=${encodeURIComponent(response)}`,
      {
        method: "POST",
      },
    )
  }

  async submitQueryToAdmin(teacherId: string, query: SubmitQueryRequest) {
    return this.request<TeacherQuery>(`/teacher/${teacherId}/queries/admin`, {
      method: "POST",
      body: JSON.stringify(query),
    })
  }

  // Marks Management
  async getSubjectMarks(teacherId: string, subjectId: string) {
    return this.request<TeacherMark[]>(`/teacher/${teacherId}/subjects/${subjectId}/marks`)
  }

  async getStudentsForSubject(subjectId: string) {
    return this.request<StudentDto[]>(`/subjects/${subjectId}/students`)
  }

  async createMark(teacherId: string, mark: CreateMarkRequest) {
    return this.request<TeacherMark>(`/teacher/${teacherId}/marks`, {
      method: "POST",
      body: JSON.stringify(mark),
    })
  }

  async updateMark(teacherId: string, markId: string, mark: UpdateMarkRequest) {
    return this.request<TeacherMark>(`/teacher/${teacherId}/marks/${markId}`, {
      method: "PUT",
      body: JSON.stringify(mark),
    })
  }

  async deleteMark(teacherId: string, markId: string) {
    return this.request<void>(`/teacher/${teacherId}/marks/${markId}`, {
      method: "DELETE",
    })
  }

  async uploadMarks(teacherId: string, file: File, subjectId: string, semester: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subjectId", subjectId)
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
    id: string
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
  id: string
  studentId: string
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
  id: string
  studentId: string
  subjectId: string
  internal1: number
  internal2: number
  external: number
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
  id: string
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
  studentId: string
  subjectId: string
  internal1: number
  internal2: number
  external: number
  examType?: string
  academicYear?: string
}

export interface UpdateMarkRequest {
  internal1: number
  internal2: number
  external: number
  examType?: string
  academicYear?: string
}

export interface StudentDto {
  id: string
  rollNumber: string
  firstName: string
  lastName: string
  email: string
  course: string
  branch: string
  batchYear: number
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
