'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  MapPin,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlarmClock,
  UserX,
  Coffee,
  Zap,
  Ban,
  Globe
} from 'lucide-react'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  capacity: number
  bookedCount: number
  isActive: boolean
  category: string
  officer?: string
  notes?: string
}

interface DaySchedule {
  date: string
  dayOfWeek: number
  isHoliday: boolean
  holidayName?: string
  isOpen: boolean
  openTime: string
  closeTime: string
  lunchBreak?: {
    startTime: string
    endTime: string
  }
  timeSlots: TimeSlot[]
  totalCapacity: number
  totalBooked: number
  notes?: string
}

interface ServiceCategory {
  id: string
  name: string
  duration: number // in minutes
  maxDaily: number
  color: string
  isActive: boolean
  requiredOfficers: number
  priority: number
}

interface Holiday {
  id: string
  name: string
  date: string
  type: 'public' | 'consulate' | 'maintenance'
  isRecurring: boolean
  description?: string
  affectedServices: string[]
  createdAt: string
}

interface VisitorStats {
  date: string
  totalVisitors: number
  appointmentVisitors: number
  walkInVisitors: number
  peakHour: string
  averageWaitTime: number
}

const CalendarManagement = () => {
  const [activeTab, setActiveTab] = useState('schedule')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [visitorStats, setVisitorStats] = useState<VisitorStats[]>([])
  const [loading, setLoading] = useState(false)

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule | null>(null)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)

  // Settings
  const [globalSettings, setGlobalSettings] = useState({
    defaultOpenTime: '09:00',
    defaultCloseTime: '16:30',
    defaultLunchStart: '12:30',
    defaultLunchEnd: '13:30',
    slotDuration: 30, // minutes
    bufferTime: 5, // minutes between slots
    maxAdvanceBooking: 30, // days
    allowWalkIns: true,
    autoResetTime: '00:00', // daily reset time
    weekendOperation: false,
    emergencySlots: 2 // reserved emergency slots per day
  })

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Manage daily schedules' },
    { id: 'categories', label: 'Categories', icon: Settings, description: 'Service categories' },
    { id: 'holidays', label: 'Holidays', icon: CalendarDays, description: 'Holiday calendar' },
    { id: 'stats', label: 'Statistics', icon: Users, description: 'Visitor analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration' }
  ]

  const officers = [
    'Officer A. Sharma',
    'Officer B. Patel',
    'Officer C. Kumar',
    'Officer D. Singh',
    'Officer E. Gupta'
  ]

  const defaultCategories = [
    { id: 'passport', name: 'Passport Services', duration: 45, maxDaily: 50, color: 'blue', priority: 1 },
    { id: 'visa', name: 'Visa Services', duration: 30, maxDaily: 40, color: 'green', priority: 2 },
    { id: 'oci', name: 'OCI Services', duration: 60, maxDaily: 20, color: 'purple', priority: 3 },
    { id: 'attestation', name: 'Document Attestation', duration: 20, maxDaily: 60, color: 'orange', priority: 4 },
    { id: 'emergency', name: 'Emergency Services', duration: 15, maxDaily: 10, color: 'red', priority: 0 },
    { id: 'consular', name: 'General Consular', duration: 30, maxDaily: 30, color: 'indigo', priority: 5 }
  ]

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate, activeTab])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'schedule':
          await fetchSchedule()
          break
        case 'categories':
          await fetchCategories()
          break
        case 'holidays':
          await fetchHolidays()
          break
        case 'stats':
          await fetchVisitorStats()
          break
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedule = async () => {
    const startDate = getWeekStart(currentDate)
    const endDate = getWeekEnd(currentDate)

    const response = await fetch(`/api/admin/calendar/schedule?start=${startDate}&end=${endDate}`)
    const data = await response.json()

    if (data.success) {
      setSchedule(data.schedule)
    }
  }

  const fetchCategories = async () => {
    const response = await fetch('/api/admin/calendar/categories')
    const data = await response.json()

    if (data.success) {
      setServiceCategories(data.categories)
    }
  }

  const fetchHolidays = async () => {
    const year = currentDate.getFullYear()
    const response = await fetch(`/api/admin/calendar/holidays?year=${year}`)
    const data = await response.json()

    if (data.success) {
      setHolidays(data.holidays)
    }
  }

  const fetchVisitorStats = async () => {
    const startDate = getMonthStart(currentDate)
    const endDate = getMonthEnd(currentDate)

    const response = await fetch(`/api/admin/calendar/visitor-stats?start=${startDate}&end=${endDate}`)
    const data = await response.json()

    if (data.success) {
      setVisitorStats(data.stats)
    }
  }

  const generateTimeSlots = (schedule: DaySchedule) => {
    const slots: TimeSlot[] = []
    const openTime = new Date(`2023-01-01T${schedule.openTime}:00`)
    const closeTime = new Date(`2023-01-01T${schedule.closeTime}:00`)
    const lunchStart = schedule.lunchBreak ? new Date(`2023-01-01T${schedule.lunchBreak.startTime}:00`) : null
    const lunchEnd = schedule.lunchBreak ? new Date(`2023-01-01T${schedule.lunchBreak.endTime}:00`) : null

    let currentTime = new Date(openTime)

    while (currentTime < closeTime) {
      const slotEnd = new Date(currentTime.getTime() + globalSettings.slotDuration * 60000)

      // Skip lunch break
      if (lunchStart && lunchEnd &&
          ((currentTime >= lunchStart && currentTime < lunchEnd) ||
           (slotEnd > lunchStart && slotEnd <= lunchEnd))) {
        currentTime = new Date(lunchEnd)
        continue
      }

      if (slotEnd <= closeTime) {
        serviceCategories.forEach(category => {
          slots.push({
            id: `${schedule.date}-${currentTime.toTimeString().slice(0, 5)}-${category.id}`,
            startTime: currentTime.toTimeString().slice(0, 5),
            endTime: slotEnd.toTimeString().slice(0, 5),
            capacity: Math.floor(category.maxDaily / 8), // Distribute daily capacity across slots
            bookedCount: 0,
            isActive: category.isActive,
            category: category.id,
            notes: ''
          })
        })
      }

      currentTime = new Date(currentTime.getTime() + (globalSettings.slotDuration + globalSettings.bufferTime) * 60000)
    }

    return slots
  }

  const saveSchedule = async () => {
    if (!editingSchedule) return

    try {
      const method = editingSchedule.timeSlots.length === 0 ? 'POST' : 'PUT'

      // Generate time slots if not existing
      if (editingSchedule.timeSlots.length === 0) {
        editingSchedule.timeSlots = generateTimeSlots(editingSchedule)
      }

      const response = await fetch('/api/admin/calendar/schedule', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSchedule)
      })

      const data = await response.json()
      if (data.success) {
        fetchSchedule()
        setShowScheduleModal(false)
        setEditingSchedule(null)
        alert('Schedule saved successfully!')
      } else {
        alert('Failed to save schedule: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save schedule:', error)
      alert('Failed to save schedule')
    }
  }

  const saveCategory = async () => {
    if (!editingCategory) return

    try {
      const isNew = !editingCategory.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/calendar/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      })

      const data = await response.json()
      if (data.success) {
        fetchCategories()
        setShowCategoryModal(false)
        setEditingCategory(null)
        alert(`Category ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save category: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const saveHoliday = async () => {
    if (!editingHoliday) return

    try {
      const isNew = !editingHoliday.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/calendar/holidays', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingHoliday)
      })

      const data = await response.json()
      if (data.success) {
        fetchHolidays()
        setShowHolidayModal(false)
        setEditingHoliday(null)
        alert(`Holiday ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save holiday: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save holiday:', error)
      alert('Failed to save holiday')
    }
  }

  const resetVisitorCounter = async () => {
    if (!confirm('Are you sure you want to reset the visitor counter? This action cannot be undone.')) return

    try {
      const response = await fetch('/api/admin/calendar/reset-counter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] })
      })

      const data = await response.json()
      if (data.success) {
        fetchVisitorStats()
        alert('Visitor counter reset successfully!')
      } else {
        alert('Failed to reset counter: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to reset counter:', error)
      alert('Failed to reset counter')
    }
  }

  const resetTimeslots = async (date: string, category?: string) => {
    const confirmMessage = category
      ? `Reset all timeslots for ${category} on ${date}?`
      : `Reset all timeslots for ${date}?`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch('/api/admin/calendar/reset-timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, category })
      })

      const data = await response.json()
      if (data.success) {
        fetchSchedule()
        alert('Timeslots reset successfully!')
      } else {
        alert('Failed to reset timeslots: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to reset timeslots:', error)
      alert('Failed to reset timeslots')
    }
  }

  const bulkUpdateSchedule = async (dates: string[], updates: Partial<DaySchedule>) => {
    try {
      const response = await fetch('/api/admin/calendar/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, updates })
      })

      const data = await response.json()
      if (data.success) {
        fetchSchedule()
        alert(`${dates.length} schedules updated successfully!`)
      } else {
        alert('Failed to update schedules: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to bulk update:', error)
      alert('Failed to bulk update schedules')
    }
  }

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  const getWeekEnd = (date: Date) => {
    const start = new Date(getWeekStart(date))
    return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }

  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  }

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { weekday: 'long' })
  }

  const getStatusColor = (schedule: DaySchedule) => {
    if (schedule.isHoliday) return 'red'
    if (!schedule.isOpen) return 'gray'

    const utilizationRate = schedule.totalCapacity > 0
      ? (schedule.totalBooked / schedule.totalCapacity) * 100
      : 0

    if (utilizationRate >= 90) return 'red'
    if (utilizationRate >= 70) return 'yellow'
    return 'green'
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar Management</h2>
          <p className="text-gray-600">
            Manage appointment schedules, timeslots, and visitor analytics
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={resetVisitorCounter}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Counter
          </button>

          <button
            onClick={fetchCalendarData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Calendar Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
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

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Schedule Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-lg font-medium">
                Week of {formatDate(getWeekStart(currentDate))}
              </div>

              <button
                onClick={() => navigateWeek('next')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingSchedule({
                    date: new Date().toISOString().split('T')[0],
                    dayOfWeek: new Date().getDay(),
                    isHoliday: false,
                    isOpen: true,
                    openTime: globalSettings.defaultOpenTime,
                    closeTime: globalSettings.defaultCloseTime,
                    lunchBreak: {
                      startTime: globalSettings.defaultLunchStart,
                      endTime: globalSettings.defaultLunchEnd
                    },
                    timeSlots: [],
                    totalCapacity: 0,
                    totalBooked: 0
                  })
                  setShowScheduleModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </button>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-8 gap-px bg-gray-200">
              {/* Time Column Header */}
              <div className="bg-gray-50 p-4 font-medium text-sm text-gray-900">
                Time
              </div>

              {/* Day Headers */}
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(getWeekStart(currentDate))
                date.setDate(date.getDate() + i)
                const dateString = date.toISOString().split('T')[0]
                const daySchedule = schedule.find(s => s.date === dateString)

                return (
                  <div key={i} className="bg-gray-50 p-4 text-center">
                    <div className="font-medium text-sm text-gray-900">
                      {getDayOfWeek(dateString)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(dateString).split(',')[1]}
                    </div>
                    {daySchedule && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-${getStatusColor(daySchedule)}-100 text-${getStatusColor(daySchedule)}-800`}>
                        {daySchedule.isHoliday ? 'Holiday' :
                         !daySchedule.isOpen ? 'Closed' :
                         `${daySchedule.totalBooked}/${daySchedule.totalCapacity}`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Time Slots */}
            <div className="max-h-96 overflow-y-auto">
              {Array.from({ length: 16 }, (_, timeIndex) => {
                const hour = 9 + Math.floor(timeIndex / 2)
                const minute = (timeIndex % 2) * 30
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

                return (
                  <div key={timeIndex} className="grid grid-cols-8 gap-px bg-gray-200">
                    {/* Time Label */}
                    <div className="bg-white p-2 text-sm text-gray-600 font-medium">
                      {timeString}
                    </div>

                    {/* Day Slots */}
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const date = new Date(getWeekStart(currentDate))
                      date.setDate(date.getDate() + dayIndex)
                      const dateString = date.toISOString().split('T')[0]
                      const daySchedule = schedule.find(s => s.date === dateString)
                      const daySlots = daySchedule?.timeSlots.filter(slot => slot.startTime === timeString) || []

                      return (
                        <div key={dayIndex} className="bg-white p-1 min-h-[60px] border-l border-gray-100">
                          <div className="space-y-1">
                            {daySlots.map((slot) => {
                              const category = serviceCategories.find(c => c.id === slot.category)
                              const utilizationRate = slot.capacity > 0 ? (slot.bookedCount / slot.capacity) * 100 : 0

                              return (
                                <div
                                  key={slot.id}
                                  className={`text-xs p-1 rounded cursor-pointer bg-${category?.color}-100 text-${category?.color}-800 hover:bg-${category?.color}-200`}
                                  title={`${category?.name}: ${slot.bookedCount}/${slot.capacity} booked`}
                                  onClick={() => {
                                    // Open slot edit modal
                                  }}
                                >
                                  <div className="font-medium truncate">{category?.name.slice(0, 8)}</div>
                                  <div className="flex justify-between items-center">
                                    <span>{slot.bookedCount}/{slot.capacity}</span>
                                    <div className={`w-2 h-2 rounded-full ${
                                      utilizationRate >= 100 ? 'bg-red-500' :
                                      utilizationRate >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Daily Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {schedule.map((daySchedule) => (
              <div key={daySchedule.date} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{getDayOfWeek(daySchedule.date)}</h3>
                    <p className="text-sm text-gray-500">{formatDate(daySchedule.date)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => resetTimeslots(daySchedule.date)}
                      className="text-orange-600 hover:text-orange-800"
                      title="Reset Timeslots"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingSchedule(daySchedule)
                        setShowScheduleModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Schedule"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {daySchedule.isHoliday ? (
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <Ban className="h-6 w-6 text-red-500 mx-auto mb-1" />
                      <div className="text-sm font-medium text-red-800">{daySchedule.holidayName}</div>
                    </div>
                  ) : !daySchedule.isOpen ? (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <UserX className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <div className="text-sm font-medium text-gray-600">Closed</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-medium">{daySchedule.openTime} - {daySchedule.closeTime}</span>
                      </div>

                      {daySchedule.lunchBreak && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Lunch:</span>
                          <span className="font-medium">{daySchedule.lunchBreak.startTime} - {daySchedule.lunchBreak.endTime}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{daySchedule.totalBooked}/{daySchedule.totalCapacity}</span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            daySchedule.totalCapacity > 0 && (daySchedule.totalBooked / daySchedule.totalCapacity) >= 0.9
                              ? 'bg-red-500'
                              : daySchedule.totalCapacity > 0 && (daySchedule.totalBooked / daySchedule.totalCapacity) >= 0.7
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${daySchedule.totalCapacity > 0 ? (daySchedule.totalBooked / daySchedule.totalCapacity) * 100 : 0}%`
                          }}
                        ></div>
                      </div>

                      {/* Category breakdown */}
                      <div className="space-y-1 mt-3">
                        {serviceCategories.map((category) => {
                          const categorySlots = daySchedule.timeSlots.filter(slot => slot.category === category.id)
                          const totalCapacity = categorySlots.reduce((sum, slot) => sum + slot.capacity, 0)
                          const totalBooked = categorySlots.reduce((sum, slot) => sum + slot.bookedCount, 0)

                          if (totalCapacity === 0) return null

                          return (
                            <div key={category.id} className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full bg-${category.color}-500`}></div>
                                <span className="text-gray-600">{category.name}</span>
                              </div>
                              <span className="font-medium">{totalBooked}/{totalCapacity}</span>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Service Categories</h3>
              <p className="text-sm text-gray-600">Configure service types and their scheduling parameters</p>
            </div>

            <button
              onClick={() => {
                setEditingCategory({
                  id: '',
                  name: '',
                  duration: 30,
                  maxDaily: 20,
                  color: 'blue',
                  isActive: true,
                  requiredOfficers: 1,
                  priority: 5
                })
                setShowCategoryModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${category.color}-500`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">Priority: {category.priority}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category)
                        setShowCategoryModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <div className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-medium">{category.duration} min</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Daily:</span>
                      <div className="font-medium">{category.maxDaily}</div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Required Officers:</span>
                    <div className="font-medium">{category.requiredOfficers}</div>
                  </div>

                  <button
                    onClick={() => resetTimeslots('', category.id)}
                    className="w-full mt-3 px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 flex items-center justify-center"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Category Slots
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holidays Tab */}
      {activeTab === 'holidays' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Holiday Calendar</h3>
              <p className="text-sm text-gray-600">Manage public holidays and closure dates</p>
            </div>

            <button
              onClick={() => {
                setEditingHoliday({
                  id: '',
                  name: '',
                  date: new Date().toISOString().split('T')[0],
                  type: 'public',
                  isRecurring: false,
                  description: '',
                  affectedServices: [],
                  createdAt: ''
                })
                setShowHolidayModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{holiday.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(holiday.date)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingHoliday(holiday)
                        setShowHolidayModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    holiday.type === 'public' ? 'bg-blue-100 text-blue-800' :
                    holiday.type === 'consulate' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {holiday.type.toUpperCase()}
                  </div>

                  {holiday.isRecurring && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                      RECURRING
                    </div>
                  )}

                  {holiday.description && (
                    <p className="text-sm text-gray-600 mt-2">{holiday.description}</p>
                  )}

                  {holiday.affectedServices.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Affected Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {holiday.affectedServices.map((serviceId) => {
                          const service = serviceCategories.find(s => s.id === serviceId)
                          return (
                            <span key={serviceId} className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                              {service?.name || serviceId}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Visitor Statistics</h3>
              <p className="text-sm text-gray-600">Track visitor patterns and appointment utilization</p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-sm font-medium">
                {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Total Visitors',
                value: visitorStats.reduce((sum, stat) => sum + stat.totalVisitors, 0),
                icon: Users,
                color: 'blue'
              },
              {
                title: 'Appointment Visitors',
                value: visitorStats.reduce((sum, stat) => sum + stat.appointmentVisitors, 0),
                icon: Calendar,
                color: 'green'
              },
              {
                title: 'Walk-in Visitors',
                value: visitorStats.reduce((sum, stat) => sum + stat.walkInVisitors, 0),
                icon: Coffee,
                color: 'orange'
              },
              {
                title: 'Avg Wait Time',
                value: visitorStats.length > 0
                  ? Math.round(visitorStats.reduce((sum, stat) => sum + stat.averageWaitTime, 0) / visitorStats.length) + ' min'
                  : '0 min',
                icon: Clock,
                color: 'purple'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Stats Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Daily Statistics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Walk-ins</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peak Hour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Wait</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {visitorStats.map((stat) => (
                    <tr key={stat.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(stat.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.totalVisitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.appointmentVisitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.walkInVisitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.peakHour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.averageWaitTime} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Edit Schedule - {formatDate(editingSchedule.date)}
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingSchedule.date}
                  onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingSchedule.isOpen}
                    onChange={(e) => setEditingSchedule({...editingSchedule, isOpen: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Open for business</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingSchedule.isHoliday}
                    onChange={(e) => setEditingSchedule({...editingSchedule, isHoliday: e.target.checked, isOpen: !e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Holiday</span>
                </label>
              </div>

              {editingSchedule.isHoliday && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holiday Name
                  </label>
                  <input
                    type="text"
                    value={editingSchedule.holidayName || ''}
                    onChange={(e) => setEditingSchedule({...editingSchedule, holidayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter holiday name"
                  />
                </div>
              )}

              {editingSchedule.isOpen && !editingSchedule.isHoliday && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        value={editingSchedule.openTime}
                        onChange={(e) => setEditingSchedule({...editingSchedule, openTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        value={editingSchedule.closeTime}
                        onChange={(e) => setEditingSchedule({...editingSchedule, closeTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={!!editingSchedule.lunchBreak}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingSchedule({
                              ...editingSchedule,
                              lunchBreak: {
                                startTime: globalSettings.defaultLunchStart,
                                endTime: globalSettings.defaultLunchEnd
                              }
                            })
                          } else {
                            setEditingSchedule({...editingSchedule, lunchBreak: undefined})
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm font-medium">Lunch Break</span>
                    </label>

                    {editingSchedule.lunchBreak && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lunch Start
                          </label>
                          <input
                            type="time"
                            value={editingSchedule.lunchBreak.startTime}
                            onChange={(e) => setEditingSchedule({
                              ...editingSchedule,
                              lunchBreak: {
                                ...editingSchedule.lunchBreak!,
                                startTime: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lunch End
                          </label>
                          <input
                            type="time"
                            value={editingSchedule.lunchBreak.endTime}
                            onChange={(e) => setEditingSchedule({
                              ...editingSchedule,
                              lunchBreak: {
                                ...editingSchedule.lunchBreak!,
                                endTime: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editingSchedule.notes || ''}
                  onChange={(e) => setEditingSchedule({...editingSchedule, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special notes for this day"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-6 border-b">
              <h3 className="text-lg font-medium">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={editingCategory.duration}
                    onChange={(e) => setEditingCategory({...editingCategory, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Daily
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={editingCategory.maxDaily}
                    onChange={(e) => setEditingCategory({...editingCategory, maxDaily: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'yellow'].map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editingCategory.priority}
                    onChange={(e) => setEditingCategory({...editingCategory, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Officers
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editingCategory.requiredOfficers}
                  onChange={(e) => setEditingCategory({...editingCategory, requiredOfficers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingCategory.isActive}
                    onChange={(e) => setEditingCategory({...editingCategory, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Active Category</span>
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingCategory.id ? 'Update' : 'Create'} Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && editingHoliday && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-6 border-b">
              <h3 className="text-lg font-medium">
                {editingHoliday.id ? 'Edit Holiday' : 'Create Holiday'}
              </h3>
              <button
                onClick={() => setShowHolidayModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({...editingHoliday, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={editingHoliday.date}
                  onChange={(e) => setEditingHoliday({...editingHoliday, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={editingHoliday.type}
                  onChange={(e) => setEditingHoliday({...editingHoliday, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">Public Holiday</option>
                  <option value="consulate">Consulate Closure</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingHoliday.description || ''}
                  onChange={(e) => setEditingHoliday({...editingHoliday, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingHoliday.isRecurring}
                    onChange={(e) => setEditingHoliday({...editingHoliday, isRecurring: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium">Recurring Holiday</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affected Services
                </label>
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingHoliday.affectedServices.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingHoliday({
                              ...editingHoliday,
                              affectedServices: [...editingHoliday.affectedServices, category.id]
                            })
                          } else {
                            setEditingHoliday({
                              ...editingHoliday,
                              affectedServices: editingHoliday.affectedServices.filter(id => id !== category.id)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveHoliday}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingHoliday.id ? 'Update' : 'Create'} Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarManagement
