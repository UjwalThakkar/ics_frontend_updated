'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import { phpAPI } from '@/lib/php-api-client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Service {
  service_id: number
  title: string
  description: string
  required_documents: string[]
  category: string
}

interface FormData {
  full_name: string
  nationality_applicant: string
  father_full_name: string
  father_nationality: string
  mother_full_name: string
  mother_nationality: string
  date_of_birth: string
  place_of_birth: string
  country_of_birth: string
  spouse_name: string
  spouse_nationality: string
  present_address_sa: string
  phone_number: string
  email_address: string
  profession_employer_details: string
  visa_immigration_status: string
  permanent_address_india: string
  passport_number: string
  passport_validity: string
  passport_date_of_issue: string
  passport_place_of_issue: string
  registered_with_indian_mission: boolean
  registration_number: string
  registration_date: string
}

interface FileUpload {
  file: File
  documentType: string
  id: string
}

function MiscellaneousFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([])

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    nationality_applicant: '',
    father_full_name: '',
    father_nationality: '',
    mother_full_name: '',
    mother_nationality: '',
    date_of_birth: '',
    place_of_birth: '',
    country_of_birth: '',
    spouse_name: '',
    spouse_nationality: '',
    present_address_sa: '',
    phone_number: '',
    email_address: '',
    profession_employer_details: '',
    visa_immigration_status: '',
    permanent_address_india: '',
    passport_number: '',
    passport_validity: '',
    passport_date_of_issue: '',
    passport_place_of_issue: '',
    registered_with_indian_mission: false,
    registration_number: '',
    registration_date: '',
  })

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceId = searchParams.get('service')
        if (!serviceId) {
          toast.error('Service ID is required')
          router.push('/services')
          return
        }

        const response = await phpAPI.getServices()
        const services = response.data?.services || []
        const foundService = services.find(
          (s: any) => s.service_id === parseInt(serviceId)
        )

        if (!foundService) {
          toast.error('Service not found')
          router.push('/services')
          return
        }

        if (foundService.category !== 'Miscellaneous') {
          toast.error('This form is only for Miscellaneous services')
          router.push('/services')
          return
        }

        setService(foundService)
        setRequiredDocuments(foundService.required_documents || [])
        
        // Pre-fill email if user is logged in
        if (user?.email) {
          setFormData((prev) => ({
            ...prev,
            email_address: user.email || '',
          }))
        }
      } catch (error: any) {
        console.error('Failed to fetch service:', error)
        toast.error('Failed to load service details')
        router.push('/services')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchService()
    }
  }, [searchParams, authLoading, user, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please login to submit an application')
      router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`)
    }
  }, [authLoading, isAuthenticated, router])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : type === 'date' ? value : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: FileUpload[] = Array.from(files).map((file) => ({
      file,
      documentType,
      id: `${documentType}-${Date.now()}-${Math.random()}`,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    if (!formData.nationality_applicant.trim()) {
      newErrors.nationality_applicant = 'Nationality is required'
    }
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    }
    if (!formData.place_of_birth.trim()) {
      newErrors.place_of_birth = 'Place of birth is required'
    }
    if (!formData.country_of_birth.trim()) {
      newErrors.country_of_birth = 'Country of birth is required'
    }
    if (!formData.present_address_sa.trim()) {
      newErrors.present_address_sa = 'Present address in South Africa is required'
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }
    if (!formData.email_address.trim()) {
      newErrors.email_address = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = 'Invalid email address'
    }
    if (!formData.passport_number.trim()) {
      newErrors.passport_number = 'Passport number is required'
    }
    if (!formData.passport_validity) {
      newErrors.passport_validity = 'Passport validity is required'
    }
    if (!formData.passport_date_of_issue) {
      newErrors.passport_date_of_issue = 'Passport date of issue is required'
    }
    if (!formData.passport_place_of_issue.trim()) {
      newErrors.passport_place_of_issue = 'Passport place of issue is required'
    }

    // If registered with mission, require registration details
    if (formData.registered_with_indian_mission) {
      if (!formData.registration_number.trim()) {
        newErrors.registration_number = 'Registration number is required'
      }
      if (!formData.registration_date) {
        newErrors.registration_date = 'Registration date is required'
      }
    }

    // Check if required documents are uploaded
    if (requiredDocuments.length > 0 && uploadedFiles.length === 0) {
      newErrors.documents = 'Please upload at least one required document'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!service) {
      toast.error('Service information is missing')
      return
    }

    setSubmitting(true)

    try {
      // Prepare files object
      const filesObject: { [key: string]: File[] } = {}
      uploadedFiles.forEach((fileUpload) => {
        if (!filesObject[fileUpload.documentType]) {
          filesObject[fileUpload.documentType] = []
        }
        filesObject[fileUpload.documentType].push(fileUpload.file)
      })

      // Prepare payload
      const payload = {
        service_id: service.service_id,
        full_name: formData.full_name.trim(),
        nationality: formData.nationality_applicant.trim(),
        father_name: formData.father_full_name.trim() || undefined,
        father_nationality: formData.father_nationality.trim() || undefined,
        mother_name: formData.mother_full_name.trim() || undefined,
        mother_nationality: formData.mother_nationality.trim() || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        place_of_birth: formData.place_of_birth.trim() || undefined,
        country_of_birth: formData.country_of_birth.trim() || undefined,
        spouse_name: formData.spouse_name.trim() || undefined,
        spouse_nationality: formData.spouse_nationality.trim() || undefined,
        present_address_sa: formData.present_address_sa.trim() || undefined,
        phone_number: formData.phone_number.trim(),
        email_address: formData.email_address.trim(),
        profession: formData.profession_employer_details.split('|')[0]?.trim() || undefined,
        employer_details: formData.profession_employer_details.split('|')[1]?.trim() || undefined,
        visa_immigration_status: formData.visa_immigration_status.trim() || undefined,
        permanent_address_india: formData.permanent_address_india.trim() || undefined,
        passport_number: formData.passport_number.trim() || undefined,
        passport_validity: formData.passport_validity || undefined,
        passport_date_of_issue: formData.passport_date_of_issue || undefined,
        passport_place_of_issue: formData.passport_place_of_issue.trim() || undefined,
        is_registered_with_mission: formData.registered_with_indian_mission || false,
        registration_number: formData.registration_number.trim() || undefined,
        registration_date: formData.registration_date || undefined,
      }

      const response = await phpAPI.submitMiscellaneousApplication(
        payload,
        filesObject
      )

      toast.success(
        `Application submitted successfully! Application ID: ${response.application_id}`
      )

      // Redirect to tracking page or success page
      router.push(`/track?application_id=${response.application_id}`)
    } catch (error: any) {
      console.error('Failed to submit application:', error)
      toast.error(
        error.message || 'Failed to submit application. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
        <Footer />
        <WhatsAppWidget />
      </div>
    )
  }

  if (!service) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {service.title}
          </h1>
          <p className="text-gray-600">{service.description}</p>
        </div>

        {/* Required Documents Info */}
        {requiredDocuments.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              {requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.full_name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nationality_applicant"
                  value={formData.nationality_applicant}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.nationality_applicant
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.nationality_applicant && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nationality_applicant}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.date_of_birth
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.date_of_birth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.place_of_birth
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.place_of_birth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.place_of_birth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country_of_birth"
                  value={formData.country_of_birth}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.country_of_birth
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.country_of_birth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.country_of_birth}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Family Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Family Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Full Name
                </label>
                <input
                  type="text"
                  name="father_full_name"
                  value={formData.father_full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Nationality
                </label>
                <input
                  type="text"
                  name="father_nationality"
                  value={formData.father_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Full Name
                </label>
                <input
                  type="text"
                  name="mother_full_name"
                  value={formData.mother_full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Nationality
                </label>
                <input
                  type="text"
                  name="mother_nationality"
                  value={formData.mother_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spouse's Name
                </label>
                <input
                  type="text"
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spouse's Nationality
                </label>
                <input
                  type="text"
                  name="spouse_nationality"
                  value={formData.spouse_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email_address
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.email_address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email_address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone_number
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone_number}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Present Address in South Africa{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="present_address_sa"
                  value={formData.present_address_sa}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.present_address_sa
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.present_address_sa && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.present_address_sa}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address in India
                </label>
                <textarea
                  name="permanent_address_india"
                  value={formData.permanent_address_india}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession / Employer Details
                </label>
                <textarea
                  name="profession_employer_details"
                  value={formData.profession_employer_details}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter profession and employer details (separate with | if needed)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visa / Immigration Status
                </label>
                <input
                  type="text"
                  name="visa_immigration_status"
                  value={formData.visa_immigration_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Passport Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Passport Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.passport_number
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.passport_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.passport_number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Issue <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="passport_date_of_issue"
                  value={formData.passport_date_of_issue}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.passport_date_of_issue
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.passport_date_of_issue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.passport_date_of_issue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Issue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passport_place_of_issue"
                  value={formData.passport_place_of_issue}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.passport_place_of_issue
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.passport_place_of_issue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.passport_place_of_issue}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="passport_validity"
                  value={formData.passport_validity}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.passport_validity
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.passport_validity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.passport_validity}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mission Registration Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Indian Mission Registration
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="registered_with_indian_mission"
                  checked={formData.registered_with_indian_mission}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Are you registered with Indian Mission/Post?
                </label>
              </div>

              {formData.registered_with_indian_mission && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.registration_number
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.registration_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.registration_number}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="registration_date"
                      value={formData.registration_date}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.registration_date
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.registration_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.registration_date}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Required Documents
            </h2>

            {requiredDocuments.length > 0 && (
              <div className="space-y-4">
                {requiredDocuments.map((doc, index) => {
                  // Create a sanitized field name for the document
                  const fieldName = `document_${index + 1}_${doc.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}`
                  return (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {doc}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, fieldName)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        multiple
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Files:
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((fileUpload) => (
                    <div
                      key={fileUpload.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {fileUpload.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({fileUpload.documentType})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(fileUpload.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.documents && (
              <p className="text-red-500 text-xs mt-1">{errors.documents}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
      <WhatsAppWidget />
    </div>
  )
}

export default function MiscellaneousFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MiscellaneousFormContent />
    </Suspense>
  )
}

