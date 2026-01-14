import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'

// =============================================
// ENCRYPTION & HASHING UTILITIES
// =============================================

class SecurityUtils {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  private static readonly ALGORITHM = 'aes-256-gcm'

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encrypted = textParts.join(':')
    const decipher = crypto.createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Hash passwords securely
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err)
        resolve(salt + ':' + derivedKey.toString('hex'))
      })
    })
  }

  /**
   * Verify password hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':')
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err)
        resolve(key === derivedKey.toString('hex'))
      })
    })
  }

  /**
   * Generate secure random tokens
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64')
  }
}

// =============================================
// INPUT VALIDATION & SANITIZATION
// =============================================

class InputValidator {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    if (!input) return ''

    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim()
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  /**
   * Validate phone number (South African format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(?:\+27|0)[0-9]{9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  /**
   * Validate application ID format
   */
  static isValidApplicationId(id: string): boolean {
    const appIdRegex = /^ICS[0-9]{13}[A-Z0-9]{5}$/
    return appIdRegex.test(id)
  }

  /**
   * Sanitize file names
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
      .replace(/\.{2,}/g, '.') // Remove multiple dots
      .substring(0, 100) // Limit length
  }

  /**
   * Validate file type
   */
  static isAllowedFileType(mimeType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    return allowedTypes.includes(mimeType)
  }

  /**
   * Check for SQL injection patterns
   */
  static containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/i,
      /(\'|\"|;|--|\/\*|\*\/)/,
      /(\bOR\b.*=.*\bOR\b)/i,
      /(\bAND\b.*=.*\bAND\b)/i
    ]
    return sqlPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Validate and sanitize general input
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Check for malicious patterns
      if (this.containsSQLInjection(input)) {
        throw new Error('Invalid input detected')
      }
      return this.sanitizeHTML(input)
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item))
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeHTML(key)] = this.sanitizeInput(value)
      }
      return sanitized
    }

    return input
  }
}

// =============================================
// RATE LIMITING & DDOS PROTECTION
// =============================================

// class RateLimitManager {
//   private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map()

//   /**
//    * Check if IP is rate limited
//    */
//   static isRateLimited(ip: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
//     const now = Date.now()
//     const attempt = this.attempts.get(ip)

//     if (!attempt) {
//       this.attempts.set(ip, { count: 1, lastAttempt: now })
//       return false
//     }

//     // Reset if window has passed
//     if (now - attempt.lastAttempt > windowMs) {
//       this.attempts.set(ip, { count: 1, lastAttempt: now })
//       return false
//     }

//     // Increment attempts
//     attempt.count++
//     attempt.lastAttempt = now

//     return attempt.count > maxAttempts
//   }

//   /**
//    * Add failed attempt
//    */
//   static addFailedAttempt(ip: string): void {
//     const now = Date.now()
//     const attempt = this.attempts.get(ip) || { count: 0, lastAttempt: now }
//     attempt.count++
//     attempt.lastAttempt = now
//     this.attempts.set(ip, attempt)
//   }

//   /**
//    * Reset attempts for IP
//    */
//   static resetAttempts(ip: string): void {
//     this.attempts.delete(ip)
//   }

//   /**
//    * Clean old entries
//    */
//   static cleanup(): void {
//     const now = Date.now()
//     const windowMs = 900000 // 15 minutes

//     for (const [ip, attempt] of this.attempts.entries()) {
//       if (now - attempt.lastAttempt > windowMs) {
//         this.attempts.delete(ip)
//       }
//     }
//   }
// }

// =============================================
// SESSION MANAGEMENT
// =============================================

class SessionManager {
  private static sessions: Map<string, {
    userId: string
    createdAt: number
    lastActivity: number
    ipAddress: string
    userAgent: string
  }> = new Map()

  /**
   * Create new session
   */
  static createSession(userId: string, ipAddress: string, userAgent: string): string {
    const sessionId = SecurityUtils.generateSecureToken(64)
    const now = Date.now()

    this.sessions.set(sessionId, {
      userId,
      createdAt: now,
      lastActivity: now,
      ipAddress,
      userAgent
    })

    return sessionId
  }

