'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Image,
  Calendar,
  Bell,
  FileText,
  Settings,
  Upload,
  Download,
  Search,
  Filter,
  Clock,
  Globe,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  Camera,
  Link,
  Type,
  Layout,
  Palette,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle?: string
  description: string
  imageUrl: string
  buttonText?: string
  buttonUrl?: string
  priority: number
  isActive: boolean
  startDate: string
  endDate?: string
  targetPages: string[]
  createdAt: string
  updatedAt: string
}

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate?: string
  location?: string
  isPublic: boolean
  isActive: boolean
  imageUrl?: string
  registrationRequired: boolean
  maxAttendees?: number
  currentAttendees: number
  createdAt: string
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'urgent' | 'maintenance'
  isActive: boolean
  startDate: string
  endDate?: string
  targetAudience: string[]
  showOnPages: string[]
  createdAt: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('banners')
  const [banners, setBanners] = useState<Banner[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [modalType, setModalType] = useState<'banner' | 'event' | 'announcement' | 'faq'>('banner')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const contentTabs = [
    { id: 'banners', label: 'Banners', icon: Image, count: banners.length },
    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
    { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length },
    { id: 'faqs', label: 'FAQs', icon: FileText, count: faqs.length }
  ]

  const eventTypes = [
    'Consular Service Update',
    'Holiday Closure',
    'System Maintenance',
    'New Service Launch',
    'Community Event',
    'Workshop/Seminar',
    'Emergency Notice'
  ]

  const faqCategories = [
    'Passport Services',
    'Visa Applications',
    'OCI Services',
    'Document Attestation',
    'Emergency Services',
    'Appointment Booking',
    'Payment & Fees',
    'General Information'
  ]

  const targetPages = [
    'Homepage',
    'Services',
    'Apply',
    'Appointment',
    'Track Application',
    'About',
    'Contact'
  ]

  const targetAudiences = [
    'All Users',
    'Registered Users',
    'New Applicants',
    'Existing Applicants',
    'Emergency Cases'
  ]

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/content/${activeTab}`)
      const data = await response.json()

      if (data.success) {
        switch (activeTab) {
          case 'banners':
            setBanners(data.items)
            break
          case 'events':
            setEvents(data.items)
            break
          case 'announcements':
            setAnnouncements(data.items)
            break
          case 'faqs':
            setFAQs(data.items)
            break
        }
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type)
    setEditingItem(item || getDefaultItem(type))
    setShowModal(true)
  }

  const getDefaultItem = (type: typeof modalType) => {
    switch (type) {
      case 'banner':
        return {
          title: '',
          subtitle: '',
          description: '',
          imageUrl: '',
          buttonText: '',
          buttonUrl: '',
          priority: 1,
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          targetPages: ['Homepage']
        }
      case 'event':
        return {
          title: '',
          description: '',
          eventType: eventTypes[0],
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          location: '',
          isPublic: true,
          isActive: true,
          imageUrl: '',
          registrationRequired: false,
          maxAttendees: undefined
        }
      case 'announcement':
        return {
          title: '',
          content: '',
          type: 'info',
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          targetAudience: ['All Users'],
          showOnPages: ['Homepage']
        }
      case 'faq':
        return {
          question: '',
          answer: '',
          category: faqCategories[0],
          order: 1,
          isActive: true,
          tags: []
        }
    }
  }

  const saveItem = async () => {
    try {
      const isNew = !editingItem.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(`/api/admin/content/${modalType}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      })

      const data = await response.json()
      if (data.success) {
        fetchContent()
        setShowModal(false)
        setEditingItem(null)
        alert(`${modalType} ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save item:', error)
      alert('Failed to save item')
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/admin/content/${activeTab}/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchContent()
        alert('Item deleted successfully!')
      } else {
        alert('Failed to delete: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
    }
  }

  const toggleItemStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/${activeTab}/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      const data = await response.json()
      if (data.success) {
        fetchContent()
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/admin/content/upload-image', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        return data.imageUrl
      } else {
        alert('Failed to upload image: ' + data.error)
        return null
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image')
      return null
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const imageUrl = await uploadImage(file)
    if (imageUrl) {
      setEditingItem(prev => ({ ...prev, imageUrl }))
    }
  }

  const exportContent = async () => {
    try {
      const response = await fetch(`/api/admin/content/export?type=${activeTab}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const getFilteredItems = () => {
    let items: any[] = []

    switch (activeTab) {
      case 'banners':
        items = banners
        break
      case 'events':
        items = events
        break
      case 'announcements':
        items = announcements
        break
      case 'faqs':
        items = faqs
        break
    }

    // Apply search filter
    if (searchTerm) {
      items = items.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.question?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      items = items.filter(item => item.isActive === isActive)
    }

    return items
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPreviewIcon = () => {
    switch (previewMode) {
      case 'desktop': return <Monitor className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'mobile': return <Smartphone className="h-4 w-4" />
    }
  }

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'blue'
      case 'warning': return 'yellow'
      case 'urgent': return 'red'
      case 'maintenance': return 'gray'
      default: return 'blue'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage banners, events, announcements, and FAQs</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportContent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={() => openModal(activeTab as typeof modalType)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {contentTabs.map((tab) => {
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
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Preview Mode Selector */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            {['desktop', 'tablet', 'mobile'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode as typeof previewMode)}
                className={`px-3 py-2 text-sm flex items-center ${
                  previewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'desktop' && <Monitor className="h-4 w-4" />}
                {mode === 'tablet' && <Tablet className="h-4 w-4" />}
                {mode === 'mobile' && <Smartphone className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading {activeTab}...</p>
          </div>
        ) : getFilteredItems().length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'banners' && <Image className="h-12 w-12 mx-auto" />}
              {activeTab === 'events' && <Calendar className="h-12 w-12 mx-auto" />}
              {activeTab === 'announcements' && <Bell className="h-12 w-12 mx-auto" />}
              {activeTab === 'faqs' && <FileText className="h-12 w-12 mx-auto" />}
            </div>
            <p className="text-gray-500">No {activeTab} found</p>
            <button
              onClick={() => openModal(activeTab as typeof modalType)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First {activeTab.slice(0, -1)}
            </button>
          </div>
        ) : (
          getFilteredItems().map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Item Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description || item.content || item.question}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleItemStatus(item.id, item.isActive)}
                      className={`p-1 rounded ${
                        item.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={item.isActive ? 'Active' : 'Inactive'}
                    >
                      {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => openModal(activeTab as typeof modalType, item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Item Content */}
              <div className="p-4">
                {/* Banner Preview */}
                {activeTab === 'banners' && (
                  <div className="space-y-3">
                    {item.imageUrl && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {item.subtitle && (
                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.targetPages?.map((page: string) => (
                          <span key={page} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Priority: {item.priority}</span>
                        <span>{formatDate(item.startDate)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Preview */}
                {activeTab === 'events' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(item.startDate)}</span>
                      {item.endDate && (
                        <>
                          <span>-</span>
                          <span>{formatDate(item.endDate)}</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {item.eventType}
                      </span>

                      {item.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-3 w-3 mr-1" />
                          {item.location}
                        </div>
                      )}

                      {item.registrationRequired && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-3 w-3 mr-1" />
                          {item.currentAttendees}/{item.maxAttendees || '∞'} attendees
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Announcement Preview */}
                {activeTab === 'announcements' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 bg-${getAnnouncementTypeColor(item.type)}-100 text-${getAnnouncementTypeColor(item.type)}-800 text-xs rounded flex items-center`}>
                        {item.type === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {item.type === 'info' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.startDate)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {item.targetAudience?.map((audience: string) => (
                          <span key={audience} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {audience}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {item.showOnPages?.map((page: string) => (
                          <span key={page} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ Preview */}
                {activeTab === 'faqs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Order: {item.order}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Q: {item.question}</p>
                      <p className="mt-1 line-clamp-3">A: {item.answer}</p>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating/Editing Items */}
      {showModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editingItem.id ? 'Edit' : 'Create'} {modalType.slice(0, -1)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter title"
                />
              </div>

              {/* Banner-specific fields */}
              {modalType === 'banner' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={editingItem.subtitle || ''}
                      onChange={(e) => setEditingItem({...editingItem, subtitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {editingItem.imageUrl && (
                        <img src={editingItem.imageUrl} alt="Preview" className="h-16 w-16 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={editingItem.buttonText || ''}
                        onChange={(e) => setEditingItem({...editingItem, buttonText: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={editingItem.buttonUrl || ''}
                        onChange={(e) => setEditingItem({...editingItem, buttonUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Pages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {targetPages.map(page => (
                        <label key={page} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingItem.targetPages?.includes(page) || false}
                            onChange={(e) => {
                              const pages = editingItem.targetPages || []
                              if (e.target.checked) {
                                setEditingItem({...editingItem, targetPages: [...pages, page]})
                              } else {
                                setEditingItem({...editingItem, targetPages: pages.filter(p => p !== page)})
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm">{page}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingItem.priority || 1}
                      onChange={(e) => setEditingItem({...editingItem, priority: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Event-specific fields */}
              {modalType === 'event' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={editingItem.eventType || ''}
                      onChange={(e) => setEditingItem({...editingItem, eventType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={editingItem.startDate || ''}
                        onChange={(e) => setEditingItem({...editingItem, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={editingItem.endDate || ''}
                        onChange={(e) => setEditingItem({...editingItem, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editingItem.location || ''}
                      onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Physical or virtual location"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem.isPublic || false}
                        onChange={(e) => setEditingItem({...editingItem, isPublic: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm">Public Event</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem.registrationRequired || false}
                        onChange={(e) => setEditingItem({...editingItem, registrationRequired: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm">Registration Required</span>
                    </label>
                  </div>

                  {editingItem.registrationRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Attendees
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editingItem.maxAttendees || ''}
                        onChange={(e) => setEditingItem({...editingItem, maxAttendees: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Announcement-specific fields */}
              {modalType === 'announcement' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={editingItem.content || ''}
                      onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={editingItem.type || 'info'}
                      onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="info">Information</option>
                      <option value="warning">Warning</option>
                      <option value="urgent">Urgent</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {targetAudiences.map(audience => (
                        <label key={audience} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingItem.targetAudience?.includes(audience) || false}
                            onChange={(e) => {
                              const audiences = editingItem.targetAudience || []
                              if (e.target.checked) {
                                setEditingItem({...editingItem, targetAudience: [...audiences, audience]})
                              } else {
                                setEditingItem({...editingItem, targetAudience: audiences.filter(a => a !== audience)})
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm">{audience}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Show on Pages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {targetPages.map(page => (
                        <label key={page} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingItem.showOnPages?.includes(page) || false}
                            onChange={(e) => {
                              const pages = editingItem.showOnPages || []
                              if (e.target.checked) {
                                setEditingItem({...editingItem, showOnPages: [...pages, page]})
                              } else {
                                setEditingItem({...editingItem, showOnPages: pages.filter(p => p !== page)})
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm">{page}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* FAQ-specific fields */}
              {modalType === 'faq' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question *
                    </label>
                    <textarea
                      value={editingItem.question || ''}
                      onChange={(e) => setEditingItem({...editingItem, question: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer *
                    </label>
                    <textarea
                      value={editingItem.answer || ''}
                      onChange={(e) => setEditingItem({...editingItem, answer: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editingItem.category || ''}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {faqCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editingItem.order || 1}
                        onChange={(e) => setEditingItem({...editingItem, order: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editingItem.tags?.join(', ') || ''}
                      onChange={(e) => setEditingItem({...editingItem, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="passport, visa, urgent, etc."
                    />
                  </div>
                </>
              )}

              {/* Common Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={editingItem.startDate || ''}
                    onChange={(e) => setEditingItem({...editingItem, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {modalType !== 'faq' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingItem.endDate || ''}
                      onChange={(e) => setEditingItem({...editingItem, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingItem.isActive || false}
                    onChange={(e) => setEditingItem({...editingItem, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingItem.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManagement
