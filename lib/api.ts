const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
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

  // Dashboard API
  async getDashboardStats() {
    return this.request<DashboardStats>("/dashboard/stats")
  }

  // Students API
  async getStudents(params: StudentFilters = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append("search", params.search)
    if (params.semester) searchParams.append("semester", params.semester)
    if (params.department) searchParams.append("department", params.department)
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())

    return this.request<PagedResponse<Student>>(`/students?${searchParams}`)
  }

  async getStudent(id: number) {
    return this.request<Student>(`/students/${id}`)
  }

  async createStudent(student: CreateStudentRequest) {
    return this.request<Student>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    })
  }

  async updateStudent(id: number, student: UpdateStudentRequest) {
    return this.request<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student),
    })
  }

  async deleteStudent(id: number) {
    return this.request<void>(`/students/${id}`, {
      method: "DELETE",
    })
  }

  // Marks API
  async getMarks(params: MarkFilters = {}) {
    const searchParams = new URLSearchParams()
    if (params.studentSearch) searchParams.append("studentSearch", params.studentSearch)
    if (params.subjectCode) searchParams.append("subjectCode", params.subjectCode)
    if (params.semester) searchParams.append("semester", params.semester)
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())

    return this.request<PagedResponse<Mark>>(`/marks?${searchParams}`)
  }

  async createMark(mark: CreateMarkRequest) {
    return this.request<Mark>("/marks", {
      method: "POST",
      body: JSON.stringify(mark),
    })
  }

  async updateMark(id: number, mark: UpdateMarkRequest) {
    return this.request<Mark>(`/marks/${id}`, {
      method: "PUT",
      body: JSON.stringify(mark),
    })
  }

  async deleteMark(id: number) {
    return this.request<void>(`/marks/${id}`, {
      method: "DELETE",
    })
  }

  async uploadMarks(file: File, subjectId: number, semester: string, uploadedBy: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subjectId", subjectId.toString())
    formData.append("semester", semester)
    formData.append("uploadedBy", uploadedBy)

    return this.request<Mark[]>("/marks/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  async downloadMarksTemplate() {
    const response = await fetch(`${API_BASE_URL}/marks/template`)
    if (!response.ok) throw new Error("Failed to download template")
    return response.blob()
  }

  // Queries API
  async getQueries(params: QueryFilters = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append("search", params.search)
    if (params.status) searchParams.append("status", params.status)
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())

    return this.request<PagedResponse<Query>>(`/queries?${searchParams}`)
  }

  async getQuery(id: number) {
    return this.request<Query>(`/queries/${id}`)
  }

  async updateQueryStatus(id: number, status: string) {
    return this.request<Query>(`/queries/${id}/status?status=${status}`, {
      method: "PUT",
    })
  }

  async respondToQuery(id: number, response: string, respondedBy: string) {
    const params = new URLSearchParams()
    params.append("response", response)
    params.append("respondedBy", respondedBy)

    return this.request<Query>(`/queries/${id}/respond?${params}`, {
      method: "POST",
    })
  }

  // Bonafide Requests API
  async getBonafideRequests(params: BonafideFilters = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append("search", params.search)
    if (params.status) searchParams.append("status", params.status)
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())

    return this.request<PagedResponse<BonafideRequest>>(`/bonafide-requests?${searchParams}`)
  }

  async getBonafideRequest(id: number) {
    return this.request<BonafideRequest>(`/bonafide-requests/${id}`)
  }

  async approveBonafideRequest(id: number, approvedBy: string) {
    return this.request<BonafideRequest>(`/bonafide-requests/${id}/approve?approvedBy=${approvedBy}`, {
      method: "POST",
    })
  }

  async rejectBonafideRequest(id: number, rejectionReason: string, rejectedBy: string) {
    const params = new URLSearchParams()
    params.append("rejectionReason", rejectionReason)
    params.append("rejectedBy", rejectedBy)

    return this.request<BonafideRequest>(`/bonafide-requests/${id}/reject?${params}`, {
      method: "POST",
    })
  }

  // Subjects API
  async getSubjects() {
    return this.request<Subject[]>("/subjects")
  }

  async getSubjectsBySemester(semester: string) {
    return this.request<Subject[]>(`/subjects/semester/${semester}`)
  }
}

// Types
export interface DashboardStats {
  totalStudents: number
  pendingQueries: number
  bonafideRequests: number
  resultsPublished: number
  activeStudents: number
  resolvedQueries: number
  approvedBonafides: number
  rejectedBonafides: number
}

export interface Student {
  id: number
  rollNo: string
  name: string
  email: string
  semester: string
  department?: string
  phoneNumber?: string
  address?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStudentRequest {
  rollNo: string
  name: string
  email: string
  semester: string
  department?: string
  phoneNumber?: string
  address?: string
  active?: boolean
}

export interface UpdateStudentRequest extends CreateStudentRequest {}

export interface Mark {
  id: number
  studentId: number
  subjectId: number
  marks: number
  grade: string
  examType: string
  academicYear?: string
  uploadedBy?: string
  studentName: string
  studentRollNo: string
  subjectName: string
  subjectCode: string
  createdAt: string
  updatedAt: string
}

export interface CreateMarkRequest {
  studentId: number
  subjectId: number
  marks: number
  examType?: string
  academicYear?: string
  uploadedBy?: string
}

export interface UpdateMarkRequest {
  marks: number
  examType?: string
  academicYear?: string
  uploadedBy?: string
}

export interface Query {
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
  attachments: string[]
  studentName: string
  studentRollNo: string
  studentEmail: string
  createdAt: string
  updatedAt: string
}

export interface BonafideRequest {
  id: number
  studentId: number
  purpose: string
  customPurpose?: string
  additionalInfo?: string
  status: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  certificateNumber?: string
  certificatePath?: string
  studentName: string
  studentRollNo: string
  studentEmail: string
  studentSemester: string
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: number
  code: string
  name: string
  semester?: string
  department?: string
  credits?: number
  active: boolean
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

export interface StudentFilters {
  search?: string
  semester?: string
  department?: string
  page?: number
  size?: number
}

export interface MarkFilters {
  studentSearch?: string
  subjectCode?: string
  semester?: string
  page?: number
  size?: number
}

export interface QueryFilters {
  search?: string
  status?: string
  page?: number
  size?: number
}

export interface BonafideFilters {
  search?: string
  status?: string
  page?: number
  size?: number
}

export const apiClient = new ApiClient()
