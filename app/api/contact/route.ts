import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Email templates
const createEmailTemplate = (formData: any) => {
  return {
    subject: `New Contact Form Submission: ${formData.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contact Form Submission</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
            .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #475569; }
            .value { margin-top: 5px; padding: 8px; background: white; border-radius: 4px; border: 1px solid #e2e8f0; }
            .message-box { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; }
            .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .priority-high { background: #fee2e2; color: #dc2626; }
            .priority-medium { background: #fef3c7; color: #d97706; }
            .priority-low { background: #dcfce7; color: #16a34a; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">College Examination Cell</h1>
              <p style="margin: 5px 0 0 0;">New Contact Form Submission</p>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">Submission Time:</div>
                <div class="value">${new Date().toLocaleString()}</div>
              </div>
              
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${formData.name}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${formData.email}</div>
              </div>
              
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${formData.phone || "Not provided"}</div>
              </div>
              
              <div class="field">
                <div class="label">User Type:</div>
                <div class="value">${formData.userType}</div>
              </div>
              
              <div class="field">
                <div class="label">Subject Category:</div>
                <div class="value">${formData.subject}</div>
              </div>
              
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${formData.message.replace(/\n/g, "<br>")}</div>
              </div>
              
              <div class="field">
                <div class="label">Priority Level:</div>
                <div class="value">
                  <span class="priority ${getPriorityClass(formData.subject)}">${getPriorityLevel(formData.subject)}</span>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">This email was sent from the College Examination Cell contact form.</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Please respond within 24-48 hours.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

const createAutoReplyTemplate = (formData: any) => {
  return {
    subject: "Thank you for contacting College Examination Cell",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Thank You - College Examination Cell</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
            .footer { background: #1e293b; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
            .info-box { background: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin: 15px 0; }
            .contact-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .next-steps { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">College Examination Cell</h1>
              <p style="margin: 10px 0 0 0;">Thank you for reaching out!</p>
            </div>
            
            <div class="content">
              <p>Dear ${formData.name},</p>
              
              <p>Thank you for contacting the College Examination Cell. We have received your inquiry regarding <strong>"${formData.subject}"</strong> and will respond as soon as possible.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Your Submission Details:</h3>
                <p><strong>Reference ID:</strong> EC-${Date.now()}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Category:</strong> ${formData.subject}</p>
                <p><strong>Expected Response Time:</strong> ${getResponseTime(formData.subject)}</p>
              </div>
              
              <div class="next-steps">
                <h3 style="margin-top: 0;">What happens next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Your inquiry has been forwarded to the appropriate department</li>
                  <li>You will receive a response within ${getResponseTime(formData.subject)}</li>
                  <li>For urgent matters, you can call us at +91 12345 67890</li>
                  <li>You can track your inquiry status using the reference ID above</li>
                </ul>
              </div>
              
              <div class="contact-info">
                <h3 style="margin-top: 0;">Contact Information:</h3>
                <p><strong>Email:</strong> examcell@college.edu</p>
                <p><strong>Phone:</strong> +91 12345 67890</p>
                <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM</p>
                <p><strong>Address:</strong> Main Building, 2nd Floor, College Campus</p>
              </div>
              
              <p>If you have any additional questions or need immediate assistance, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>
              College Examination Cell Team</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">College Examination Cell</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated response. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

// Helper functions
function getPriorityLevel(subject: string): string {
  const highPriority = ["complaint", "technical", "examination"]
  const mediumPriority = ["results", "bonafide", "admission"]

  if (highPriority.includes(subject)) return "HIGH"
  if (mediumPriority.includes(subject)) return "MEDIUM"
  return "LOW"
}

function getPriorityClass(subject: string): string {
  const priority = getPriorityLevel(subject)
  return `priority-${priority.toLowerCase()}`
}

function getResponseTime(subject: string): string {
  const priority = getPriorityLevel(subject)
  switch (priority) {
    case "HIGH":
      return "24 hours"
    case "MEDIUM":
      return "2-3 business days"
    default:
      return "3-5 business days"
  }
}

// Validation function
function validateFormData(data: any) {
  const required = ["name", "email", "userType", "subject", "message"]
  const missing = required.filter((field) => !data[field] || data[field].trim() === "")

  if (missing.length > 0) {
    return { isValid: false, error: `Missing required fields: ${missing.join(", ")}` }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { isValid: false, error: "Invalid email address" }
  }

  // Message length validation
  if (data.message.length < 10) {
    return { isValid: false, error: "Message must be at least 10 characters long" }
  }

  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate form data
    const validation = validateFormData(formData)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP credentials not configured")
      return NextResponse.json(
        { error: "Email service is not configured. Please contact the administrator." },
        { status: 500 },
      )
    }

    const transporter = createTransporter()

    // Verify SMTP connection
    await transporter.verify()

    // Prepare emails
    const adminEmail = createEmailTemplate(formData)
    const autoReply = createAutoReplyTemplate(formData)

    // Send email to admin/examination cell
    await transporter.sendMail({
      from: `"College Examination Cell" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: adminEmail.subject,
      html: adminEmail.html,
      replyTo: formData.email,
    })

    // Send auto-reply to user
    await transporter.sendMail({
      from: `"College Examination Cell" <${process.env.SMTP_USER}>`,
      to: formData.email,
      subject: autoReply.subject,
      html: autoReply.html,
    })

    // Log the submission (in production, you might want to save to database)
    console.log("Contact form submission:", {
      timestamp: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      userType: formData.userType,
    })

    return NextResponse.json(
      {
        message: "Message sent successfully",
        referenceId: `EC-${Date.now()}`,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)

    // Return appropriate error message
    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        return NextResponse.json(
          { error: "Email service authentication failed. Please contact the administrator." },
          { status: 500 },
        )
      }
      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Email service is currently unavailable. Please try again later." },
          { status: 503 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 })
  }
}
