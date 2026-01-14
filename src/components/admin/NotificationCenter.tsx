'use client'

import React, { useState, useEffect } from 'react'
import {
  Send,
  Users,
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Target,
  Calendar,
  BarChart3,
  Zap,
  RefreshCw,
  History,
  Template,
  Settings,
  Eye,
  Play,
  Pause
} from 'lucide-react'

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'sms' | 'whatsapp' | 'push'
  category: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  usageCount: number
}

interface NotificationCampaign {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'sms' | 'whatsapp' | 'push'
  targetAudience: string[]
  recipientCount: number
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  scheduledAt?: string
  sentAt?: string
  deliveredCount: number
  failedCount: number
  openRate?: number
  clickRate?: number
  createdBy: string
  createdAt: string
}

interface NotificationHistory {
  id: string
  campaignId?: string
  recipient: string
  type: 'email' | 'sms' | 'whatsapp' | 'push'
  subject: string
  content: string
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'
  sentAt: string
  deliveredAt?: string
  failedReason?: string
}

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('compose')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(false)

  // Compose notification state
  const [notificationData, setNotificationData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'whatsapp' | 'push',
    subject: '',
    content: '',
    targetAudience: [] as string[],
    scheduledAt: '',
    templateId: ''
  })

  // Template editor state
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const notificationTabs = [
    { id: 'compose', label: 'Compose', icon: Send, description: 'Send new notifications' },
    { id: 'campaigns', label: 'Campaigns', icon: Target, description: 'Manage campaigns' },
    { id: 'templates', label: 'Templates', icon: Template, description: 'Notification templates' },
    { id: 'history', label: 'History', icon: History, description: 'Notification history' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance metrics' }
  ]

  const targetAudiences = [
    { id: 'all-users', label: 'All Users', count: 1250 },
    { id: 'active-applicants', label: 'Active Applicants', count: 350 },
    { id: 'pending-applicants', label: 'Pending Applicants', count: 120 },
    { id: 'completed-applications', label: 'Completed Applications', count: 800 },
    { id: 'passport-applicants', label: 'Passport Applicants', count: 450 },
    { id: 'visa-applicants', label: 'Visa Applicants', count: 280 },
    { id: 'oci-applicants', label: 'OCI Applicants', count: 150 },
    { id: 'emergency-contacts', label: 'Emergency Contacts', count: 50 },
    { id: 'vip-users', label: 'VIP Users', count: 25 }
  ]

  const templateCategories = [
    'Application Status Updates',
    'Service Announcements',
    'Appointment Reminders',
    'Document Requirements',
    'Emergency Notifications',
    'Marketing & Events',
    'System Maintenance',
    'Welcome Messages'
  ]

  const notificationTypes = [
    { id: 'email', label: 'Email', icon: Mail, color: 'blue' },
    { id: 'sms', label: 'SMS', icon: Phone, color: 'green' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
    { id: 'push', label: 'Push', icon: Bell, color: 'purple' }
  ]

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'templates':
          await fetchTemplates()
          break
        case 'campaigns':
          await fetchCampaigns()
          break
        case 'history':
          await fetchHistory()
          break
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    const response = await fetch('/api/admin/notifications/templates')
    const data = await response.json()
    if (data.success) {
      setTemplates(data.templates)
    }
  }

  const fetchCampaigns = async () => {
    const response = await fetch('/api/admin/notifications/campaigns')
    const data = await response.json()
    if (data.success) {
      setCampaigns(data.campaigns)
    }
  }

  const fetchHistory = async () => {
    const response = await fetch('/api/admin/notifications/history')
    const data = await response.json()
    if (data.success) {
      setHistory(data.history)
    }
  }

  const sendNotification = async () => {
    if (!notificationData.content || notificationData.targetAudience.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      })

      const data = await response.json()
      if (data.success) {
        alert(`Notification ${notificationData.scheduledAt ? 'scheduled' : 'sent'} successfully!`)
        resetNotificationForm()
        if (notificationData.scheduledAt) {
          fetchCampaigns()
        } else {
          fetchHistory()
        }
      } else {
        alert('Failed to send notification: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
      alert('Failed to send notification')
    } finally {
      setLoading(false)
    }
  }

  const resetNotificationForm = () => {
    setNotificationData({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      targetAudience: [],
      scheduledAt: '',
      templateId: ''
    })
  }

  const loadTemplate = (template: NotificationTemplate) => {
    setNotificationData({
      ...notificationData,
      subject: template.subject,
      content: template.content,
      type: template.type,
      templateId: template.id
    })
  }

  const saveTemplate = async () => {
    if (!editingTemplate) return

    try {
      const isNew = !editingTemplate.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/notifications/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      })

      const data = await response.json()
      if (data.success) {
        fetchTemplates()
        setShowTemplateModal(false)
        setEditingTemplate(null)
        alert(`Template ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save template: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/notifications/templates/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchTemplates()
        alert('Template deleted successfully!')
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      alert('Failed to delete template')
    }
  }

  const duplicateTemplate = (template: NotificationTemplate) => {
    setEditingTemplate({
      ...template,
      id: '',
      name: template.name + ' (Copy)',
      createdAt: '',
      updatedAt: '',
      usageCount: 0
    })
    setShowTemplateModal(true)
  }

  const pauseCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/campaigns/${id}/pause`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchCampaigns()
        alert('Campaign paused successfully!')
      }
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    }
  }

  const resumeCampaign = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/campaigns/${id}/resume`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchCampaigns()
        alert('Campaign resumed successfully!')
      }
    } catch (error) {
      console.error('Failed to resume campaign:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'sending':
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'green'
      case 'failed':
        return 'red'
      case 'sending':
      case 'scheduled':
        return 'yellow'
      case 'draft':
        return 'gray'
      default:
        return 'gray'
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

  const getTotalRecipients = () => {
    return notificationData.targetAudience.reduce((total, audienceId) => {
      const audience = targetAudiences.find(a => a.id === audienceId)
      return total + (audience?.count || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600">
            Send notifications, manage templates, and track performance
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {notificationTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compose Notification</h3>

              <div className="space-y-4">
                {/* Campaign Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={notificationData.name}
                    onChange={(e) => setNotificationData({...notificationData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter campaign name"
                  />
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {notificationTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = notificationData.type === type.id

                      return (
                        <button
                          key={type.id}
                          onClick={() => setNotificationData({...notificationData, type: type.id as any})}
                          className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-all ${
                            isSelected
                              ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Subject (for email) */}
                {notificationData.type === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={notificationData.subject}
                      onChange={(e) => setNotificationData({...notificationData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email subject"
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content *
                  </label>
                  <textarea
                    value={notificationData.content}
                    onChange={(e) => setNotificationData({...notificationData, content: e.target.value})}
                    rows={notificationData.type === 'sms' ? 3 : 6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${notificationData.type} content...`}
                    maxLength={notificationData.type === 'sms' ? 160 : undefined}
                  />
                  {notificationData.type === 'sms' && (
                    <div className="text-sm text-gray-500 mt-1">
                      {notificationData.content.length}/160 characters
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {targetAudiences.map((audience) => (
                      <label key={audience.id} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={notificationData.targetAudience.includes(audience.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNotificationData({
                                ...notificationData,
                                targetAudience: [...notificationData.targetAudience, audience.id]
                              })
                            } else {
                              setNotificationData({
                                ...notificationData,
                                targetAudience: notificationData.targetAudience.filter(id => id !== audience.id)
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{audience.label}</div>
                          <div className="text-xs text-gray-500">{audience.count} recipients</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={notificationData.scheduledAt}
                    onChange={(e) => setNotificationData({...notificationData, scheduledAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Leave empty to send immediately
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-600">
                    Total Recipients: <span className="font-medium">{getTotalRecipients()}</span>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={resetNotificationForm}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={sendNotification}
                      disabled={loading || !notificationData.content || notificationData.targetAudience.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {notificationData.scheduledAt ? 'Schedule' : 'Send Now'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Templates</h3>
                <button
                  onClick={() => {
                    setEditingTemplate({
                      id: '',
                      name: '',
                      subject: '',
                      content: '',
                      type: notificationData.type,
                      category: templateCategories[0],
                      variables: [],
                      isActive: true,
                      createdAt: '',
                      updatedAt: '',
                      usageCount: 0
                    })
                    setShowTemplateModal(true)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates
                  .filter(template => template.type === notificationData.type && template.isActive)
                  .slice(0, 10)
                  .map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="font-medium text-sm text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{template.content}</div>
                      <div className="text-xs text-gray-400 mt-1">Used {template.usageCount} times</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {notificationData.type === 'email' && notificationData.subject && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Subject:</span>
                    <div className="font-medium text-sm">{notificationData.subject}</div>
                  </div>
                )}

                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {notificationData.content || 'Start typing to see preview...'}
                </div>
              </div>

              {getTotalRecipients() > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    This will be sent to <span className="font-medium">{getTotalRecipients()}</span> recipients
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 text-sm"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingTemplate({
                  id: '',
                  name: '',
                  subject: '',
                  content: '',
                  type: 'email',
                  category: templateCategories[0],
                  variables: [],
                  isActive: true,
                  createdAt: '',
                  updatedAt: '',
                  usageCount: 0
                })
                setShowTemplateModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates
              .filter(template => {
                const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    template.content.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesType = typeFilter === 'all' || template.type === typeFilter
                return matchesSearch && matchesType
              })
              .map((template) => {
                const typeInfo = notificationTypes.find(t => t.id === template.type)
                const TypeIcon = typeInfo?.icon || Mail

                return (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${typeInfo?.color}-100`}>
                          <TypeIcon className={`h-4 w-4 text-${typeInfo?.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-xs text-gray-500">{template.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(template)
                            setShowTemplateModal(true)
                          }}
                          className="text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => duplicateTemplate(template)}
                          className="text-gray-400 hover:text-green-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {template.subject && (
                        <div>
                          <div className="text-xs text-gray-500">Subject:</div>
                          <div className="text-sm font-medium text-gray-900">{template.subject}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-xs text-gray-500">Content:</div>
                        <div className="text-sm text-gray-700 line-clamp-3">{template.content}</div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Used {template.usageCount} times
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          template.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Recipients
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
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
                  {campaigns
                    .filter(campaign => {
                      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
                      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
                      const matchesType = typeFilter === 'all' || campaign.type === typeFilter
                      return matchesSearch && matchesStatus && matchesType
                    })
                    .map((campaign) => {
                      const typeInfo = notificationTypes.find(t => t.id === campaign.type)
                      const TypeIcon = typeInfo?.icon || Mail
                      const deliveryRate = campaign.recipientCount > 0
                        ? ((campaign.deliveredCount / campaign.recipientCount) * 100).toFixed(1)
                        : '0'

                      return (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                              <div className="text-sm text-gray-500">{campaign.subject}</div>
                              <div className="text-xs text-gray-400 mt-1">by {campaign.createdBy}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className={`p-1 rounded bg-${typeInfo?.color}-100`}>
                                <TypeIcon className={`h-3 w-3 text-${typeInfo?.color}-600`} />
                              </div>
                              <div>
                                <div className="text-sm text-gray-900">{typeInfo?.label}</div>
                                <div className="text-xs text-gray-500">{campaign.recipientCount} recipients</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(campaign.status)}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(campaign.status)}-100 text-${getStatusColor(campaign.status)}-800`}>
                                {campaign.status.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div>Delivered: {campaign.deliveredCount} ({deliveryRate}%)</div>
                              <div className="text-gray-500">Failed: {campaign.failedCount}</div>
                              {campaign.openRate && (
                                <div className="text-gray-500">Open Rate: {campaign.openRate}%</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div>Created: {formatDate(campaign.createdAt)}</div>
                              {campaign.scheduledAt && (
                                <div className="text-gray-500">Scheduled: {formatDate(campaign.scheduledAt)}</div>
                              )}
                              {campaign.sentAt && (
                                <div className="text-gray-500">Sent: {formatDate(campaign.sentAt)}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {campaign.status === 'scheduled' && (
                                <button
                                  onClick={() => pauseCampaign(campaign.id)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Pause Campaign"
                                >
                                  <Pause className="h-4 w-4" />
                                </button>
                              )}
                              {campaign.status === 'paused' && (
                                <button
                                  onClick={() => resumeCampaign(campaign.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Resume Campaign"
                                >
                                  <Play className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editingTemplate.id ? 'Edit Template' : 'Create Template'}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate({...editingTemplate, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {notificationTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {templateCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingTemplate.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingTemplate.isActive}
                    onChange={(e) => setEditingTemplate({...editingTemplate, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Active Template</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate.id ? 'Update' : 'Create'} Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
