// components/ServiceDetails.tsx (no major changes needed, as it receives service prop)
"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Download,
  AlertCircle,
} from "lucide-react";

interface Service {
  id?: string; // Adjust based on API
  serviceId?: string;
  category: string;
  title: string;
  description: string;
  processingTime?: string;
  processing_time?: string; // If API uses snake_case
  fees: Array<{
    type: string;
    amount: number;
    currency: string;
  }>;
  required_documents: string[];
  eligibility_requirements: string[];
  isActive: boolean;
}

interface ServiceDetailsProps {
  service: Service;
}
const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/services"
            className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>

          <div className="max-w-4xl">
            <div className="text-sm text-blue-200 mb-2">{service.category}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {service.title}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Service Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Processing Time
                    </h3>
                    <p className="text-gray-600">{service.processing_time}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">Fees</h3>
                    <div className="text-gray-600">
                      {service.fees.map((fee, index) => (
                        <div key={index}>
                          {fee.type} -{" "}
                          {fee.amount > 0
                            ? `${fee.currency || "ZAR"} ${fee.amount}`
                            : "No fee"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                Required Documents
              </h2>

              <div className="space-y-3">
                {service.required_documents.map((doc, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong> All documents must be original
                    or attested copies. Please bring 2 sets of photocopies of
                    all documents.
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Eligibility Requirements
              </h2>

              <div className="space-y-3">
                {service.eligibility_requirements.map((req, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Process */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Application Process
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Prepare Documents
                    </h3>
                    <p className="text-gray-600">
                      Gather all required documents and make attested copies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Book Appointment
                    </h3>
                    <p className="text-gray-600">
                      Schedule an appointment through our online booking system.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Submit Application
                    </h3>
                    <p className="text-gray-600">
                      Visit the consulate with your documents and application
                      form.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Track Progress
                    </h3>
                    <p className="text-gray-600">
                      Monitor your application status online using your
                      reference number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    5
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Collect Documents
                    </h3>
                    <p className="text-gray-600">
                      Receive notification and collect your processed documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Link
                  href={`/apply?service=${service.id}`}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                >
                  Apply Now
                </Link>

                <Link
                  href="/appointment"
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Book Appointment
                </Link>

                <Link
                  href="/track"
                  className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium"
                >
                  Track Application
                </Link>

                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium">
                  <Download className="h-4 w-4 mr-2" />
                  Download Form
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Phone</div>
                    <div className="text-gray-600">+27 11 895 0460</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">
                      consular.johannesburg@mea.gov.in
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-gray-600">
                      Consulate General of India
                      <br />
                      Johannesburg, South Africa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Office Hours
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Submission:</span>
                  <span className="font-medium">9:30 AM - 12:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Collection:</span>
                  <span className="font-medium">3:00 PM - 4:30 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Working Days:</span>
                  <span className="font-medium">Mon - Fri</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="font-medium">Emergency Only</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-red-800 mb-1">
                    Important Notice
                  </div>
                  <div className="text-red-700">
                    All applications must be submitted in person. Appointment
                    booking is mandatory to avoid waiting time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
