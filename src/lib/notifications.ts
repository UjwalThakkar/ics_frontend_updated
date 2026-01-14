import nodemailer from 'nodemailer'
import twilio from 'twilio'
import connectDB, { Notification } from '@/lib/database'

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// WhatsApp Business API configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

interface NotificationRequest {
  applicationId: string
  recipient: string
  method: 'email' | 'sms' | 'whatsapp'
  subject?: string
  message: string
  templateData?: Record<string, any>
}

// Email templates
const emailTemplates = {
  applicationSubmitted: {
    subject: 'Application Submitted - {{applicationId}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center;">
          <h1>Consulate General of India</h1>
          <p>Johannesburg, South Africa</p>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #1e3a8a;">Application Confirmation</h2>
          <p>Dear {{applicantName}},</p>
          <p>Your application has been successfully submitted with the following details:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Application ID:</strong> {{applicationId}}</p>
            <p><strong>Service:</strong> {{serviceType}}</p>
            <p><strong>Status:</strong> {{status}}</p>
            <p><strong>Expected Completion:</strong> {{expectedCompletion}}</p>
          </div>
          <p>You can track your application status at: <a href="{{trackingUrl}}">{{trackingUrl}}</a></p>
          <p>For any queries, contact us at: consular.johannesburg@mea.gov.in</p>
        </div>
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2025 Indian Consular Services, Johannesburg. All rights reserved.</p>
        </div>
      </div>
    `
  },
  statusUpdate: {
    subject: 'Application Status Update - {{applicationId}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 20px; text-align: center;">
          <h1>Status Update</h1>
        </div>
        <div style="padding: 20px; background: #f9fafb;">
          <h2 style="color: #1e3a8a;">Application Status Updated</h2>
          <p>Dear {{applicantName}},</p>
          <p>Your application status has been updated:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Application ID:</strong> {{applicationId}}</p>
            <p><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">{{status}}</span></p>
            <p><strong>Updated On:</strong> {{updateDate}}</p>
            {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
          </div>
          {{#if nextSteps}}<p><strong>Next Steps:</strong> {{nextSteps}}</p>{{/if}}
        </div>
      </div>
    `
  }
}

// SMS templates
const smsTemplates = {
  applicationSubmitted: 'Your application {{applicationId}} for {{serviceType}} has been submitted. Track at: {{trackingUrl}}',
  statusUpdate: 'Update: Your application {{applicationId}} status is now {{status}}. {{#if notes}}Note: {{notes}}{{/if}}'
}

// WhatsApp templates
const whatsappTemplates = {
  applicationSubmitted: {
    template: 'application_submitted',
    parameters: ['{{applicantName}}', '{{applicationId}}', '{{serviceType}}', '{{expectedCompletion}}']
  },
  statusUpdate: {
    template: 'status_update',
    parameters: ['{{applicantName}}', '{{applicationId}}', '{{status}}', '{{updateDate}}']
  }
}

function replaceTemplateVariables(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match
  })
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await emailTransporter.sendMail({
      from: `"Indian Consular Services" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    })
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith('+') ? to : `+27${to.replace(/^0/, '')}`
    })
    return true
  } catch (error) {
    console.error('SMS sending failed:', error)
    return false
  }
}

async function sendWhatsApp(to: string, template: string, parameters: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.startsWith('+') ? to : `+27${to.replace(/^0/, '')}`,
        type: 'template',
        template: {
          name: template,
          language: { code: 'en' },
          components: [{
            type: 'body',
            parameters: parameters.map(p => ({ type: 'text', text: p }))
          }]
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('WhatsApp sending failed:', error)
    return false
  }
}

export async function sendNotification(request: NotificationRequest): Promise<boolean> {
  try {
    await connectDB()

    // Create notification record
    const notification = await Notification.create({
      applicationId: request.applicationId,
      recipient: request.recipient,
      method: request.method,
      subject: request.subject,
      message: request.message,
      status: 'pending'
    })

    let success = false

    switch (request.method) {
      case 'email':
        const emailTemplate = emailTemplates.applicationSubmitted
        const emailSubject = replaceTemplateVariables(request.subject || emailTemplate.subject, request.templateData || {})
        const emailHtml = replaceTemplateVariables(emailTemplate.html, request.templateData || {})
        success = await sendEmail(request.recipient, emailSubject, emailHtml)
        break

      case 'sms':
        const smsMessage = replaceTemplateVariables(smsTemplates.applicationSubmitted, request.templateData || {})
        success = await sendSMS(request.recipient, smsMessage)
        break

      case 'whatsapp':
        const whatsappTemplate = whatsappTemplates.applicationSubmitted
        const parameters = whatsappTemplate.parameters.map(p =>
          replaceTemplateVariables(p, request.templateData || {})
        )
        success = await sendWhatsApp(request.recipient, whatsappTemplate.template, parameters)
        break
    }

    // Update notification status
    notification.status = success ? 'sent' : 'failed'
    notification.sentAt = success ? new Date() : undefined
    await notification.save()

    return success

  } catch (error) {
    console.error('Notification sending failed:', error)
    return false
  }
}

// Auto-trigger notifications based on status changes
export async function sendStatusUpdateNotification(
  applicationId: string,
  newStatus: string,
  applicantInfo: any,
  notes?: string
): Promise<void> {
  const statusMessages = {
    'in-progress': 'Your application is now being processed by our consular officers.',
    'ready-for-collection': 'Your documents are ready for collection. Please visit our office during collection hours.',
    'completed': 'Your application has been completed successfully.',
    'rejected': 'Your application requires additional documentation or has been rejected.'
  }

  const nextSteps = {
    'in-progress': 'No action required. We will update you on progress.',
    'ready-for-collection': 'Please bring your receipt and ID for collection. Office hours: Mon-Fri 3:00-4:30 PM',
    'completed': 'Thank you for using our services.',
    'rejected': 'Please check your email for details on required documentation.'
  }

  const templateData = {
    applicantName: `${applicantInfo.firstName} ${applicantInfo.lastName}`,
    applicationId,
    status: newStatus.replace('-', ' ').toUpperCase(),
    updateDate: new Date().toLocaleDateString(),
    notes,
    nextSteps: nextSteps[newStatus as keyof typeof nextSteps],
    trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/track?id=${applicationId}`
  }

  await sendNotification({
    applicationId,
    recipient: applicantInfo.email,
    method: applicantInfo.preferredNotification || 'email',
    subject: `Application Status Update - ${applicationId}`,
    message: statusMessages[newStatus as keyof typeof statusMessages] || 'Your application status has been updated.',
    templateData
  })
}

// Additional email notification functions for admin panel
export async function sendEmailNotification(to: string, subject: string, content: string): Promise<boolean> {
  return await sendEmail(to, subject, content)
}

export async function sendSMSNotification(phone: string, message: string): Promise<boolean> {
  return await sendSMS(phone, message)
}

export async function sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
  // For simple text messages, we can use the API directly
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.startsWith('+') ? phone : `+27${phone.replace(/^0/, '')}`,
        type: 'text',
        text: { body: message }
      })
    })

    return response.ok
  } catch (error) {
    console.error('WhatsApp text message failed:', error)
    return false
  }
}
