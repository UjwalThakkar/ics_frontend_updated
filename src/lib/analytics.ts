'use client'

// ==============================================
// GOOGLE ANALYTICS 4 INTEGRATION
// ==============================================

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

// Initialize Google Analytics
export const initGA = () => {
  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics ID not found')
    return
  }

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function() {
    window.dataLayer.push(arguments)
  }

  window.gtag('js', new Date())
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  })

  console.log('✅ Google Analytics initialized')
}

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.origin + url
  })
}

// Event tracking
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_TRACKING_ID || typeof window.gtag !== 'function') return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  })
}

// Custom event tracking for consular services
export const trackConsularEvent = (eventType: string, data: any) => {
  if (!GA_TRACKING_ID) return

  const eventData = {
    event_category: 'consular_services',
    custom_parameters: {
      service_type: data.serviceType,
      user_type: data.userType,
      timestamp: new Date().toISOString(),
      ...data
    }
  }

  window.gtag('event', eventType, eventData)
}

// Application tracking events
export const ApplicationEvents = {
  // Application lifecycle
  startApplication: (serviceType: string) => {
    trackConsularEvent('application_started', {
      serviceType,
      step: 'initiation'
    })
  },

  completeStep: (serviceType: string, step: string) => {
    trackConsularEvent('application_step_completed', {
      serviceType,
      step,
      funnel_step: step
    })
  },

  submitApplication: (serviceType: string, applicationId: string) => {
    trackConsularEvent('application_submitted', {
      serviceType,
      applicationId,
      conversion: true
    })
  },

  documentUpload: (serviceType: string, documentType: string) => {
    trackConsularEvent('document_uploaded', {
      serviceType,
      documentType
    })
  },

  appointmentBooked: (serviceType: string, appointmentDate: string) => {
    trackConsularEvent('appointment_booked', {
      serviceType,
      appointmentDate,
      conversion: true
    })
  },

  trackingChecked: (applicationId: string) => {
    trackConsularEvent('application_tracking_checked', {
      applicationId
    })
  },

  // Admin events
  adminLogin: (adminRole: string) => {
    trackConsularEvent('admin_login', {
      adminRole,
      admin_action: true
    })
  },

  adminAction: (action: string, resourceType: string) => {
    trackConsularEvent('admin_action', {
      action,
      resourceType,
      admin_action: true
    })
  }
}

// User engagement tracking
export const UserEngagement = {
  timeOnPage: (pageName: string, timeSpent: number) => {
    trackEvent('time_on_page', 'engagement', pageName, timeSpent)
  },

  downloadDocument: (documentName: string) => {
    trackEvent('download', 'documents', documentName)
  },

  searchUsed: (searchTerm: string) => {
    trackEvent('search', 'site_search', searchTerm)
  },

  languageChanged: (newLanguage: string) => {
    trackEvent('language_change', 'localization', newLanguage)
  },

  helpAccessed: (helpSection: string) => {
    trackEvent('help_accessed', 'support', helpSection)
  }
}

// Error tracking for analytics
export const ErrorTracking = {
  formError: (formName: string, errorType: string) => {
    trackEvent('form_error', 'errors', `${formName}_${errorType}`)
  },

  validationError: (fieldName: string, errorMessage: string) => {
    trackEvent('validation_error', 'errors', `${fieldName}: ${errorMessage}`)
  },

  apiError: (endpoint: string, statusCode: number) => {
    trackEvent('api_error', 'errors', `${endpoint}_${statusCode}`)
  }
}

// ==============================================
// CONVERSION TRACKING
// ==============================================

export const ConversionTracking = {
  // Define conversion goals
  applicationSubmission: (serviceType: string, value: number = 1) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'conversion', {
      send_to: `${GA_TRACKING_ID}/application_submission`,
      event_category: 'conversions',
      event_label: serviceType,
      value: value
    })
  },

  appointmentBooked: (serviceType: string, value: number = 1) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'conversion', {
      send_to: `${GA_TRACKING_ID}/appointment_booking`,
      event_category: 'conversions',
      event_label: serviceType,
      value: value
    })
  },

  userRegistration: (value: number = 1) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'conversion', {
      send_to: `${GA_TRACKING_ID}/user_registration`,
      event_category: 'conversions',
      value: value
    })
  }
}

// ==============================================
// ENHANCED ECOMMERCE TRACKING
// ==============================================

export const EcommerceTracking = {
  viewService: (serviceId: string, serviceName: string, category: string) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'view_item', {
      currency: 'ZAR',
      value: 0,
      items: [{
        item_id: serviceId,
        item_name: serviceName,
        item_category: category,
        quantity: 1
      }]
    })
  },

  beginApplication: (serviceId: string, serviceName: string, value: number) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'begin_checkout', {
      currency: 'ZAR',
      value: value,
      items: [{
        item_id: serviceId,
        item_name: serviceName,
        item_category: 'consular_services',
        quantity: 1,
        price: value
      }]
    })
  },

  completePurchase: (applicationId: string, serviceId: string, serviceName: string, value: number) => {
    if (typeof window.gtag !== 'function') return

    window.gtag('event', 'purchase', {
      transaction_id: applicationId,
      currency: 'ZAR',
      value: value,
      items: [{
        item_id: serviceId,
        item_name: serviceName,
        item_category: 'consular_services',
        quantity: 1,
        price: value
      }]
    })
  }
}

// ==============================================
// PERFORMANCE MONITORING
// ==============================================

export const PerformanceTracking = {
  // Core Web Vitals tracking
  trackWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcp = entries[entries.length - 1] as PerformanceEntry
        trackEvent('web_vitals', 'performance', 'LCP', Math.round(lcp.startTime))
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          trackEvent('web_vitals', 'performance', 'FID', Math.round(entry.processingStart - entry.startTime))
        })
      }).observe({ entryTypes: ['first-input'] })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        trackEvent('web_vitals', 'performance', 'CLS', Math.round(clsValue * 1000))
      }).observe({ entryTypes: ['layout-shift'] })
    }
  },

  // Page load time tracking
  trackPageLoad: (pageName: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = Math.round(navigation.loadEventEnd - navigation.fetchStart)
      trackEvent('page_load_time', 'performance', pageName, loadTime)
    }
  }
}

// Hook for React components
export const useAnalytics = () => {
  return {
    trackPageView,
    trackEvent,
    trackConsularEvent,
    ApplicationEvents,
    UserEngagement,
    ErrorTracking,
    ConversionTracking,
    EcommerceTracking,
    PerformanceTracking
  }
}

export default {
  initGA,
  trackPageView,
  trackEvent,
  ApplicationEvents,
  UserEngagement,
  ErrorTracking,
  ConversionTracking,
  EcommerceTracking,
  PerformanceTracking,
  useAnalytics
}
