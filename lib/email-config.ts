// Email configuration and utilities
export const emailConfig = {
  // SMTP Settings
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // Email addresses
  addresses: {
    admin: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    noreply: `"College Examination Cell" <${process.env.SMTP_USER}>`,
  },

  // Email templates configuration
  templates: {
    contact: {
      subject: "New Contact Form Submission",
      priority: {
        high: ["complaint", "technical", "examination"],
        medium: ["results", "bonafide", "admission"],
        low: ["general", "other"],
      },
      responseTime: {
        high: "24 hours",
        medium: "2-3 business days",
        low: "3-5 business days",
      },
    },
  },
}

// Email validation utility
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Priority level utility
export function getPriorityLevel(subject: string): "high" | "medium" | "low" {
  const { priority } = emailConfig.templates.contact

  if (priority.high.includes(subject)) return "high"
  if (priority.medium.includes(subject)) return "medium"
  return "low"
}

// Response time utility
export function getResponseTime(subject: string): string {
  const priority = getPriorityLevel(subject)
  return emailConfig.templates.contact.responseTime[priority]
}

// Generate reference ID
export function generateReferenceId(): string {
  return `EC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}
