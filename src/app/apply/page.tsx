'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FileText,
  Globe,
  Users,
  Award,
  BookOpen,
  Shield,
  ArrowRight,
  Clock,
  DollarSign,
  AlertCircle,
  Heart,
  FileCheck
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import ApplicationForm from '@/components/ApplicationForm'


interface ApplicationFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  placeOfBirth: string
  nationality: string
  gender: string
  maritalStatus: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  serviceType: string
  urgency: string
  previousApplications: string
  uploadedDocuments: Array<{
    name: string
    size: number
    type: string
    file: File
  }>
}

function ApplyPageContent() {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      const serviceParam = searchParams.get('service')
      if (serviceParam) {
        setSelectedService(serviceParam)
      }
    } catch (error) {
      // Handle static export errors gracefully
      console.log('Service parameter not available in static mode')
    }
  }, [searchParams])

  const services = [
    // Passport Services
    {
      id: 'passport-renewal',
      category: 'Passport Services',
      title: 'Passport Renewal (On Expiry)',
      description: 'Renew your Indian passport when validity is expiring within one year',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-blue-500',
      processingTime: '1 month',
      fee: 'R 1,155 (36 pages) / R 1,530 (60 pages)',
      documents: [
        'Application form (downloaded from passport.gov.in/nri)',
        'Self-attested copies of passport (first two and last two pages)',
        'Copy of passport page with visa/work permit',
        'Three passport sized photographs (5cm x 5cm, white background)',
        'Proof of residential address in South Africa',
        'Original passport for verification'
      ]
    },
    {
      id: 'passport-lost',
      category: 'Passport Services',
      title: 'Passport Re-issue (Lost/Stolen)',
      description: 'Apply for new passport in case of lost or stolen passport',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-blue-500',
      processingTime: '1 month',
      fee: 'R 2,425 (36 pages) / R 2,825 (60 pages)',
      documents: [
        'Application form for lost/stolen passport',
        'Self-attested copies of lost passport',
        'Copy of police report stating circumstances',
        'Three passport sized photographs',
        'Affidavit stating how passport was lost/stolen (Annexure L)',
        'Letter from employer with employment duration',
        'Copy of visa/work permit from employer',
        'Proof of residential address in South Africa'
      ]
    },
    {
      id: 'passport-damaged',
      category: 'Passport Services',
      title: 'Passport Re-issue (Damaged)',
      description: 'Apply for new passport in lieu of damaged passport',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-blue-500',
      processingTime: '1 month',
      fee: 'R 2,280 (36 pages) / R 2,655 (60 pages)',
      documents: [
        'Application form for damaged passport',
        'Self-attested copies of damaged passport',
        'Copy of passport page with visa/work permit',
        'Three passport sized photographs',
        'Affidavit stating how passport got damaged (Annexure L)',
        'Proof of residential address in South Africa',
        'Original damaged passport for verification'
      ]
    },
    {
      id: 'passport-pages',
      category: 'Passport Services',
      title: 'Passport Re-issue (Pages Exhausted)',
      description: 'Apply for new passport when all pages are exhausted',
      icon: <BookOpen className="h-8 w-8" />,
      color: 'bg-blue-500',
      processingTime: '1 month',
      fee: 'R 1,155 (36 pages) / R 1,530 (60 pages)',
      documents: [
        'Application form for passport renewal',
        'Self-attested copies of passport (first two and last two pages)',
        'Copy of last six pages of passport',
        'Copy of passport page with visa/work permit',
        'Three passport sized photographs',
        'Proof of residential address in South Africa'
      ]
    },
    // Visa Services
    {
      id: 'visa-regular',
      category: 'Visa Services',
      title: 'Regular Visa Application',
      description: 'Apply for Indian visa for foreign nationals',
      icon: <Globe className="h-8 w-8" />,
      color: 'bg-green-500',
      processingTime: '7-15 days',
      fee: 'Variable based on visa type and nationality',
      documents: [
        'Valid passport with minimum 6 months validity',
        'Visa application form (filled online)',
        'Two passport sized photographs',
        'Proof of accommodation in India',
        'Travel itinerary',
        'Financial proof',
        'Supporting documents based on visa type'
      ]
    },
    {
      id: 'visa-evisa',
      category: 'Visa Services',
      title: 'e-Visa Information & Support',
      description: 'Guidance and support for e-Visa applications',
      icon: <Globe className="h-8 w-8" />,
      color: 'bg-green-500',
      processingTime: '3-5 days',
      fee: 'Online payment only (as per e-visa portal)',
      documents: [
        'Valid passport',
        'Digital passport-sized photograph',
        'Supporting documents as per e-visa requirements',
        'Payment confirmation from e-visa portal'
      ]
    },
    // Police Clearance Certificate
    {
      id: 'pcc-indian',
      category: 'Police Clearance Certificate',
      title: 'PCC for Indian Nationals',
      description: 'Police Clearance Certificate for Indian passport holders',
      icon: <Shield className="h-8 w-8" />,
      color: 'bg-purple-500',
      processingTime: '2-3 weeks',
      fee: 'R 500',
      documents: [
        'Application form for PCC',
        'Original passport',
        'Self-attested copy of passport',
        'Proof of residence in South Africa',
        'Two passport sized photographs',
        'Purpose of PCC requirement'
      ]
    },
    {
      id: 'pcc-foreign',
      category: 'Police Clearance Certificate',
      title: 'PCC for Foreign Nationals',
      description: 'Police Clearance Certificate for foreign nationals',
      icon: <Shield className="h-8 w-8" />,
      color: 'bg-purple-500',
      processingTime: '2-3 weeks',
      fee: 'R 750',
      documents: [
        'Application form for PCC',
        'Original passport',
        'Copy of valid visa for India',
        'Proof of residence in South Africa',
        'Two passport sized photographs',
        'Purpose of PCC requirement'
      ]
    },
    // Consular Services
    {
      id: 'birth-registration',
      category: 'Consular Services',
      title: 'Child Birth Registration',
      description: 'Register birth of child born to Indian parents in South Africa',
      icon: <FileCheck className="h-8 w-8" />,
      color: 'bg-orange-500',
      processingTime: '7-10 days',
      fee: 'R 300',
      documents: [
        'Birth registration form',
        'Unabridged birth certificate',
        'Parents passports (original and copies)',
        'Parents marriage certificate',
        'Two passport sized photographs of child'
      ]
    },
    {
      id: 'emergency-travel',
      category: 'Consular Services',
      title: 'Emergency Travel Document',
      description: 'Emergency certificate for urgent travel to India',
      icon: <FileCheck className="h-8 w-8" />,
      color: 'bg-red-500',
      processingTime: '1-2 days',
      fee: 'R 800',
      documents: [
        'Emergency certificate application form',
        'Proof of emergency (medical/family)',
        'Copy of lost/stolen passport',
        'Police report (if applicable)',
        'Air tickets to India',
        'Three passport sized photographs'
      ]
    },
    {
      id: 'license-translation',
      category: 'Consular Services',
      title: 'Translation of Indian Driving License',
      description: 'Official translation of Indian driving license for SA use',
      icon: <FileCheck className="h-8 w-8" />,
      color: 'bg-blue-400',
      processingTime: '3-5 days',
      fee: 'R 200',
      documents: [
        'Original Indian driving license',
        'Copy of Indian driving license',
        'Copy of passport',
        'Application form for translation'
      ]
    },
    {
      id: 'marriage-certificate',
      category: 'Consular Services',
      title: 'Marriage Certificate',
      description: 'Registration of marriage performed in South Africa',
      icon: <Heart className="h-8 w-8" />,
      color: 'bg-pink-500',
      processingTime: '7-10 days',
      fee: 'R 400',
      documents: [
        'Marriage certificate application form',
        'South African marriage certificate',
        'Passports of both spouses',
        'Two witnesses with identification',
        'Two passport sized photographs each'
      ]
    },
    {
      id: 'same-certificate',
      category: 'Consular Services',
      title: 'One and the Same Certificate',
      description: 'Certificate confirming two names refer to same person',
      icon: <FileCheck className="h-8 w-8" />,
      color: 'bg-indigo-500',
      processingTime: '5-7 days',
      fee: 'R 300',
      documents: [
        'Application form',
        'Affidavit stating the different names',
        'Documentary proof of both names',
        'Copy of passport',
        'Two passport sized photographs'
      ]
    },
    {
      id: 'non-impediment',
      category: 'Consular Services',
      title: 'Non-Impediment Letter',
      description: 'Letter confirming no legal impediment to marriage',
      icon: <FileCheck className="h-8 w-8" />,
      color: 'bg-cyan-500',
      processingTime: '5-7 days',
      fee: 'R 350',
      documents: [
        'Non-impediment application form',
        'Affidavit of marital status',
        'Copy of passport',
        'Divorce decree (if previously married)',
        'Two passport sized photographs'
      ]
    },
    // OCI and Renunciation
    {
      id: 'oci-services',
      category: 'OCI Related Services',
      title: 'OCI Related Services',
      description: 'Overseas Citizen of India related applications and services',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-indigo-500',
      processingTime: '8-12 weeks',
      fee: 'Variable based on service type',
      documents: [
        'OCI application form (as applicable)',
        'Supporting documents based on service type',
        'Passport copies',
        'Proof of Indian origin',
        'Photographs as per specification'
      ]
    },
    {
      id: 'renunciation',
      category: 'OCI Related Services',
      title: 'Renunciation of Indian Citizenship',
      description: 'Formal renunciation of Indian citizenship',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-gray-600',
      processingTime: '4-6 weeks',
      fee: 'R 1,200',
      documents: [
        'Renunciation application form',
        'Original Indian passport',
        'Foreign passport/citizenship certificate',
        'Self-attested copies of all pages',
        'Two passport sized photographs'
      ]
    },
    // Document Attestation
    {
      id: 'attestation-documents',
      category: 'Document Attestation',
      title: 'Attestation of Documents/Degrees',
      description: 'Attestation of educational and other documents',
      icon: <Award className="h-8 w-8" />,
      color: 'bg-red-500',
      processingTime: '5-7 days',
      fee: 'R 250 per document',
      documents: [
        'Original documents to be attested',
        'Self-attested copies',
        'Copy of passport',
        'Purpose for attestation',
        'Application form for attestation'
      ]
    }
  ]

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
  }

  const handleFormSubmit = (formData: ApplicationFormData) => {
    alert('Application submitted successfully! Reference: ICS2025001234')
    console.log('Form data:', formData)
  }

  const handleFormSave = (formData: ApplicationFormData) => {
    alert('Application saved as draft!')
    console.log('Saved form data:', formData)
  }

  if (selectedService) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setSelectedService(null)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to Service Selection
            </button>
          </div>
          <ApplicationForm
            serviceType={selectedService}
            onSubmit={handleFormSubmit}
            onSave={handleFormSave}
          />
        </div>
        <Footer />
        <WhatsAppWidget />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Apply for <span className="text-saffron">Consular Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the service you wish to apply for. All applications require in-person submission
            with original documents and attested copies.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Application Requirements</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• All applications must be submitted in person</li>
                <li>• Bring original documents + 2 sets of attested copies from Commissioner of Oaths</li>
                <li>• Submission: 9:30 AM - 12:30 PM | Collection: 3:00 PM - 4:30 PM</li>
                <li>• Book appointment in advance to avoid waiting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Service Header */}
              <div className={`${service.color} text-white p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    {service.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Processing Time</div>
                    <div className="font-semibold">{service.processingTime}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-sm opacity-90">{service.category}</p>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">{service.description}</p>

                {/* Service Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Processing
                    </span>
                    <span className="font-medium">{service.processingTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fee
                    </span>
                    <span className="font-medium">{service.fee}</span>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Required Documents:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.documents.map((doc, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleServiceSelect(service.id)}
                  className={`w-full ${service.color} text-white py-3 rounded-lg font-semibold flex items-center justify-center hover:opacity-90 transition-opacity`}
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Process Steps */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Application <span className="text-saffron">Process</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '1',
                title: 'Select Service',
                description: 'Choose your required consular service',
                icon: <FileText className="h-6 w-6" />
              },
              {
                step: '2',
                title: 'Fill Application',
                description: 'Complete the online application form',
                icon: <FileText className="h-6 w-6" />
              },
              {
                step: '3',
                title: 'Book Appointment',
                description: 'Schedule your document submission',
                icon: <Clock className="h-6 w-6" />
              },
              {
                step: '4',
                title: 'Submit Documents',
                description: 'Visit consulate with required documents',
                icon: <FileText className="h-6 w-6" />
              },
              {
                step: '5',
                title: 'Track & Collect',
                description: 'Track status and collect documents',
                icon: <Shield className="h-6 w-6" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                {index < 4 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-saffron to-orange-400 z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-saffron text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-navy mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Document Checklist</h4>
                <p className="text-sm text-blue-600">Download required document lists</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Processing Times</h4>
                <p className="text-sm text-blue-600">Check current processing times</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Support</h4>
                <p className="text-sm text-blue-600">Contact our support team</p>
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

export default function ApplyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplyPageContent />
    </Suspense>
  )
}
