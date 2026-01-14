'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Paperclip,
  MessageSquare,
  History,
  X,
  Save,
  RefreshCw,
  Settings
} from 'lucide-react'

interface Application {
  applicationId: string
  applicantInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    nationality: string
    address: string
    preferredNotification: string
  }
  serviceType: string
  status: string
  priority: string
  submittedAt: string
  lastUpdated: string
  expectedCompletionDate?: string
  processingNotes?: string
  assignedOfficer?: string
  documents: Array<{
    filename: string
    originalName: string
    size: number
    uploadedAt: string
  }>
  timeline: Array<{
    status: string
    timestamp: string
    notes: string
    updatedBy: string
  }>
  fees: {
    amount: number
    currency: string
    paid: boolean
    paymentId?: string
  }
}

const ApplicationManagement = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [assignedOfficerFilter, setAssignedOfficerFilter] = useState('all')

  // Status update form
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [expectedCompletion, setExpectedCompletion] = useState('')
  const [assignedOfficer, setAssignedOfficer] = useState('')

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const statusOptions = [
    { value: 'submitted', label: 'Submitted', color: 'yellow' },
    { value: 'in-review', label: 'In Review', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'indigo' },
    { value: 'ready-for-collection', label: 'Ready for Collection', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'on-hold', label: 'On Hold', color: 'orange' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'normal', label: 'Normal', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ]

  const officers = [
    'Officer A. Sharma',
    'Officer B. Patel',
    'Officer C. Kumar',
    'Officer D. Singh'
  ]

  useEffect(() => {
    fetchApplications()
  }, [pagination.page, statusFilter, serviceFilter, priorityFilter, dateFilter, assignedOfficerFilter])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(serviceFilter !== 'all' && { serviceType: serviceFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(assignedOfficerFilter !== 'all' && { assignedOfficer: assignedOfficerFilter }),
        ...(dateFilter !== 'all' && { dateFilter })
      })

      const response = await fetch(`/api/admin/applications?${params}`)
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    if (!searchTerm) {
      setFilteredApplications(applications)
      return
    }

    const filtered = applications.filter(app =>
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.applicantInfo.firstName} ${app.applicantInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return

    try {
      const response = await fetch('/api/admin/applications/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApplication.applicationId,
          status: newStatus,
          notes: statusNotes,
          expectedCompletionDate: expectedCompletion,
          assignedOfficer
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchApplications()
        setShowStatusModal(false)
        resetStatusForm()
        alert('Application status updated successfully! Notification sent to applicant.')
      } else {
        alert('Failed to update application: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update application:', error)
      alert('Failed to update application')
    }
  }

  const bulkUpdateStatus = async (status: string) => {
    if (selectedApplications.length === 0) {
      alert('Please select applications to update')
      return
    }

    if (!confirm(`Update ${selectedApplications.length} applications to ${status}?`)) return

    try {
      const response = await fetch('/api/admin/applications/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          status,
          notes: `Bulk update to ${status}`
        })
      })

      const data = await response.json()
      if (data.success) {
        fetchApplications()
        setSelectedApplications([])
        alert(`${selectedApplications.length} applications updated successfully!`)
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
      alert('Bulk update failed')
    }
  }

  const exportApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: { statusFilter, serviceFilter, priorityFilter, dateFilter },
          selectedIds: selectedApplications
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `applications-${new Date().toISOString().split('T')[0]}.xlsx`
        link.click()
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const resetStatusForm = () => {
    setNewStatus('')
    setStatusNotes('')
    setExpectedCompletion('')
    setAssignedOfficer('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />
      case 'in-review': case 'in-progress': return <AlertCircle className="h-4 w-4" />
      case 'ready-for-collection': case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? statusOption.color : 'gray'
  }

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority)
    return priorityOption ? priorityOption.color : 'gray'
  }

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app.applicationId))
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

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Application Management</h2>
          <p className="text-gray-600">
            Manage and track all consular service applications
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedApplications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedApplications.length} selected
              </span>
              <select
                onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
                defaultValue=""
              >
                <option value="">Bulk Actions</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Set to {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={exportApplications}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={fetchApplications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Officer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
            <select
              value={assignedOfficerFilter}
              onChange={(e) => setAssignedOfficerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Officers</option>
              {officers.map(officer => (
                <option key={officer} value={officer}>{officer}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedApplications.length === filteredApplications.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Progress
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Loading applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(app.applicationId)}
                        onChange={() => toggleApplicationSelection(app.applicationId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-blue-600">{app.applicationId}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {app.documents?.length || 0} documents
                        </div>
                        {app.assignedOfficer && (
                          <div className="text-xs text-gray-400 mt-1">
                            Assigned: {app.assignedOfficer}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {app.applicantInfo.firstName} {app.applicantInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{app.applicantInfo.email}</div>
                        <div className="text-sm text-gray-500">{app.applicantInfo.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {app.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {app.priority && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(app.priority)}-100 text-${getPriorityColor(app.priority)}-800 mt-1`}>
                            {app.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(app.status)}-100 text-${getStatusColor(app.status)}-800`}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status.replace('-', ' ').toUpperCase()}</span>
                        </span>
                        {app.expectedCompletionDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expected: {formatDate(app.expectedCompletionDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>Submitted: {formatDate(app.submittedAt)}</div>
                        <div className="text-gray-500">Updated: {formatDate(app.lastUpdated)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(app)
                            setShowDetailModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(app)
                            setNewStatus(app.status)
                            setAssignedOfficer(app.assignedOfficer || '')
                            setShowStatusModal(true)
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Update Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Application Details - {selectedApplication.applicationId}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Applicant Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedApplication.applicantInfo.firstName} {selectedApplication.applicantInfo.lastName}</div>
                    <div><span className="font-medium">Email:</span> {selectedApplication.applicantInfo.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedApplication.applicantInfo.phone}</div>
                    <div><span className="font-medium">Date of Birth:</span> {selectedApplication.applicantInfo.dateOfBirth}</div>
                    <div><span className="font-medium">Nationality:</span> {selectedApplication.applicantInfo.nationality}</div>
                    <div><span className="font-medium">Address:</span> {selectedApplication.applicantInfo.address}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Application Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><span className="font-medium">Service:</span> {selectedApplication.serviceType}</div>
                    <div><span className="font-medium">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(selectedApplication.status)}-100 text-${getStatusColor(selectedApplication.status)}-800`}>
                        {selectedApplication.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div><span className="font-medium">Priority:</span>
                      {selectedApplication.priority && (
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(selectedApplication.priority)}-100 text-${getPriorityColor(selectedApplication.priority)}-800`}>
                          {selectedApplication.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div><span className="font-medium">Submitted:</span> {formatDate(selectedApplication.submittedAt)}</div>
                    <div><span className="font-medium">Last Updated:</span> {formatDate(selectedApplication.lastUpdated)}</div>
                    {selectedApplication.expectedCompletionDate && (
                      <div><span className="font-medium">Expected Completion:</span> {formatDate(selectedApplication.expectedCompletionDate)}</div>
                    )}
                    {selectedApplication.assignedOfficer && (
                      <div><span className="font-medium">Assigned Officer:</span> {selectedApplication.assignedOfficer}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <Paperclip className="h-5 w-5 mr-2" />
                  Documents ({selectedApplication.documents?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedApplication.documents?.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-sm">{doc.originalName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-xs mt-2">
                        Download
                      </button>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-sm">No documents uploaded</div>
                  )}
                </div>
              </div>

              {/* Processing Timeline */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                  <History className="h-5 w-5 mr-2" />
                  Processing Timeline
                </h4>
                <div className="space-y-3">
                  {selectedApplication.timeline?.map((entry, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${getStatusColor(entry.status)}-500 mt-1.5`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{entry.status.replace('-', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-600">{entry.notes}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(entry.timestamp)} by {entry.updatedBy}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-sm">No timeline entries</div>
                  )}
                </div>
              </div>

              {/* Processing Notes */}
              {selectedApplication.processingNotes && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Processing Notes
                  </h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    {selectedApplication.processingNotes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-6 border-b">
              <h3 className="text-lg font-medium">Update Application Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application ID
                </label>
                <p className="text-sm text-gray-900">{selectedApplication.applicationId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Officer
                </label>
                <select
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Officer</option>
                  {officers.map(officer => (
                    <option key={officer} value={officer}>{officer}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={expectedCompletion}
                  onChange={(e) => setExpectedCompletion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes for the applicant..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
    </div>
  )
}

export default ApplicationManagement
