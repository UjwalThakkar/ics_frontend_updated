import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB, { User } from '@/lib/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

interface AuthResult {
  success: boolean
  user?: any
  error?: string
}

export async function verifyToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from cookie or Authorization header
    let token = request.cookies.get('auth-token')?.value

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return { success: false, error: 'No authentication token provided' }
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()

    // Get user from database
    const user = await User.findOne({ userId: decoded.userId })
    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return { success: false, error: 'Account is inactive or suspended' }
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    }

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token' }
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token expired' }
    }

    console.error('Token verification error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export async function verifyAdminToken(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyToken(request)

  if (!authResult.success) {
    return authResult
  }

  // Check if user has admin privileges
  if (!['admin', 'super-admin'].includes(authResult.user?.role)) {
    return { success: false, error: 'Insufficient privileges' }
  }

  return authResult
}

export async function verifySuperAdminToken(request: NextRequest): Promise<AuthResult> {
  const authResult = await verifyToken(request)

  if (!authResult.success) {
    return authResult
  }

  // Check if user has super-admin privileges
  if (authResult.user?.role !== 'super-admin') {
    return { success: false, error: 'Super admin privileges required' }
  }

  return authResult
}

// Rate limiting middleware
const rateLimitMap = new Map()

export function rateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  return (request: NextRequest) => {
    const ip = request.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }

    const requests = rateLimitMap.get(ip)

    // Remove old requests outside the window
    const validRequests = requests.filter((time: number) => time > windowStart)
    rateLimitMap.set(ip, validRequests)

    if (validRequests.length >= max) {
      return { success: false, error: 'Too many requests' }
    }

    // Add current request
    validRequests.push(now)
    return { success: true }
  }
}

// Password strength validation
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Check for common patterns
  const commonPatterns = [
    'password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'
  ]

  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Password cannot contain common words or patterns')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Generate secure session token
export function generateSessionToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = require('bcryptjs')
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  return await bcrypt.compare(password, hash)
}
