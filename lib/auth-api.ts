const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

class AuthApiClient {
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

  async signup(signupData: SignupRequest) {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(signupData),
    })
  }

  async login(loginData: LoginRequest) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    })
  }
}

// Types
export interface SignupRequest {
  username: string
  email: string
  password: string
  fullName: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  // Student fields
  rollNo?: string
  semester?: string
  department?: string
  phoneNumber?: string
  address?: string
  // Teacher fields
  employeeId?: string
  designation?: string
  specialization?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  id: string // UUID from backend
  email: string
  role: "STUDENT" | "PROFESSOR" | "ADMIN"
  firstName: string
  lastName: string
}

export const authApiClient = new AuthApiClient()