  /**
   * Validate session
   */
  static validateSession(sessionId: string, ipAddress: string, userAgent: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const maxInactive = 2 * 60 * 60 * 1000 // 2 hours

    // Check if session expired
    if (now - session.createdAt > maxAge) {
      this.sessions.delete(sessionId)
      return false
    }

    // Check if session inactive too long
    if (now - session.lastActivity > maxInactive) {
      this.sessions.delete(sessionId)
      return false
    }

    // Verify IP and User Agent (basic session hijacking protection)
    if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
      this.sessions.delete(sessionId)
      return false
    }

    // Update last activity
    session.lastActivity = now
    return true
  }

  /**
   * Destroy session
   */
  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  /**
   * Clean expired sessions
   */
  static cleanupSessions(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.createdAt > maxAge) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// =============================================
// SECURITY HEADERS
// =============================================

class SecurityHeaders {
  /**
   * Apply security headers to response
   */
  static applyHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.whatsapp.com http://localhost:8000;" +
      "frame-ancestors 'none'; " +
      "base-uri 'self';"
    )

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    // HSTS (for HTTPS)
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    return response
  }
}

// =============================================
// SECURITY LOGGING
// =============================================

class SecurityLogger {
  /**
   * Log security events
   */
  static logSecurityEvent(
    event: string,
    details: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    ipAddress?: string
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      ipAddress,
      details,
      userAgent: details.userAgent || 'unknown'
    }

    // In production, send to security monitoring system
    console.warn('🔒 SECURITY EVENT:', JSON.stringify(logEntry, null, 2))

    // For critical events, could trigger alerts
    if (severity === 'critical') {
      this.triggerSecurityAlert(logEntry)
    }
  }

  /**
   * Trigger security alert
   */
  private static triggerSecurityAlert(logEntry: any): void {
    // In production, integrate with security monitoring systems
    console.error('🚨 CRITICAL SECURITY ALERT:', logEntry)
  }
}

// =============================================
// FILE SECURITY
// =============================================

class FileSecurityManager {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']

  /**
   * Validate uploaded file
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds maximum allowed (10MB)' }
    }

    // Check file type
    if (!InputValidator.isAllowedFileType(file.type)) {
      return { valid: false, error: 'File type not allowed' }
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' }
    }

    return { valid: true }
  }

  /**
   * Scan file for malware (basic checks)
   */
  static async scanFileContent(buffer: Buffer): Promise<{ clean: boolean; threat?: string }> {
    // Basic malware signature detection
    const maliciousPatterns = [
      Buffer.from('MZ'), // Executable files
      Buffer.from('PK\x03\x04'), // ZIP files (could contain malware)
      Buffer.from('#!/bin/sh'), // Shell scripts
      Buffer.from('<script'), // HTML with scripts
      Buffer.from('javascript:'), // JavaScript protocols
    ]

    for (const pattern of maliciousPatterns) {
      if (buffer.includes(pattern)) {
        return { clean: false, threat: 'Potentially malicious content detected' }
      }
    }

    return { clean: true }
  }
}

// =============================================
// SECURITY MIDDLEWARE
// =============================================

class SecurityMiddleware {
  /**
   * Apply comprehensive security middleware
   */
  static async apply(request: NextRequest): Promise<NextResponse | null> {
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Rate limiting
    if (RateLimitManager.isRateLimited(ip)) {
      SecurityLogger.logSecurityEvent(
        'RATE_LIMIT_EXCEEDED',
        { ip, userAgent, path: request.nextUrl.pathname },
        'high',
        ip
      )

      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      })
    }

    // CSRF protection for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      if (!csrfToken) {
        SecurityLogger.logSecurityEvent(
          'CSRF_TOKEN_MISSING',
          { ip, userAgent, path: request.nextUrl.pathname },
          'medium',
          ip
        )
      }
    }

    // Clean up old sessions and rate limit entries
    SessionManager.cleanupSessions()
    RateLimitManager.cleanup()

    return null
  }

  private static getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwardedFor) return forwardedFor.split(',')[0].trim()
    if (realIp) return realIp

    return request.ip || 'unknown'
  }
}

// =============================================
// EXPORT ALL SECURITY UTILITIES
// =============================================

export {
  SecurityUtils,
  InputValidator,
  SessionManager,
  SecurityHeaders,
  SecurityLogger,
  FileSecurityManager,
  SecurityMiddleware
}
