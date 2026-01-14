// ==============================================
// SENTRY ERROR MONITORING & PERFORMANCE
// ==============================================

import * as Sentry from '@sentry/nextjs'

// Sentry configuration
export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

  if (!dsn) {
    console.warn('Sentry DSN not configured - error monitoring disabled')
    return
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session tracking
    autoSessionTracking: true,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

    // Error filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors in production
      if (process.env.NODE_ENV === 'production') {
        // Skip network errors that are likely temporary
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null
        }

        // Skip canceled requests
        if (event.exception?.values?.[0]?.value?.includes('canceled')) {
          return null
        }
      }

      return event
    },

    // Performance monitoring filters
    beforeSendTransaction(event) {
      // Filter out very fast transactions to reduce noise
      if (event.start_timestamp && event.timestamp) {
        const duration = event.timestamp - event.start_timestamp
        if (duration < 0.1) { // Less than 100ms
          return null
        }
      }

      return event
    },

    // Integration configurations
    integrations: [],

    // Additional configuration
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    sendDefaultPii: false, // Don't send personally identifiable information

    // Tags for better organization
    initialScope: {
      tags: {
        component: 'indian-consular-services',
        version: process.env.npm_package_version || '1.0.0'
      }
    }
  })

  console.log('✅ Sentry error monitoring initialized')
}

// ==============================================
// CUSTOM ERROR TRACKING
// ==============================================

export class ConsularErrorTracker {
  // Application-specific error tracking
  static trackApplicationError(error: Error, context: {
    applicationId?: string
    userId?: string
    serviceType?: string
    step?: string
    additionalData?: any
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'application_error')
      scope.setTag('service_type', context.serviceType || 'unknown')
      scope.setLevel('error')

      scope.setContext('application_context', {
        applicationId: context.applicationId,
        userId: context.userId,
        step: context.step,
        ...context.additionalData
      })

      Sentry.captureException(error)
    })
  }

  // Admin panel error tracking
  static trackAdminError(error: Error, context: {
    adminId?: string
    action?: string
    resource?: string
    additionalData?: any
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'admin_error')
      scope.setTag('admin_action', context.action || 'unknown')
      scope.setLevel('error')

      scope.setContext('admin_context', {
        adminId: context.adminId,
        action: context.action,
        resource: context.resource,
        ...context.additionalData
      })

      Sentry.captureException(error)
    })
  }

  // API error tracking
  static trackAPIError(error: Error, context: {
    endpoint: string
    method: string
    statusCode?: number
    requestId?: string
    userId?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'api_error')
      scope.setTag('endpoint', context.endpoint)
      scope.setTag('method', context.method)
      scope.setLevel('error')

      scope.setContext('api_context', {
        endpoint: context.endpoint,
        method: context.method,
        statusCode: context.statusCode,
        requestId: context.requestId,
        userId: context.userId
      })

      Sentry.captureException(error)
    })
  }

  // Database error tracking
  static trackDatabaseError(error: Error, context: {
    operation: string
    collection?: string
    query?: any
    userId?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'database_error')
      scope.setTag('db_operation', context.operation)
      scope.setLevel('error')

      scope.setContext('database_context', {
        operation: context.operation,
        collection: context.collection,
        query: JSON.stringify(context.query),
        userId: context.userId
      })

      Sentry.captureException(error)
    })
  }

  // Authentication error tracking
  static trackAuthError(error: Error, context: {
    authType: string
    userId?: string
    ipAddress?: string
    userAgent?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'auth_error')
      scope.setTag('auth_type', context.authType)
      scope.setLevel('warning')

      scope.setContext('auth_context', {
        authType: context.authType,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      })

      Sentry.captureException(error)
    })
  }

  // File upload error tracking
  static trackUploadError(error: Error, context: {
    fileName?: string
    fileSize?: number
    fileType?: string
    userId?: string
    applicationId?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('error_type', 'upload_error')
      scope.setTag('file_type', context.fileType || 'unknown')
      scope.setLevel('error')

      scope.setContext('upload_context', {
        fileName: context.fileName,
        fileSize: context.fileSize,
        fileType: context.fileType,
        userId: context.userId,
        applicationId: context.applicationId
      })

      Sentry.captureException(error)
    })
  }
}

