'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Settings,
  FileText,
  Users,
  Bell,
  Calendar,
  Image,
  MessageSquare,
  PieChart,
  Database,
  Shield,
  Globe,
  Clock,
  RefreshCw,
  LogOut,
  ChevronRight,
  Activity,
  TrendingUp,
  Eye,
  AlertTriangle
} from 'lucide-react'
import IndianEmblem from './IndianEmblem'

// Import sub-components for different admin sections
import ApplicationManagement from './admin/ApplicationManagement'
import ServiceManagement from './ServiceManagement'
import ContentManagement from './admin/ContentManagement'
import NotificationCenter from './admin/NotificationCenter'
import CalendarManagement from './admin/CalendarManagement'
import AnalyticsDashboard from './admin/AnalyticsDashboard'
import SystemConfiguration from './admin/SystemConfiguration'
import UserManagement from './admin/UserManagement'

interface AdminStats {
  totalApplications: number
  pendingApplications: number
  todaySubmissions: number
  totalUsers: number
  activeNotifications: number
  systemHealth: string
  visitorCount: number
  appointmentsToday: number
  averageProcessingTime: string
  totalRevenue: number
}

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [adminUser, setAdminUser] = useState({
    name: 'Admin Officer',
    email: 'admin@indianconsulate.com',
    role: 'Super Admin',
    lastLogin: new Date().toISOString()
  })
  const [stats, setStats] = useState<AdminStats>({
    totalApplications: 0,
    pendingApplications: 0,
    todaySubmissions: 0,
    totalUsers: 0,
    activeNotifications: 0,
    systemHealth: 'Healthy',
    visitorCount: 0,
    appointmentsToday: 0,
    averageProcessingTime: '0 days',
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(false)
  const [systemAlerts, setSystemAlerts] = useState<Array<{
    id: string
    type: 'info' | 'warning' | 'error'
    message: string
    timestamp: string
  }>>([])

  const adminTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and statistics'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileText,
      description: 'Manage applications and status'
    },
    {
      id: 'services',
      label: 'Services',
      icon: Settings,
      description: 'Service configuration and management'
    },
    {
      id: 'content',
      label: 'Content',
      icon: Image,
      description: 'Banners, events, and announcements'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Send notifications and manage templates'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'Appointment slots and schedule management'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: PieChart,
      description: 'Reports and visitor analytics'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'User management and permissions'
    },
    {
      id: 'system',
      label: 'System',
      icon: Database,
      description: 'System configuration and maintenance'
    }
  ]

  useEffect(() => {
    fetchDashboardData()
    fetchSystemAlerts()

    // Set up real-time updates
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchSystemAlerts()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/dashboard/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemAlerts = async () => {
    try {
      const response = await fetch('/api/admin/system/alerts')
      const data = await response.json()

      if (data.success) {
        setSystemAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Failed to fetch system alerts:', error)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      // Clear admin session
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      window.location.href = '/admin'
    }
  }

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <IndianEmblem size="md" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Control Panel
                </h1>
                <p className="text-sm text-gray-500">
                  Indian Consular Services Management System
                </p>
              </div>
            </div>

            {/* Admin Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* System Health Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  stats.systemHealth === 'Healthy'
                    ? 'bg-green-500'
                    : stats.systemHealth === 'Warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${getHealthColor(stats.systemHealth)}`}>
                  {stats.systemHealth}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Notifications Badge */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  {stats.activeNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.activeNotifications}
                    </span>
                  )}
                </button>
              </div>

              {/* Admin Profile */}
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{adminUser.name}</p>
                  <p className="text-xs text-gray-500">{adminUser.role}</p>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {adminUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="space-y-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                          {tab.description}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* System Alerts */}
            {systemAlerts.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                  System Alerts
                </h3>
                <div className="space-y-2">
                  {systemAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`text-xs p-2 rounded ${
                        alert.type === 'error'
                          ? 'bg-red-50 text-red-700'
                          : alert.type === 'warning'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: 'Total Applications',
                      value: formatNumber(stats.totalApplications),
                      icon: FileText,
                      color: 'blue',
                      change: '+12% from last month'
                    },
                    {
                      title: 'Pending Review',
                      value: formatNumber(stats.pendingApplications),
                      icon: Clock,
                      color: 'yellow',
                      change: `${stats.pendingApplications} requiring attention`
                    },
                    {
                      title: 'Today\'s Visitors',
                      value: formatNumber(stats.visitorCount),
                      icon: Eye,
                      color: 'green',
                      change: '+8% from yesterday'
                    },
                    {
                      title: 'Total Revenue',
                      value: formatCurrency(stats.totalRevenue),
                      icon: TrendingUp,
                      color: 'purple',
                      change: '+15% from last month'
                    }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
                        </div>
                        <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                          <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity and Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          action: 'New application submitted',
                          user: 'John Doe',
                          time: '2 minutes ago',
                          type: 'application'
                        },
                        {
                          action: 'Service updated',
                          user: 'Admin Officer',
                          time: '15 minutes ago',
                          type: 'service'
                        },
                        {
                          action: 'User notification sent',
                          user: 'System',
                          time: '1 hour ago',
                          type: 'notification'
                        }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 py-2">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'application' ? 'bg-blue-500' :
                            activity.type === 'service' ? 'bg-green-500' : 'bg-purple-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Add Service', icon: Settings, action: () => setActiveTab('services') },
                        { label: 'Send Notification', icon: Bell, action: () => setActiveTab('notifications') },
                        { label: 'Manage Calendar', icon: Calendar, action: () => setActiveTab('calendar') },
                        { label: 'View Analytics', icon: BarChart3, action: () => setActiveTab('analytics') }
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <action.icon className="h-6 w-6 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tab Contents */}
            {activeTab === 'applications' && <ApplicationManagement />}
            {activeTab === 'services' && <ServiceManagement />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'notifications' && <NotificationCenter />}
            {activeTab === 'calendar' && <CalendarManagement />}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'system' && <SystemConfiguration />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
