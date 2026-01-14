'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  Eye,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Coffee,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react'

interface AnalyticsData {
  visitors: {
    total: number
    appointment: number
    walkIn: number
    returning: number
    trend: number
  }
  applications: {
    submitted: number
    processed: number
    completed: number
    rejected: number
    trend: number
  }
  performance: {
    avgWaitTime: number
    avgProcessingTime: number
    satisfactionScore: number
    efficiency: number
  }
  devices: {
    desktop: number
    mobile: number
    tablet: number
  }
  services: {
    [key: string]: {
      name: string
      count: number
      revenue: number
      trend: number
    }
  }
  timeSlots: {
    [hour: string]: number
  }
  notifications: {
    email: { sent: number; delivered: number; opened: number }
    sms: { sent: number; delivered: number }
    whatsapp: { sent: number; delivered: number; read: number }
  }
  geography: {
    [region: string]: number
  }
}

interface ReportFilter {
  dateRange: string
  serviceType: string
  visitorType: string
  deviceType: string
  customStart?: string
  customEnd?: string
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedChart, setSelectedChart] = useState('overview')
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: 'last7days',
    serviceType: 'all',
    visitorType: 'all',
    deviceType: 'all'
  })

  const chartTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'visitors', label: 'Visitors', icon: Users },
    { id: 'services', label: 'Services', icon: FileText },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'geography', label: 'Geography', icon: MapPin }
  ]

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ]

  const serviceTypes = [
    { value: 'all', label: 'All Services' },
    { value: 'passport', label: 'Passport Services' },
    { value: 'visa', label: 'Visa Services' },
    { value: 'oci', label: 'OCI Services' },
    { value: 'attestation', label: 'Document Attestation' },
    { value: 'consular', label: 'Consular Services' }
  ]

  useEffect(() => {
    fetchAnalyticsData()
  }, [filters])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        dateRange: filters.dateRange,
        serviceType: filters.serviceType,
        visitorType: filters.visitorType,
        deviceType: filters.deviceType,
        ...(filters.customStart && { startDate: filters.customStart }),
        ...(filters.customEnd && { endDate: filters.customEnd })
      })

      const response = await fetch(`/api/admin/analytics?${params}`)
      const data = await response.json()

      if (data.success) {
        setAnalyticsData(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, filters, chartType: selectedChart })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`
        link.click()
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const generateHourlyChart = () => {
    if (!analyticsData?.timeSlots) return null

    const hours = Object.keys(analyticsData.timeSlots).sort()
    const maxValue = Math.max(...Object.values(analyticsData.timeSlots))

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Hourly Traffic Distribution</h3>
        <div className="grid grid-cols-12 gap-2 h-32">
          {hours.map((hour) => {
            const value = analyticsData.timeSlots[hour]
            const height = (value / maxValue) * 100

            return (
              <div key={hour} className="flex flex-col items-center justify-end">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                  title={`${hour}:00 - ${value} visitors`}
                ></div>
                <div className="text-xs text-gray-500 mt-1">{hour}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const generateServiceChart = () => {
    if (!analyticsData?.services) return null

    const services = Object.values(analyticsData.services)
    const totalApplications = services.reduce((sum, service) => sum + service.count, 0)

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Service Distribution</h3>
        <div className="space-y-3">
          {services.map((service, index) => {
            const percentage = totalApplications > 0 ? (service.count / totalApplications) * 100 : 0
            const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
            const color = colors[index % colors.length]

            return (
              <div key={service.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">{service.count}</span>
                    <span className="text-xs text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-${color}-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Revenue: {formatCurrency(service.revenue)}</span>
                  <span className={getTrendColor(service.trend)}>
                    {formatPercentage(service.trend)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const generateDeviceChart = () => {
    if (!analyticsData?.devices) return null

    const devices = [
      { name: 'Desktop', value: analyticsData.devices.desktop, icon: Monitor, color: 'blue' },
      { name: 'Mobile', value: analyticsData.devices.mobile, icon: Smartphone, color: 'green' },
      { name: 'Tablet', value: analyticsData.devices.tablet, icon: Globe, color: 'purple' }
    ]

    const total = devices.reduce((sum, device) => sum + device.value, 0)

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Device Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {devices.map((device) => {
            const percentage = total > 0 ? (device.value / total) * 100 : 0
            const Icon = device.icon

            return (
              <div key={device.name} className="text-center">
                <div className={`p-4 rounded-lg bg-${device.color}-100 mb-2`}>
                  <Icon className={`h-8 w-8 text-${device.color}-600 mx-auto`} />
                </div>
                <div className="text-sm font-medium text-gray-900">{device.name}</div>
                <div className="text-lg font-bold text-gray-900">{device.value}</div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!analyticsData && !loading) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
        <button
          onClick={fetchAnalyticsData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Load Analytics
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Comprehensive insights into visitor patterns and system performance
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.customStart || ''}
                onChange={(e) => setFilters({ ...filters, customStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.customEnd || ''}
                onChange={(e) => setFilters({ ...filters, customEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Type</label>
            <select
              value={filters.visitorType}
              onChange={(e) => setFilters({ ...filters, visitorType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Visitors</option>
              <option value="appointment">Appointment</option>
              <option value="walkin">Walk-in</option>
              <option value="returning">Returning</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
            <select
              value={filters.deviceType}
              onChange={(e) => setFilters({ ...filters, deviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading analytics data...</p>
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Visitors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(analyticsData.visitors.total)}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${getTrendColor(analyticsData.visitors.trend)}`}>
                    {getTrendIcon(analyticsData.visitors.trend)}
                    <span className="ml-1">{formatPercentage(analyticsData.visitors.trend)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Appointments:</span>
                  <span className="font-medium">{formatNumber(analyticsData.visitors.appointment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Walk-ins:</span>
                  <span className="font-medium">{formatNumber(analyticsData.visitors.walkIn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Returning:</span>
                  <span className="font-medium">{formatNumber(analyticsData.visitors.returning)}</span>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(analyticsData.applications.submitted)}
                  </p>
                  <div className={`flex items-center mt-2 text-sm ${getTrendColor(analyticsData.applications.trend)}`}>
                    {getTrendIcon(analyticsData.applications.trend)}
                    <span className="ml-1">{formatPercentage(analyticsData.applications.trend)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processed:</span>
                  <span className="font-medium">{formatNumber(analyticsData.applications.processed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{formatNumber(analyticsData.applications.completed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rejected:</span>
                  <span className="font-medium">{formatNumber(analyticsData.applications.rejected)}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.performance.avgWaitTime} min
                  </p>
                  <div className="flex items-center mt-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      analyticsData.performance.avgWaitTime <= 15 ? 'bg-green-500' :
                      analyticsData.performance.avgWaitTime <= 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">
                      {analyticsData.performance.avgWaitTime <= 15 ? 'Excellent' :
                       analyticsData.performance.avgWaitTime <= 30 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-100">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">{analyticsData.performance.avgProcessingTime} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Satisfaction:</span>
                  <span className="font-medium">{analyticsData.performance.satisfactionScore}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">{analyticsData.performance.efficiency}%</span>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatNumber(
                      analyticsData.notifications.email.sent +
                      analyticsData.notifications.sms.sent +
                      analyticsData.notifications.whatsapp.sent
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Sent this period</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email:
                  </span>
                  <span className="font-medium">{formatNumber(analyticsData.notifications.email.sent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    SMS:
                  </span>
                  <span className="font-medium">{formatNumber(analyticsData.notifications.sms.sent)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp:
                  </span>
                  <span className="font-medium">{formatNumber(analyticsData.notifications.whatsapp.sent)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {chartTypes.map((chart) => {
                const Icon = chart.icon
                const isActive = selectedChart === chart.id

                return (
                  <button
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {chart.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Chart Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {selectedChart === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {generateHourlyChart()}
                {generateDeviceChart()}
              </div>
            )}

            {selectedChart === 'visitors' && (
              <div className="space-y-8">
                {generateHourlyChart()}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Appointment Visitors', value: analyticsData.visitors.appointment, color: 'blue' },
                    { label: 'Walk-in Visitors', value: analyticsData.visitors.walkIn, color: 'green' },
                    { label: 'Returning Visitors', value: analyticsData.visitors.returning, color: 'purple' }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>
                        {formatNumber(stat.value)}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                      <div className={`w-full h-2 bg-${stat.color}-100 rounded-full mt-2`}>
                        <div
                          className={`h-2 bg-${stat.color}-500 rounded-full`}
                          style={{ width: `${(stat.value / analyticsData.visitors.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedChart === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {generateServiceChart()}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Service Performance</h3>
                  <div className="space-y-4">
                    {Object.values(analyticsData.services).map((service, index) => {
                      const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo']
                      const color = colors[index % colors.length]

                      return (
                        <div key={service.name} className={`p-4 rounded-lg bg-${color}-50 border border-${color}-200`}>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <div className={`flex items-center text-sm ${getTrendColor(service.trend)}`}>
                              {getTrendIcon(service.trend)}
                              <span className="ml-1">{formatPercentage(service.trend)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Applications:</span>
                              <div className="font-medium">{formatNumber(service.count)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <div className="font-medium">{formatCurrency(service.revenue)}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedChart === 'performance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Average Wait Time',
                        value: `${analyticsData.performance.avgWaitTime} min`,
                        target: '≤ 15 min',
                        status: analyticsData.performance.avgWaitTime <= 15 ? 'good' : 'warning'
                      },
                      {
                        label: 'Average Processing Time',
                        value: `${analyticsData.performance.avgProcessingTime} days`,
                        target: '≤ 7 days',
                        status: analyticsData.performance.avgProcessingTime <= 7 ? 'good' : 'warning'
                      },
                      {
                        label: 'Customer Satisfaction',
                        value: `${analyticsData.performance.satisfactionScore}/5`,
                        target: '≥ 4.0',
                        status: analyticsData.performance.satisfactionScore >= 4.0 ? 'good' : 'warning'
                      },
                      {
                        label: 'System Efficiency',
                        value: `${analyticsData.performance.efficiency}%`,
                        target: '≥ 85%',
                        status: analyticsData.performance.efficiency >= 85 ? 'good' : 'warning'
                      }
                    ].map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{metric.label}</div>
                          <div className="text-sm text-gray-600">Target: {metric.target}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                          <div className={`flex items-center ${
                            metric.status === 'good' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {metric.status === 'good' ?
                              <CheckCircle className="h-4 w-4 mr-1" /> :
                              <AlertCircle className="h-4 w-4 mr-1" />
                            }
                            <span className="text-sm">
                              {metric.status === 'good' ? 'On Target' : 'Needs Attention'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Efficiency Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Staff Utilization', value: 87, color: 'blue' },
                      { label: 'Resource Allocation', value: 92, color: 'green' },
                      { label: 'Process Automation', value: 78, color: 'purple' },
                      { label: 'Customer Flow', value: 85, color: 'orange' }
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-${item.color}-500`}
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedChart === 'notifications' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Notification Performance</h3>
                  <div className="space-y-4">
                    {/* Email Stats */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center mb-3">
                        <Mail className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Email Notifications</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-blue-600">Sent</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.email.sent)}</div>
                        </div>
                        <div>
                          <div className="text-blue-600">Delivered</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.email.delivered)}</div>
                        </div>
                        <div>
                          <div className="text-blue-600">Opened</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.email.opened)}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-blue-600">
                          Open Rate: {analyticsData.notifications.email.sent > 0
                            ? ((analyticsData.notifications.email.opened / analyticsData.notifications.email.sent) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </div>

                    {/* SMS Stats */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <Phone className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">SMS Notifications</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-green-600">Sent</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.sms.sent)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">Delivered</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.sms.delivered)}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-green-600">
                          Delivery Rate: {analyticsData.notifications.sms.sent > 0
                            ? ((analyticsData.notifications.sms.delivered / analyticsData.notifications.sms.sent) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Stats */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center mb-3">
                        <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">WhatsApp Notifications</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-green-600">Sent</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.whatsapp.sent)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">Delivered</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.whatsapp.delivered)}</div>
                        </div>
                        <div>
                          <div className="text-green-600">Read</div>
                          <div className="font-medium">{formatNumber(analyticsData.notifications.whatsapp.read)}</div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-green-600">
                          Read Rate: {analyticsData.notifications.whatsapp.sent > 0
                            ? ((analyticsData.notifications.whatsapp.read / analyticsData.notifications.whatsapp.sent) * 100).toFixed(1)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Channel Distribution</h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: 'Email',
                        value: analyticsData.notifications.email.sent,
                        color: 'blue',
                        icon: Mail
                      },
                      {
                        name: 'SMS',
                        value: analyticsData.notifications.sms.sent,
                        color: 'green',
                        icon: Phone
                      },
                      {
                        name: 'WhatsApp',
                        value: analyticsData.notifications.whatsapp.sent,
                        color: 'green',
                        icon: MessageCircle
                      }
                    ].map((channel) => {
                      const total = analyticsData.notifications.email.sent +
                                   analyticsData.notifications.sms.sent +
                                   analyticsData.notifications.whatsapp.sent
                      const percentage = total > 0 ? (channel.value / total) * 100 : 0
                      const Icon = channel.icon

                      return (
                        <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Icon className={`h-5 w-5 text-${channel.color}-600 mr-3`} />
                            <span className="font-medium text-gray-900">{channel.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">{formatNumber(channel.value)}</div>
                            <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {selectedChart === 'geography' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(analyticsData.geography).map(([region, count]) => {
                    const total = Object.values(analyticsData.geography).reduce((sum, val) => sum + val, 0)
                    const percentage = total > 0 ? (count / total) * 100 : 0

                    return (
                      <div key={region} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{region}</span>
                          <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{formatNumber(count)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default AnalyticsDashboard
