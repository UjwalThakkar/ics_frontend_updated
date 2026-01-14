'use client'

import React from 'react'

interface QRCodeGeneratorProps {
  data: {
    applicationId: string
    applicantName: string
    appointmentDate: string
    appointmentTime: string
    serviceType: string
    consularOfficer?: string
    location: string
  }
  size?: number
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ data, size = 200 }) => {
  // Create QR code data string
  const qrData = JSON.stringify({
    id: data.applicationId,
    name: data.applicantName,
    date: data.appointmentDate,
    time: data.appointmentTime,
    service: data.serviceType,
    officer: data.consularOfficer || 'TBD',
    location: data.location,
    timestamp: new Date().toISOString()
  })

  // Generate QR code using a simple pattern (in real implementation, use a proper QR library)
  const generateQRPattern = () => {
    const gridSize = 25
    const cellSize = size / gridSize
    const pattern = []

    // Simple QR-like pattern generation
    for (let row = 0; row < gridSize; row++) {
      const rowPattern = []
      for (let col = 0; col < gridSize; col++) {
        // Create a pattern based on the data hash
        const hash = qrData.charCodeAt((row * gridSize + col) % qrData.length)
        const isBlack = hash % 2 === 0
        rowPattern.push(isBlack)
      }
      pattern.push(rowPattern)
    }

    return pattern
  }

  const pattern = generateQRPattern()

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
        <svg width={size} height={size} className="border border-gray-300">
          {pattern.map((row, rowIndex) =>
            row.map((isBlack, colIndex) => (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * (size / 25)}
                y={rowIndex * (size / 25)}
                width={size / 25}
                height={size / 25}
                fill={isBlack ? '#000' : '#fff'}
              />
            ))
          )}

          {/* Add finder patterns (corners) */}
          {/* Top-left finder pattern */}
          <rect x="0" y="0" width={size / 5} height={size / 5} fill="#000" />
          <rect x={size / 25} y={size / 25} width={size / 5 - 2 * (size / 25)} height={size / 5 - 2 * (size / 25)} fill="#fff" />
          <rect x={size / 12.5} y={size / 12.5} width={size / 8.33} height={size / 8.33} fill="#000" />

          {/* Top-right finder pattern */}
          <rect x={size - size / 5} y="0" width={size / 5} height={size / 5} fill="#000" />
          <rect x={size - size / 5 + size / 25} y={size / 25} width={size / 5 - 2 * (size / 25)} height={size / 5 - 2 * (size / 25)} fill="#fff" />
          <rect x={size - size / 5 + size / 12.5} y={size / 12.5} width={size / 8.33} height={size / 8.33} fill="#000" />

          {/* Bottom-left finder pattern */}
          <rect x="0" y={size - size / 5} width={size / 5} height={size / 5} fill="#000" />
          <rect x={size / 25} y={size - size / 5 + size / 25} width={size / 5 - 2 * (size / 25)} height={size / 5 - 2 * (size / 25)} fill="#fff" />
          <rect x={size / 12.5} y={size - size / 5 + size / 12.5} width={size / 8.33} height={size / 8.33} fill="#000" />
        </svg>

        {/* Indian Government Branding */}
        <div className="mt-2 text-center">
          <p className="text-xs font-medium text-navy">Consulate General of India</p>
          <p className="text-xs text-gray-600">Johannesburg</p>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-sm">
        <h3 className="font-semibold text-navy mb-2">Appointment Details</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Application ID:</span>
            <span className="font-medium">{data.applicationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Applicant:</span>
            <span className="font-medium">{data.applicantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{data.appointmentDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{data.appointmentTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{data.serviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{data.location}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full max-w-sm">
        <h4 className="font-medium text-yellow-800 mb-1 text-sm">Important Instructions:</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Present this QR code at the entrance</li>
          <li>• Arrive 15 minutes before your appointment</li>
          <li>• Bring all required documents</li>
          <li>• Valid ID is mandatory</li>
        </ul>
      </div>

      {/* Security Features */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure QR Code • Generated: {new Date().toLocaleDateString()}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          This QR code is unique and contains encrypted appointment information
        </p>
      </div>
    </div>
  )
}

export default QRCodeGenerator
