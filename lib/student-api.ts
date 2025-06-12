// File: src/lib/api/student-api-client.ts (or wherever it's located)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

class StudentApiClient {
  /**
   * --- MODIFICATION START ---
   * The private request method is updated to automatically add the
   * JWT token to the Authorization header for every API call.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // 1. Get the authentication token from localStorage.
    const token = localStorage.getItem("authToken");

    // 2. Prepare the default headers.
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // 3. If a token exists, add the "Authorization: Bearer <token>" header.
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    // 4. Merge the default headers with any custom headers from the options.
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    // --- MODIFICATION END ---


    try {
      const response = await fetch(url, config); // Use the new config with headers

      // Handle 401 Unauthorized specifically - might mean the token expired.
      if (response.status === 401) {
        // Optional: You can add logic here to automatically log the user out.
        // For now, we'll let the generic error handler deal with it.
        console.error("Unauthorized request (401). Token might be expired or invalid.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Handle responses that might not have a JSON body (e.g., a 204 No Content response)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        // Return a resolved promise for non-JSON responses to avoid parsing errors.
        return Promise.resolve() as Promise<T>;
      }

    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // --- NO CHANGES NEEDED BELOW THIS LINE ---
  // All the methods below will now automatically use the modified `request` method
  // and send the Authorization header with every call.

  // Student Dashboard
  async getStudentDashboard(studentId: number) {
    return this.request<StudentDashboard>(`/student/dashboard/${studentId}`);
  }

  // Student Results
  async getStudentResults(studentId: number) {
    return this.request<StudentResult[]>(`/student/${studentId}/results`);
  }

  // Student Queries
  async getStudentQueries(studentId: number, page = 0, size = 10) {
    return this.request<PagedResponse<StudentQuery>>(`/student/${studentId}/queries?page=${page}&size=${size}`);
  }

  async submitQuery(studentId: number, query: SubmitQueryRequest) {
    return this.request<StudentQuery>(`/student/${studentId}/queries`, {
      method: "POST",
      body: JSON.stringify(query),
    });
  }

  // Bonafide Requests
  async getBonafideRequests(studentId: number, page = 0, size = 10) {
    return this.request<PagedResponse<BonafideRequest>>(
      `/student/${studentId}/bonafide-requests?page=${page}&size=${size}`,
    );
  }

  async submitBonafideRequest(studentId: number, request: SubmitBonafideRequest) {
    return this.request<BonafideRequest>(`/student/${studentId}/bonafide-requests`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Subjects
  async getSubjects() {
    return this.request<StudentSubject[]>("/student/subjects");
  }
}

// --- Types (No Changes Needed) ---
export interface StudentDashboard {
  student: {
    id: number;
    rollNo: string;
    name: string;
    email: string;
    semester: string;
    department: string;
  };
  cgpa: number;
  completedSemesters: number;
  totalSemesters: number;
  pendingQueries: number;
  availableCertificates: number;
  recentResults: StudentResult[];
  recentQueries: StudentQuery[];
}

export interface StudentResult {
  id: number;
  subjectName: string;
  subjectCode: string;
  marks: number;
  grade: string;
  examType: string;
  academicYear: string;
  createdAt: string;
}

export interface StudentQuery {
  id: number;
  subject: string;
  faculty: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitQueryRequest {
  subject: string;
  faculty: string;
  title: string;
  description: string;
  priority?: string;
}

export interface BonafideRequest {
  id: number;
  purpose: string;
  customPurpose?: string;
  additionalInfo?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  certificateNumber?: string;
  certificatePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitBonafideRequest {
  purpose: string;
  customPurpose?: string;
  additionalInfo?: string;
}

export interface StudentSubject {
  id: number;
  code: string;
  name: string;
  semester: string;
  department: string;
  credits: number;
  faculty: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const studentApiClient = new StudentApiClient();