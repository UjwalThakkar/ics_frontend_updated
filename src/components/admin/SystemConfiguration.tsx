'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  Phone,
  Globe,
  Clock,
  Database,
  Server,
  Bell,
  Eye,
  EyeOff,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Monitor,
  Smartphone,
  Palette,
  FileText,
  Users,
  Calendar,
  Zap,
  Lock,
  Key,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  BarChart3,
  MessageSquare,
  MapPin,
  Image,
  Type,
  Layout,
  Code,
  Wrench,
  Power,
  RotateCcw
} from 'lucide-react'

interface SystemConfig {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    contactPhone: string
    address: string
    timezone: string
    language: string
    currency: string
    dateFormat: string
    timeFormat: string
  }
  appearance: {
    theme: string
    primaryColor: string
    secondaryColor: string
    logo: string
    favicon: string
    backgroundImages: string[]
    customCSS: string
  }
  features: {
    onlineApplications: boolean
    appointmentBooking: boolean
    documentUpload: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    pushNotifications: boolean
    userRegistration: boolean
    guestAccess: boolean
    multiLanguage: boolean
    darkMode: boolean
    offlineMode: boolean
  }
  security: {
    recaptchaEnabled: boolean
    recaptchaSiteKey: string
    recaptchaSecretKey: string
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordComplexity: string
    ipWhitelist: string[]
    sslRequired: boolean
    apiRateLimit: number
  }
  notifications: {
    emailProvider: string
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    smsProvider: string
    smsApiKey: string
    smsFromNumber: string
    whatsappApiUrl: string
    whatsappToken: string
    emailTemplates: {
      [key: string]: {
        subject: string
        body: string
      }
    }
  }
  system: {
    maintenanceMode: boolean
    maintenanceMessage: string
    backupEnabled: boolean
    backupSchedule: string
    logLevel: string
    maxFileSize: number
    allowedFileTypes: string[]
    cacheEnabled: boolean
    cacheDuration: number
    databaseUrl: string
  }
  integrations: {
    googleAnalytics: string
    googleMaps: string
    socialMedia: {
      facebook: string
      twitter: string
      youtube: string
      linkedin: string
    }
    paymentGateway: {
      provider: string
      apiKey: string
      webhookUrl: string
    }
  }
}

interface SystemStatus {
  server: {
    status: 'healthy' | 'warning' | 'error'
    uptime: string
    cpu: number
    memory: number
    disk: number
  }
  database: {
    status: 'healthy' | 'warning' | 'error'
    connections: number
    responseTime: number
  }
  services: {
    email: 'active' | 'inactive' | 'error'
    sms: 'active' | 'inactive' | 'error'
    storage: 'active' | 'inactive' | 'error'
    backup: 'active' | 'inactive' | 'error'
  }
}

