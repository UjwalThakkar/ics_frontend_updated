'use client'

import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import TrackingSection from '@/components/TrackingSection'

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Track Your <span className="text-saffron">Application</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enter your application reference number to check the current status and track progress in real-time.
          </p>
        </div>

        <TrackingSection />

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Status Guide</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium">Application Submitted</h4>
                  <p className="text-sm text-gray-600">Your application has been received and is being reviewed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium">Under Processing</h4>
                  <p className="text-sm text-gray-600">Documents are being verified and processed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium">Ready for Collection</h4>
                  <p className="text-sm text-gray-600">Your documents are ready for pickup</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium">Completed</h4>
                  <p className="text-sm text-gray-600">Application process is complete</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">Collection Hours</h4>
                <p className="text-sm text-gray-600">Monday - Friday: 3:00 PM - 4:30 PM</p>
                <p className="text-sm text-gray-600">Saturday: 3:00 PM - 4:30 PM</p>
                <p className="text-sm text-gray-600">Sunday: Closed</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">What to Bring</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Original receipt/acknowledgment</li>
                  <li>• Valid photo ID</li>
                  <li>• Application reference number</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Contact for Queries</h4>
                <p className="text-sm text-gray-600">Phone: +27 11 895 0460</p>
                <p className="text-sm text-gray-600">Email: consular.johannesburg@mea.gov.in</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppWidget />
    </div>
  )
}
