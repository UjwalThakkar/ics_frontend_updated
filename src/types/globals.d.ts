// Global Analytics Functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    trackConsularEvent: (eventType: string, data: any) => void
    trackApplicationFunnel: (step: string, serviceType: string) => void
    trackAdminAction: (action: string, resource: string) => void
    hj: (...args: any[]) => void
    _hjSettings: {
      hjid: number
      hjsv: number
    }
  }
}

// Analytics Event Types
export interface ConsularEventData {
  serviceType?: string
  userType?: string
  applicationId?: string
  step?: string
  userId?: string
  timestamp?: string
  [key: string]: any
}

export interface AdminActionData {
  action: string
  resource: string
  adminId?: string
  timestamp?: string
  details?: any
}

export interface ApplicationFunnelStep {
  step: 'service_viewed' | 'application_started' | 'documents_uploaded' | 'appointment_booked' | 'application_submitted' | 'payment_completed'
  serviceType: string
  userId?: string
  sessionId?: string
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  id: string
  delta: number
  entries: PerformanceEntry[]
}

export {}