const SystemConfiguration = () => {
  const [activeSection, setActiveSection] = useState('general')
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const configSections = [
    { id: 'general', label: 'General', icon: Settings, description: 'Basic site information' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Themes and styling' },
    { id: 'features', label: 'Features', icon: Zap, description: 'Feature toggles' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Security settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email, SMS, WhatsApp' },
    { id: 'system', label: 'System', icon: Server, description: 'System preferences' },
    { id: 'integrations', label: 'Integrations', icon: Globe, description: 'Third-party services' },
    { id: 'status', label: 'Status', icon: Activity, description: 'System health' }
  ]

  const themes = [
    { value: 'default', label: 'Default Theme' },
    { value: 'modern', label: 'Modern Theme' },
    { value: 'classic', label: 'Classic Theme' },
    { value: 'minimal', label: 'Minimal Theme' }
  ]

  const timezones = [
    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'af', label: 'Afrikaans' },
    { value: 'zu', label: 'isiZulu' }
  ]

  const emailProviders = [
    { value: 'smtp', label: 'SMTP' },
    { value: 'gmail', label: 'Gmail' },
    { value: 'outlook', label: 'Outlook' },
    { value: 'sendgrid', label: 'SendGrid' },
    { value: 'mailgun', label: 'Mailgun' }
  ]

  const smsProviders = [
    { value: 'twilio', label: 'Twilio' },
    { value: 'nexmo', label: 'Nexmo/Vonage' },
    { value: 'clickatell', label: 'Clickatell' },
    { value: 'bulksms', label: 'BulkSMS' }
  ]

  const logLevels = [
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'fatal', label: 'Fatal' }
  ]

  useEffect(() => {
    fetchConfiguration()
    fetchSystemStatus()
  }, [])

  const fetchConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system/config')
      const data = await response.json()

      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to fetch configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/admin/system/status')
      const data = await response.json()

      if (data.success) {
        setSystemStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error)
    }
  }

  const saveConfiguration = async () => {
    if (!config) return

    setSaving(true)
    try {
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      if (data.success) {
        setHasChanges(false)
        alert('Configuration saved successfully!')
      } else {
        alert('Failed to save configuration: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) return

    try {
      const response = await fetch('/api/admin/system/config/reset', {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchConfiguration()
        alert('Configuration reset to defaults!')
      } else {
        alert('Failed to reset configuration: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to reset configuration:', error)
      alert('Failed to reset configuration')
    }
  }

  const exportConfiguration = async () => {
    try {
      const response = await fetch('/api/admin/system/config/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-config-${new Date().toISOString().split('T')[0]}.json`
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  const importConfiguration = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedConfig = JSON.parse(text)

      if (confirm('This will overwrite the current configuration. Are you sure?')) {
        const response = await fetch('/api/admin/system/config/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedConfig)
        })

        const data = await response.json()
        if (data.success) {
          fetchConfiguration()
          alert('Configuration imported successfully!')
        } else {
          alert('Failed to import configuration: ' + data.error)
        }
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('Import failed: Invalid configuration file')
    }

    // Reset file input
    event.target.value = ''
  }

  const toggleMaintenanceMode = async () => {
    if (!config) return

    const newMode = !config.system.maintenanceMode

    if (newMode && !confirm('This will put the site in maintenance mode. Continue?')) return
    if (!newMode && !confirm('This will take the site out of maintenance mode. Continue?')) return

    try {
      const response = await fetch('/api/admin/system/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newMode,
          message: config.system.maintenanceMessage
        })
      })

      const data = await response.json()
      if (data.success) {
        setConfig({
          ...config,
          system: {
            ...config.system,
            maintenanceMode: newMode
          }
        })
        alert(`Maintenance mode ${newMode ? 'enabled' : 'disabled'}!`)
      } else {
        alert('Failed to toggle maintenance mode: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error)
      alert('Failed to toggle maintenance mode')
    }
  }

  const testNotificationService = async (service: 'email' | 'sms' | 'whatsapp') => {
    try {
      const response = await fetch(`/api/admin/system/test/${service}`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        alert(`${service.toUpperCase()} service test successful!`)
      } else {
        alert(`${service.toUpperCase()} service test failed: ` + data.error)
      }
    } catch (error) {
      console.error(`${service} test failed:`, error)
      alert(`${service.toUpperCase()} service test failed`)
    }
  }

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config) return

    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    })
    setHasChanges(true)
  }

  const updateNestedConfig = (section: keyof SystemConfig, parentKey: string, key: string, value: any) => {
    if (!config) return

    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [parentKey]: {
          ...(config[section] as any)[parentKey],
          [key]: value
        }
      }
    })
    setHasChanges(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'green'
      case 'warning':
        return 'yellow'
      case 'error':
      case 'inactive':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
      case 'inactive':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  if (loading && !config) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading system configuration...</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load system configuration</p>
        <button
          onClick={fetchConfiguration}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">
            Manage system settings, features, and integrations
          </p>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <div className="flex items-center text-orange-600 text-sm mr-4">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}

          <input
            type="file"
            accept=".json"
            onChange={importConfiguration}
            className="hidden"
            id="import-config"
          />
          <label
            htmlFor="import-config"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer flex items-center text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </label>

          <button
            onClick={exportConfiguration}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>

          <button
            onClick={saveConfiguration}
            disabled={saving || !hasChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {config.system.maintenanceMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Maintenance Mode is Active</h3>
              <p className="text-sm text-red-700 mt-1">{config.system.maintenanceMessage}</p>
            </div>
            <button
              onClick={toggleMaintenanceMode}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Disable
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-2">
              {configSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{section.label}</div>
                      <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Configuration Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={config.general.siteName}
                      onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={config.general.contactEmail}
                      onChange={(e) => updateConfig('general', 'contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={config.general.siteDescription}
                      onChange={(e) => updateConfig('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={config.general.contactPhone}
                      onChange={(e) => updateConfig('general', 'contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={config.general.timezone}
                      onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Language
                    </label>
                    <select
                      value={config.general.language}
                      onChange={(e) => updateConfig('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={config.general.currency}
                      onChange={(e) => updateConfig('general', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZAR"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={config.general.address}
                      onChange={(e) => updateConfig('general', 'address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Theme
                    </label>
                    <select
                      value={config.appearance.theme}
                      onChange={(e) => updateConfig('appearance', 'theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {themes.map(theme => (
                        <option key={theme.value} value={theme.value}>{theme.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) => updateConfig('appearance', 'primaryColor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={config.appearance.secondaryColor}
                      onChange={(e) => updateConfig('appearance', 'secondaryColor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={config.appearance.logo}
                      onChange={(e) => updateConfig('appearance', 'logo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom CSS
                    </label>
                    <textarea
                      value={config.appearance.customCSS}
                      onChange={(e) => updateConfig('appearance', 'customCSS', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="/* Custom CSS styles */"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Feature Toggles */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Feature Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(config.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-500">
                          {key === 'onlineApplications' && 'Enable online application submissions'}
                          {key === 'appointmentBooking' && 'Allow users to book appointments'}
                          {key === 'documentUpload' && 'Enable document file uploads'}
                          {key === 'emailNotifications' && 'Send email notifications'}
                          {key === 'smsNotifications' && 'Send SMS notifications'}
                          {key === 'whatsappNotifications' && 'Send WhatsApp notifications'}
                          {key === 'pushNotifications' && 'Send push notifications'}
                          {key === 'userRegistration' && 'Allow user account registration'}
                          {key === 'guestAccess' && 'Allow guest access without login'}
                          {key === 'multiLanguage' && 'Enable multi-language support'}
                          {key === 'darkMode' && 'Enable dark mode theme'}
                          {key === 'offlineMode' && 'Enable offline functionality'}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateConfig('features', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        reCAPTCHA Protection
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.security.recaptchaEnabled}
                          onChange={(e) => updateConfig('security', 'recaptchaEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {config.security.recaptchaEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          reCAPTCHA Site Key
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={config.security.recaptchaSiteKey}
                          onChange={(e) => updateConfig('security', 'recaptchaSiteKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          reCAPTCHA Secret Key
                        </label>
                        <input
                          type={showPasswords ? 'text' : 'password'}
                          value={config.security.recaptchaSecretKey}
                          onChange={(e) => updateConfig('security', 'recaptchaSecretKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={config.security.sessionTimeout}
                      onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Complexity
                    </label>
                    <select
                      value={config.security.passwordComplexity}
                      onChange={(e) => updateConfig('security', 'passwordComplexity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="basic">Basic (8+ characters)</option>
                      <option value="medium">Medium (8+ chars, mixed case)</option>
                      <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Rate Limit (per minute)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={config.security.apiRateLimit}
                      onChange={(e) => updateConfig('security', 'apiRateLimit', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Show/Hide Passwords
                    </label>
                    <button
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                      {showPasswords ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Status */}
            {activeSection === 'status' && systemStatus && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                  <button
                    onClick={fetchSystemStatus}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                </div>

                {/* Server Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Server Status</span>
                      <div className={`flex items-center text-${getStatusColor(systemStatus.server.status)}-600`}>
                        {getStatusIcon(systemStatus.server.status)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 capitalize">{systemStatus.server.status}</div>
                    <div className="text-sm text-gray-500">Uptime: {systemStatus.server.uptime}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <Cpu className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{systemStatus.server.cpu}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          systemStatus.server.cpu > 80 ? 'bg-red-500' :
                          systemStatus.server.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemStatus.server.cpu}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      <MemoryStick className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{systemStatus.server.memory}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          systemStatus.server.memory > 80 ? 'bg-red-500' :
                          systemStatus.server.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemStatus.server.memory}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                      <HardDrive className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{systemStatus.server.disk}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          systemStatus.server.disk > 80 ? 'bg-red-500' :
                          systemStatus.server.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemStatus.server.disk}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Database Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Database Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <div className={`flex items-center text-${getStatusColor(systemStatus.database.status)}-600`}>
                          {getStatusIcon(systemStatus.database.status)}
                          <span className="ml-1 capitalize">{systemStatus.database.status}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Connections</span>
                        <span className="font-medium">{systemStatus.database.connections}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Response Time</span>
                        <span className="font-medium">{systemStatus.database.responseTime}ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Services Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(systemStatus.services).map(([service, status]) => (
                      <div key={service} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{service}</span>
                        <div className={`flex items-center text-${getStatusColor(status)}-600`}>
                          {getStatusIcon(status)}
                          <span className="ml-1 text-sm capitalize">{status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maintenance Mode Control */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-600">Put the site in maintenance mode for updates</p>
                    </div>
                    <button
                      onClick={toggleMaintenanceMode}
                      className={`px-4 py-2 rounded-lg text-white font-medium ${
                        config.system.maintenanceMode
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {config.system.maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add other sections here... */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => testNotificationService('email')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Test Email
                    </button>
                    <button
                      onClick={() => testNotificationService('sms')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Test SMS
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Provider
                    </label>
                    <select
                      value={config.notifications.emailProvider}
                      onChange={(e) => updateConfig('notifications', 'emailProvider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {emailProviders.map(provider => (
                        <option key={provider.value} value={provider.value}>{provider.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMS Provider
                    </label>
                    <select
                      value={config.notifications.smsProvider}
                      onChange={(e) => updateConfig('notifications', 'smsProvider', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {smsProviders.map(provider => (
                        <option key={provider.value} value={provider.value}>{provider.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Add more notification settings fields... */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemConfiguration
