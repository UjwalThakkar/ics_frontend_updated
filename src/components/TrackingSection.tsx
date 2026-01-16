'use client'

import React, { useState } from 'react'
import { Search, CheckCircle, Clock } from 'lucide-react'
import { phpAPI } from '@/lib/php-api-client'
import { toast } from 'sonner'

const TrackingSection = () => {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatStatus = (status: string): string => {
    // Handle null/undefined
    if (!status || status === 'null' || status === 'NULL') {
      return 'Submitted'
    }
    
    const statusMap: Record<string, string> = {
      'submitted': 'Submitted',
      'in-progress': 'In Progress',
      'in_progress': 'In Progress', // Support both formats
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed',
      // Legacy/alternative status names
      'under_review': 'Under Review',
      'processing': 'Processing',
      'ready_for_collection': 'Ready for Collection',
      'cancelled': 'Cancelled'
    }
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ').replace(/-/g, ' ')
  }

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter an application ID')
      return
    }

    setIsLoading(true)
    setTrackingResult(null)

    try {
      const data = await phpAPI.trackMiscellaneousApplication(trackingNumber.trim())
      
      setTrackingResult({
        applicationNumber: data.application_id,
        serviceType: data.service_type,
        status: data.status,
        submissionDate: data.submitted_at,
        expectedCompletion: data.expected_completion,
        stages: data.timeline,
        adminNotes: data.admin_notes || null
      })
    } catch (error: any) {
      console.error('Tracking error:', error)
      toast.error(error.message || 'Failed to track application. Please check your application ID.')
      setTrackingResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-navy mb-4">
            Track Your <span className="text-saffron">Application</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your application number to check the current status and track progress in real-time.
          </p>
        </div>

        {/* Tracking Input */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 mb-2">
                  Application Number
                </label>
                <input
                  id="tracking"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your application number (e.g., ICS2025001234)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTrack}
                  disabled={isLoading || !trackingNumber.trim()}
                  className="px-8 py-3 bg-saffron hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Track
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Results */}
        {trackingResult && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Application Status</h3>
                    <p className="text-blue-100">Application #{trackingResult.applicationNumber}</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-lg">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-semibold">{formatStatus(trackingResult.status)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service Type</label>
                    <p className="text-lg font-semibold text-gray-800">{trackingResult.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(trackingResult.submissionDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expected Completion</label>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(trackingResult.expectedCompletion)}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {trackingResult.adminNotes && (
                  <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h5 className="text-sm font-medium text-yellow-800 mb-1">Admin Note</h5>
                        <p className="text-sm text-yellow-700 whitespace-pre-wrap">{trackingResult.adminNotes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Timeline */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-6">Processing Timeline</h4>
                  <div className="space-y-4">
                    {trackingResult.stages.map((stage: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0">
                          {stage.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : stage.current ? (
                            <Clock className="h-6 w-6 text-orange-500 animate-pulse" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className={`font-medium ${
                              stage.completed ? 'text-green-700' :
                              stage.current ? 'text-orange-700' : 'text-gray-500'
                            }`}>
                              {stage.name}
                            </h5>
                            {stage.date && (
                              <span className="text-sm text-gray-500">{formatDate(stage.date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-4">
              If you're unable to track your application or need assistance, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <span className="text-gray-600">Email: consular.johannesburg@mea.gov.in</span>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span className="text-gray-600">Phone: +27 11 895 0460</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrackingSection
