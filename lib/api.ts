const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

    console.log("Frontend: Token from localStorage in apiClient.request:", token ? "[TOKEN_PRESENT]" : "[TOKEN_NULL_OR_UNDEFINED]");

    console.log("API Request URL:", url)
    console.log("API Base URL:", API_BASE_URL)
    console.log("Endpoint:", endpoint)

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

  async getCourses() {
    return this.request<{ name: string; totalSemesters: number }[]>("/courses");
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request<DashboardStats>("/dashboard/statistics")
  }

  // Students API
  async getStudents(params: StudentFilters = {}) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.append("search", params.search)
    if (params.semester) searchParams.append("semester", params.semester)
    if (params.course) searchParams.append("course", params.course)
    if (params.branch) searchParams.append("branch", params.branch)
    if (params.page !== undefined) searchParams.append("page", params.page.toString())
    if (params.size !== undefined) searchParams.append("size", params.size.toString())

    return this.request<PagedResponse<Student>>(`/students?${searchParams}`)
  }

  async getStudent(id: string) {
    return this.request<Student>(`/students/${id}`)
  }

  async createStudent(student: CreateStudentRequest) {
    return this.request<Student>("/students", {
      method: "POST",
      body: JSON.stringify(student),
    })
  }

  async updateStudent(id: string, student: UpdateStudentRequest) {
    return this.request<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(student),
    })
  }

  async deleteStudent(id: string) {
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

  async updateMark(id: string, mark: UpdateMarkRequest) {
    return this.request<Mark>(`/marks/${id}`, {
      method: "PUT",
      body: JSON.stringify(mark),
    })
  }

  async deleteMark(id: string) {
    return this.request<void>(`/marks/${id}`, {
      method: "DELETE",
    })
  }

  async uploadMarks(file: File, subjectId: string, semester: string, uploadedBy: string) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subjectId", subjectId)
    formData.append("semester", semester)
    formData.append("uploadedBy", uploadedBy)

    return this.request<Mark[]>("/marks/upload-excel", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    })
  }

  async downloadMarksTemplate() {
    const response = await fetch(`${API_BASE_URL}/marks/download-template`)
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

  async getQuery(id: string) {
    return this.request<Query>(`/queries/${id}`)
  }

  async updateQueryStatus(id: string, status: string) {
    return this.request<Query>(`/queries/${id}/status?status=${status}`, {
      method: "PATCH",
    })
  }

  async respondToQuery(id: string, response: string, respondedBy: string) {
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

    return this.request<PagedResponse<BonafideRequest>>(`/admin/bonafide-requests?${searchParams}`)
  }

  async getBonafideRequest(id: string) {
    return this.request<BonafideRequest>(`/admin/bonafide-requests/${id}`)
  }

  async approveBonafideRequest(id: string, adminId: string) {
    return this.request<BonafideRequest>(`/admin/bonafide-requests/${id}/approve?adminId=${adminId}`, {
      method: "POST",
    })
  }

  async rejectBonafideRequest(id: string, rejectionReason: string, adminId: string) {
    const params = new URLSearchParams()
    params.append("adminId", adminId)
    if (rejectionReason) params.append("remarks", rejectionReason)

    return this.request<BonafideRequest>(`/admin/bonafide-requests/${id}/reject?${params}`, {
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

  async createSubject(subject: CreateSubjectRequest) {
    return this.request<Subject>("/subjects", {
      method: "POST",
      body: JSON.stringify(subject),
    })
  }

  async updateSubject(id: string, subject: UpdateSubjectRequest) {
    return this.request<Subject>(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(subject),
    })
  }

  async deleteSubject(id: string) {
    return this.request<void>(`/subjects/${id}`, {
      method: "DELETE",
    })
  }

  async getBranches(course?: string): Promise<Branch[]> {
    const url = course ? `/branches?course=${course}` : "/branches";
    return this.request<Branch[]>(url);
  }
}

export interface CourseInfo {
  name: string;
  totalSemesters: number;
}
// Types
export interface DashboardStats {
  totalStudents: number
  totalProfessors: number
  totalSubjects: number
  totalQueriesOpen: number
  totalBonafideRequestsPending: number
  totalMarksRecords: number
  // Legacy fields for backward compatibility
  pendingQueries?: number
  bonafideRequests?: number
  resultsPublished?: number
  activeStudents?: number
  resolvedQueries?: number
  approvedBonafides?: number
  rejectedBonafides?: number
}

export interface Student {
  id: string
  firstName: string;
  lastName: string;
  rollNumber: string;
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
  firstName: string;
  lastName: string;
  rollNumber: string;
  email: string
  semester: string
  department?: string
  phoneNumber?: string
  address?: string
  active?: boolean
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  rollNumber?: string;
  email?: string
  semester?: string
  department?: string
  phoneNumber?: string
  address?: string
  active?: boolean
}

export interface Mark {
  id: string
  studentId: string
  subjectId: string
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
  studentId: string
  subjectId: string
  internal1: number
  internal2: number
  external: number
  examType?: string
  academicYear?: string
  uploadedBy?: string
}

export interface UpdateMarkRequest {
  internal1?: number
  internal2?: number
  external?: number
  examType?: string
  academicYear?: string
  uploadedBy?: string
}

export interface Query {
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
  attachments: string[]
  studentName: string
  studentRollNo: string
  studentEmail: string
  createdAt: string
  updatedAt: string
}

export interface BonafideRequest {
  id: string
  studentId: string
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
  id: string
  code: string
  name: string
  semester?: string
  department?: string
  credits?: number
  active: boolean
}

export interface CreateSubjectRequest {
  code: string
  name: string
  semester?: string
  department?: string
  credits?: number
  active?: boolean
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {}

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
  course?: string;
  branch?: string;
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

export type Branch = string;

export const apiClient = new ApiClient()