// ==============================================
// PERFORMANCE MONITORING
// ==============================================

export class PerformanceMonitor {
  // Track database query performance
  static startDatabaseTransaction(operation: string, collection?: string) {
    return Sentry.startTransaction({
      name: `db.${operation}`,
      op: 'db.query',
      data: {
        operation,
        collection
      }
    })
  }

  // Track API endpoint performance
  static startAPITransaction(endpoint: string, method: string) {
    return Sentry.startTransaction({
      name: `${method} ${endpoint}`,
      op: 'http.server',
      data: {
        endpoint,
        method
      }
    })
  }

  // Track application submission performance
  static startApplicationTransaction(serviceType: string, step: string) {
    return Sentry.startTransaction({
      name: `application.${serviceType}.${step}`,
      op: 'application.process',
      data: {
        serviceType,
        step
      }
    })
  }

  // Track page load performance
  static trackPagePerformance(pageName: string, loadTime: number) {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Page ${pageName} loaded`,
      level: 'info',
      data: {
        pageName,
        loadTime
      }
    })
  }
}

// ==============================================
// SECURITY MONITORING
// ==============================================

export class SecurityMonitor {
  // Track suspicious activities
  static trackSuspiciousActivity(activity: string, context: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    details?: any
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('security_event', true)
      scope.setTag('activity_type', activity)
      scope.setLevel('warning')

      scope.setContext('security_context', {
        activity,
        userId: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        details: context.details,
        timestamp: new Date().toISOString()
      })

      Sentry.captureMessage(`Suspicious activity detected: ${activity}`, 'warning')
    })
  }

  // Track failed login attempts
  static trackFailedLogin(context: {
    email?: string
    ipAddress?: string
    userAgent?: string
    attemptCount?: number
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('security_event', true)
      scope.setTag('event_type', 'failed_login')
      scope.setLevel('warning')

      scope.setContext('login_context', {
        email: context.email,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        attemptCount: context.attemptCount,
        timestamp: new Date().toISOString()
      })

      Sentry.captureMessage('Failed login attempt', 'warning')
    })
  }

  // Track privilege escalation attempts
  static trackPrivilegeEscalation(context: {
    userId?: string
    attemptedAction?: string
    currentRole?: string
    requiredRole?: string
    ipAddress?: string
  }) {
    Sentry.withScope((scope) => {
      scope.setTag('security_event', true)
      scope.setTag('event_type', 'privilege_escalation')
      scope.setLevel('error')

      scope.setContext('privilege_context', context)

      Sentry.captureMessage('Privilege escalation attempt detected', 'error')
    })
  }
}

// ==============================================
// BUSINESS METRICS MONITORING
// ==============================================

export class BusinessMetrics {
  // Track application volume
  static trackApplicationVolume(serviceType: string, count: number = 1) {
    Sentry.addBreadcrumb({
      category: 'business.metrics',
      message: 'Application submitted',
      level: 'info',
      data: {
        serviceType,
        count,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Track service usage
  static trackServiceUsage(serviceId: string, serviceName: string) {
    Sentry.addBreadcrumb({
      category: 'business.metrics',
      message: 'Service accessed',
      level: 'info',
      data: {
        serviceId,
        serviceName,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Track conversion funnel
  static trackConversionStep(step: string, serviceType: string, userId?: string) {
    Sentry.addBreadcrumb({
      category: 'business.conversion',
      message: `Conversion step: ${step}`,
      level: 'info',
      data: {
        step,
        serviceType,
        userId,
        timestamp: new Date().toISOString()
      }
    })
  }
}

// Export all monitoring utilities
export default {
  initSentry,
  ConsularErrorTracker,
  PerformanceMonitor,
  SecurityMonitor,
  BusinessMetrics
}
