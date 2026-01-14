import { NextRequest, NextResponse } from 'next/server'
import {
  FileSecurityManager,
  InputValidator,
  SecurityLogger,
  SecurityHeaders,
  SecurityUtils
} from '@/lib/security'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    // Check authentication (simplified for demo)
    const authToken = request.headers.get('authorization') || request.cookies.get('auth-token')?.value
    if (!authToken) {
      SecurityLogger.logSecurityEvent(
        'FILE_UPLOAD_UNAUTHORIZED',
        { ip: clientIP, userAgent },
        'medium',
        clientIP
      )

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const applicationId = formData.get('applicationId') as string

    if (!file) {
      SecurityLogger.logSecurityEvent(
        'FILE_UPLOAD_NO_FILE',
        { ip: clientIP, userAgent, applicationId },
        'low',
        clientIP
      )

      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate application ID format
    if (applicationId && !InputValidator.isValidApplicationId(applicationId)) {
      SecurityLogger.logSecurityEvent(
        'FILE_UPLOAD_INVALID_APP_ID',
        { ip: clientIP, userAgent, applicationId, fileName: file.name },
        'medium',
        clientIP
      )

      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      )
    }

    // File validation
    const validation = FileSecurityManager.validateFile(file)
    if (!validation.valid) {
      SecurityLogger.logSecurityEvent(
        'FILE_UPLOAD_VALIDATION_FAILED',
        {
          ip: clientIP,
          userAgent,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error
        },
        'medium',
        clientIP
      )

      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get file buffer for content scanning
    const buffer = Buffer.from(await file.arrayBuffer())

    // Scan file content for malware
    const scanResult = await FileSecurityManager.scanFileContent(buffer)
    if (!scanResult.clean) {
      SecurityLogger.logSecurityEvent(
        'FILE_UPLOAD_MALWARE_DETECTED',
        {
          ip: clientIP,
          userAgent,
          fileName: file.name,
          threat: scanResult.threat
        },
        'critical',
        clientIP
      )

      return NextResponse.json(
        { error: 'File failed security scan: ' + scanResult.threat },
        { status: 400 }
      )
    }

    // Generate secure file name
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const secureFileName = `${SecurityUtils.generateSecureToken(16)}.${fileExtension}`
    const sanitizedOriginalName = InputValidator.sanitizeFileName(file.name)

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads', 'secure')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file securely
    const filePath = join(uploadDir, secureFileName)
    await writeFile(filePath, buffer)

    // Log successful upload
    SecurityLogger.logSecurityEvent(
      'FILE_UPLOAD_SUCCESS',
      {
        ip: clientIP,
        userAgent,
        originalFileName: sanitizedOriginalName,
        secureFileName,
        fileSize: file.size,
        fileType: file.type,
        applicationId
      },
      'low',
      clientIP
    )

    const response = NextResponse.json({
      success: true,
      fileId: SecurityUtils.generateSecureToken(32),
      fileName: secureFileName,
      originalName: sanitizedOriginalName,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      scanStatus: 'clean'
    })

    return SecurityHeaders.applyHeaders(response)

  } catch (error) {
    SecurityLogger.logSecurityEvent(
      'FILE_UPLOAD_ERROR',
      {
        ip: clientIP,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'high',
      clientIP
    )

    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve file information (with authorization check)
export async function GET(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      )
    }

    // Check authentication
    const authToken = request.headers.get('authorization') || request.cookies.get('auth-token')?.value
    if (!authToken) {
      SecurityLogger.logSecurityEvent(
        'FILE_ACCESS_UNAUTHORIZED',
        { ip: clientIP, userAgent, fileId },
        'medium',
        clientIP
      )

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // In a real implementation, you would:
    // 1. Validate the file ID exists in database
    // 2. Check user permissions to access this file
    // 3. Return file metadata or file content

    SecurityLogger.logSecurityEvent(
      'FILE_ACCESS_REQUEST',
      { ip: clientIP, userAgent, fileId },
      'low',
      clientIP
    )

    // Mock response for demo
    const response = NextResponse.json({
      success: true,
      fileId,
      message: 'File access logged and monitored'
    })

    return SecurityHeaders.applyHeaders(response)

  } catch (error) {
    SecurityLogger.logSecurityEvent(
      'FILE_ACCESS_ERROR',
      {
        ip: clientIP,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      'medium',
      clientIP
    )

    return NextResponse.json(
      { error: 'File access failed' },
      { status: 500 }
    )
  }
}
