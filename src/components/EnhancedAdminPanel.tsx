'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Bell,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Save,
  X,
  Send,
  DollarSign,
  Calendar
} from 'lucide-react'

interface Application {
  applicationId: string
  applicantInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredNotification: string
  }
  serviceType: string
  status: string
  submittedAt: string
  lastUpdated: string
  processingNotes?: string
  expectedCompletionDate?: string
  documents: Array<{
    filename: string
    originalName: string
    size: number
  }>
  timeline: Array<{
    status: string
    timestamp: string
    notes: string
    updatedBy: string
  }>
}

interface Service {
  serviceId: string
  category?: string
  title: string
  description?: string
  processingTime?: string
  fees?: Array<{
    description: string
    amount: number
    currency: string
  }>
  requiredDocuments?: string[]
  eligibilityRequirements?: string[]
  isActive?: boolean
}

const EnhancedAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [applications, setApplications] = useState<Application[]>([])
  // Services state for appointment booking
  const [services, setServices] = useState<Service[]>([
    { serviceId: 'passport-renewal', title: 'Passport Renewal' },
    { serviceId: 'visa-application', title: 'Visa Application' },
    { serviceId: 'oci-services', title: 'OCI Services' },
    { serviceId: 'pcc-indian', title: 'PCC for Indian Nationals' },
    { serviceId: 'pcc-foreign', title: 'PCC for Foreign Nationals' },
    { serviceId: 'birth-certificate', title: 'Birth Certificate' },
    { serviceId: 'document-attestation', title: 'Document Attestation' },
    { serviceId: 'emergency-certificate', title: 'Emergency Certificate' }
  ])
  const [loading, setLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    readyForCollection: 0,
    completedApplications: 0,
    rejectedApplications: 0,
    todaySubmissions: 0
  })

  // Manual appointment booking state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    priority: 'normal'
  })

  // Bulk appointment management state
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAppointments, setBulkAppointments] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    serviceType: '',
    maxSlots: 20
  })

  // Calendar view state
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [appointmentSlots, setAppointmentSlots] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'applications') {
      fetchApplications()
    } else if (activeTab === 'services') {
      fetchServices()
    }
  }, [activeTab, pagination.page, filterStatus, searchTerm])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/applications?${params}`)
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
        setPagination(data.pagination)

        // Calculate stats
        const total = data.pagination.total
        const submitted = data.applications.filter((app: Application) => app.status === 'submitted').length
        const inProgress = data.applications.filter((app: Application) => app.status === 'in-progress').length
        const ready = data.applications.filter((app: Application) => app.status === 'ready-for-collection').length
        const completed = data.applications.filter((app: Application) => app.status === 'completed').length
        const rejected = data.applications.filter((app: Application) => app.status === 'rejected').length

        const today = data.applications.filter((app: Application) => {
          const appDate = new Date(app.submittedAt).toDateString()
          const todayDate = new Date().toDateString()
          return appDate === todayDate
        }).length

        setStats({
          totalApplications: total,
          pendingApplications: submitted,
          inProgressApplications: inProgress,
          readyForCollection: ready,
          completedApplications: completed,
          rejectedApplications: rejected,
          todaySubmissions: today
        })
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      alert('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/services?includeInactive=true')
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      alert('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplication.applicationId,
          status: newStatus,
          notes: statusNotes
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchApplications()
        setShowStatusModal(false)
        setSelectedApplication(null)
        setNewStatus('')
        setStatusNotes('')
        alert('Application status updated successfully! Notification sent to applicant.')
      } else {
        alert('Failed to update application: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update application:', error)
      alert('Failed to update application')
    }
  }

  const saveService = async (service: Service) => {
    try {
      const isNew = !services.find(s => s.serviceId === service.serviceId)
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      })

      const data = await response.json()
      if (data.success) {
        fetchServices()
        setEditingService(null)
        alert(`Service ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert(`Failed to ${isNew ? 'create' : 'update'} service: ` + data.error)
      }
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service')
    }
  }

  const exportApplications = async () => {
    try {
      const response = await fetch('/api/admin/export/applications')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (error) {
      console.error('Failed to export applications:', error)
      alert('Failed to export applications')
    }
  }

  // Enhanced backup functionality
  const createFullBackup = async () => {
    const confirmed = window.confirm('Create a comprehensive backup including applications, appointments, users, and system settings?')
    if (!confirmed) return

    try {
      setLoading(true)

      // Fetch all data from different endpoints
      const [applicationsRes, appointmentsRes, usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/applications'),
        fetch('/api/admin/calendar/schedule'),
        fetch('/api/admin/users'),
        fetch('/api/admin/system/config')
      ])

      const applications = await applicationsRes.json()
      const appointments = await appointmentsRes.json()
      const users = await usersRes.json()
      const settings = await settingsRes.json()

      // Create comprehensive backup object
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          applications: applications.applications || [],
          appointments: appointments.appointments || [],
          users: users.users || [],
          settings: settings.config || {},
          statistics: {
            totalApplications: applications.total || 0,
            totalAppointments: appointments.total || 0,
            totalUsers: users.total || 0,
            backupDate: new Date().toLocaleDateString()
          }
        }
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `indian-consular-backup-${timestamp}`

      // Create and download JSON backup
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const jsonUrl = URL.createObjectURL(jsonBlob)
      const jsonLink = document.createElement('a')
      jsonLink.href = jsonUrl
      jsonLink.download = `${filename}.json`
      jsonLink.click()

      // Create CSV for applications
      if (backupData.data.applications.length > 0) {
        const csvHeaders = 'Application ID,Service Type,Applicant Name,Email,Status,Submitted Date,Last Updated\n'
        const csvData = backupData.data.applications.map(app =>
          `${app.applicationId},"${app.serviceType}","${app.applicantInfo.firstName} ${app.applicantInfo.lastName}",${app.applicantInfo.email},${app.status},${app.submittedAt},${app.lastUpdated}`
        ).join('\n')

        const csvBlob = new Blob([csvHeaders + csvData], { type: 'text/csv' })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvLink = document.createElement('a')
        csvLink.href = csvUrl
        csvLink.download = `${filename}-applications.csv`
        csvLink.click()
      }

      alert(`Backup created successfully!\n\n📋 Total Applications: ${backupData.data.applications.length}\n📅 Total Appointments: ${backupData.data.appointments.length}\n👥 Total Users: ${backupData.data.users.length}\n\nFiles downloaded: JSON backup + CSV export`)

    } catch (error) {
      console.error('Backup failed:', error)
      alert('Backup failed. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'ready-for-collection':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'ready-for-collection':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-200 text-green-900'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Enhanced manual appointment booking
  const createManualAppointment = async () => {
    if (!newAppointment.clientName || !newAppointment.serviceType || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      alert('Please fill in all required fields (Name, Service, Date, Time)')
      return
    }

    try {
      setLoading(true)

      const appointmentData = {
        ...newAppointment,
        appointmentId: `APT${Date.now()}`,
        status: 'confirmed',
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        bookedBy: 'manual'
      }

      const response = await fetch('/api/admin/calendar/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        // Send confirmation email
        await sendAppointmentConfirmation(appointmentData)

        alert(`✅ Appointment booked successfully!\n\n👤 Client: ${newAppointment.clientName}\n📧 Email: ${newAppointment.clientEmail}\n🗓️ Date: ${newAppointment.appointmentDate}\n⏰ Time: ${newAppointment.appointmentTime}\n📋 Service: ${newAppointment.serviceType}\n\n📧 Confirmation email sent!`)

        // Reset form
        setNewAppointment({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          serviceType: '',
          appointmentDate: '',
          appointmentTime: '',
          notes: '',
          priority: 'normal'
        })
        setShowAppointmentModal(false)

        // Refresh data if needed
        fetchApplications()
      } else {
        throw new Error('Failed to create appointment')
      }
    } catch (error) {
      console.error('Failed to create appointment:', error)
      alert('Failed to create appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Bulk appointment slot generation
  const generateBulkSlots = async () => {
    if (!bulkAppointments.date || !bulkAppointments.serviceType) {
      alert('Please select date and service type')
      return
    }

    const slots = []
    const startHour = parseInt(bulkAppointments.startTime.split(':')[0])
    const startMinute = parseInt(bulkAppointments.startTime.split(':')[1])
    const endHour = parseInt(bulkAppointments.endTime.split(':')[0])
    const endMinute = parseInt(bulkAppointments.endTime.split(':')[1])

    let currentTime = new Date(`${bulkAppointments.date}T${bulkAppointments.startTime}:00`)
    const endTime = new Date(`${bulkAppointments.date}T${bulkAppointments.endTime}:00`)

    let slotCount = 0
    while (currentTime < endTime && slotCount < bulkAppointments.maxSlots) {
      slots.push({
        appointmentId: `BULK${Date.now()}_${slotCount}`,
        date: bulkAppointments.date,
        time: currentTime.toTimeString().slice(0, 5),
        serviceType: bulkAppointments.serviceType,
        status: 'available',
        duration: bulkAppointments.slotDuration
      })

      currentTime.setMinutes(currentTime.getMinutes() + bulkAppointments.slotDuration)
      slotCount++
    }

    try {
      setLoading(true)

      // Create all slots
      const response = await fetch('/api/admin/calendar/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slots })
      })

      if (response.ok) {
        alert(`✅ Bulk appointment slots created!\n\n📅 Date: ${bulkAppointments.date}\n⏰ Time Range: ${bulkAppointments.startTime} - ${bulkAppointments.endTime}\n📋 Service: ${bulkAppointments.serviceType}\n🎯 Total Slots: ${slots.length}`)
        setShowBulkModal(false)
        setBulkAppointments({
          date: '',
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          serviceType: '',
          maxSlots: 20
        })
      } else {
        throw new Error('Failed to create bulk slots')
      }
    } catch (error) {
      console.error('Bulk slot creation failed:', error)
      alert('Failed to create bulk slots. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Email confirmation for appointments
  const sendAppointmentConfirmation = async (appointmentData: any) => {
    try {
      const emailTemplate = {
        to: appointmentData.clientEmail,
        subject: `Appointment Confirmation - ${appointmentData.serviceType}`,
        template: 'appointment_confirmation',
        data: {
          clientName: appointmentData.clientName,
          serviceType: appointmentData.serviceType,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          appointmentId: appointmentData.appointmentId,
          notes: appointmentData.notes
        }
      }

      await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'email',
          recipients: [appointmentData.clientEmail],
          ...emailTemplate
        })
      })
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Indian Consular Services Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchApplications()}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-5 w-5" />
              </button>

              <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'applications', label: 'Applications', icon: FileText },
              { key: 'services', label: 'Services', icon: Settings },
              { key: 'users', label: 'Users', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'blue' },
                { label: 'Pending Review', value: stats.pendingApplications, icon: Clock, color: 'yellow' },
                { label: 'In Progress', value: stats.inProgressApplications, icon: AlertCircle, color: 'blue' },
                { label: 'Ready for Collection', value: stats.readyForCollection, icon: CheckCircle, color: 'green' },
                { label: 'Completed', value: stats.completedApplications, icon: CheckCircle, color: 'green' },
                { label: 'Rejected', value: stats.rejectedApplications, icon: XCircle, color: 'red' },
                { label: 'Today\'s Submissions', value: stats.todaySubmissions, icon: Calendar, color: 'purple' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Applications */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.applicationId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {app.applicationId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {app.applicantInfo.firstName} {app.applicantInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{app.applicantInfo.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">{app.status.replace('-', ' ').toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(app.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready-for-collection">Ready for Collection</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={exportApplications}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>

                <button
                  onClick={createFullBackup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Full Backup
                </button>

                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manual Booking
                </button>

                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Bulk Slots
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Application Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.applicationId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{app.applicationId}</div>
                          <div className="text-sm text-gray-500">{app.documents?.length || 0} documents</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {app.applicantInfo.firstName} {app.applicantInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{app.applicantInfo.email}</div>
                          <div className="text-sm text-gray-500">{app.applicantInfo.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {app.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1">{app.status.replace('-', ' ').toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Submitted: {formatDate(app.submittedAt)}</div>
                          <div>Updated: {formatDate(app.lastUpdated)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplication(app)
                                setShowStatusModal(true)
                                setNewStatus(app.status)
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
              <button
                onClick={() => setEditingService({
                  serviceId: '',
                  category: '',
                  title: '',
                  description: '',
                  processingTime: '',
                  fees: [],
                  requiredDocuments: [],
                  eligibilityRequirements: [],
                  isActive: true
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.serviceId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-500">{service.category}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingService(service)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{service.processingTime}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{service.fees && service.fees.length > 0 ? `${service.fees[0].currency} ${service.fees[0].amount}` : 'No fees'}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{service.requiredDocuments ? service.requiredDocuments.length : 0} documents required</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Application Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                <p className="text-sm text-gray-900">{selectedApplication.applicationId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready-for-collection">Ready for Collection</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes for the applicant..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateApplicationStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Update & Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Appointment Booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manual Appointment Booking</h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                createManualAppointment()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAppointment.clientName}
                  onChange={e => setNewAppointment(a => ({ ...a, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newAppointment.clientEmail}
                  onChange={e => setNewAppointment(a => ({ ...a, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newAppointment.clientPhone}
                  onChange={e => setNewAppointment(a => ({ ...a, clientPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppointment.serviceType}
                  onChange={e => setNewAppointment(a => ({ ...a, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Service</option>
                  {services.map(service => (
                    <option key={service.serviceId} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAppointment.appointmentDate}
                    onChange={e => setNewAppointment(a => ({ ...a, appointmentDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newAppointment.appointmentTime}
                    onChange={e => setNewAppointment(a => ({ ...a, appointmentTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newAppointment.notes}
                  onChange={e => setNewAppointment(a => ({ ...a, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional notes for this appointment"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newAppointment.priority}
                  onChange={e => setNewAppointment(a => ({ ...a, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                  disabled={loading}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Appointment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Bulk Appointment Slot Creation</h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                generateBulkSlots()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={bulkAppointments.date}
                  onChange={e => setBulkAppointments(a => ({ ...a, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={bulkAppointments.serviceType}
                  onChange={e => setBulkAppointments(a => ({ ...a, serviceType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select Service</option>
                  {services.map(service => (
                    <option key={service.serviceId} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bulkAppointments.startTime}
                    onChange={e => setBulkAppointments(a => ({ ...a, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bulkAppointments.endTime}
                    onChange={e => setBulkAppointments(a => ({ ...a, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={bulkAppointments.slotDuration}
                    onChange={e => setBulkAppointments(a => ({ ...a, slotDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Slots
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkAppointments.maxSlots}
                    onChange={e => setBulkAppointments(a => ({ ...a, maxSlots: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                  disabled={loading}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Slots
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedAdminPanel
