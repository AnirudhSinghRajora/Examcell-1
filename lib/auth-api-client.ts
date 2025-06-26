// File: src/lib/api/auth-api-client.ts

// The base URL of your Spring Boot backend API.
// It's a good practice to use an environment variable for this.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * A client for handling API requests to the authentication endpoints.
 */
class AuthApiClient {
  /**
   * A generic method to handle fetch requests, including error handling.
   * @param endpoint The API endpoint to call (e.g., "/auth/login").
   * @param options The standard fetch options (method, headers, body, etc.).
   * @returns A promise that resolves with the JSON response.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // If the response is not OK (e.g., 400, 401, 404, 500),
      // try to parse the error message from the backend and throw an error.
      if (!response.ok) {
        // Attempt to parse the JSON error body from Spring Boot.
        const errorData = await response.json().catch(() => ({})); 
        // Throw an error with the specific message from the backend, or a generic one.
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // If the response is OK, parse and return the JSON body.
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      // Re-throw the error so the calling component (e.g., LoginPage) can catch it.
      throw error;
    }
  }

  /**
   * Calls the backend to register a new user.
   * @param signupData The user's signup information.
   */
  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(signupData),
    });
  }

  /**
   * Calls the backend to log in a user.
   * @param loginData The user's login credentials.
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
    });
  }
}

// --- TypeScript Interfaces ---
// These define the shape of the data being sent to and received from the API.
// They should match your Spring Boot DTOs.

/**
 * Data structure for the signup request body.
 * Matches SignupRequest.java DTO.
 */
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  // Optional Student fields
  rollNo?: string;
  semester?: string;
  department?: string;
  phoneNumber?: string;
  address?: string;
  // Optional Teacher fields
  employeeId?: string;
  designation?: string;
  specialization?: string;
}

/**
 * Data structure for the login request body.
 * Matches AuthRequest.java DTO.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Data structure for the response from both signup and login endpoints.
 * Matches AuthResponse.java DTO.
 */
export interface AuthResponse {
  token: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  id: string; // UUID from backend
  firstName: string;
  lastName: string;
  email: string;
}

// Create and export a single, reusable instance of the client.
export const authApiClient = new AuthApiClient();