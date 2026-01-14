'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Shield,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserMinus,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Ban,
  UserCheck,
  Crown,
  Star,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  LogIn,
  LogOut,
  MoreVertical
} from 'lucide-react'

interface User {
  id: string
  userId: string
  email: string
  role: 'user' | 'admin' | 'super-admin'
  profile: {
    firstName: string
    lastName: string
    phone?: string
    department?: string
    position?: string
    avatar?: string
  }
  twoFactorAuth: {
    enabled: boolean
    secret?: string
    backupCodes?: string[]
  }
  sessionTokens: string[]
  lastLogin?: string
  lastActivity?: string
  loginCount: number
  accountStatus: 'active' | 'inactive' | 'suspended' | 'locked'
  permissions: string[]
  createdAt: string
  updatedAt: string
  ipAddress?: string
  userAgent?: string
  loginHistory: Array<{
    timestamp: string
    ip: string
    userAgent: string
    success: boolean
    location?: string
  }>
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  userCount: number
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  isSystemPermission: boolean
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showPasswords, setShowPasswords] = useState(false)
  const [bulkSelected, setBulkSelected] = useState<string[]>([])

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'roles', label: 'Roles', icon: Shield, count: roles.length },
    { id: 'permissions', label: 'Permissions', icon: Key, count: permissions.length },
    { id: 'activity', label: 'Activity', icon: Activity, count: 0 }
  ]

  const userRoles = [
    { value: 'user', label: 'User', color: 'blue', icon: Users },
    { value: 'admin', label: 'Admin', color: 'purple', icon: Shield },
    { value: 'super-admin', label: 'Super Admin', color: 'red', icon: Crown }
  ]

  const userStatuses = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'suspended', label: 'Suspended', color: 'yellow' },
    { value: 'locked', label: 'Locked', color: 'red' }
  ]

  const permissionCategories = [
    'Application Management',
    'Service Management',
    'Content Management',
    'User Management',
    'System Configuration',
    'Analytics & Reports',
    'Notification Management',
    'Calendar Management'
  ]

  const defaultPermissions = [
    { id: 'view_applications', name: 'View Applications', category: 'Application Management' },
    { id: 'edit_applications', name: 'Edit Applications', category: 'Application Management' },
    { id: 'delete_applications', name: 'Delete Applications', category: 'Application Management' },
    { id: 'bulk_update_applications', name: 'Bulk Update Applications', category: 'Application Management' },
    { id: 'manage_services', name: 'Manage Services', category: 'Service Management' },
    { id: 'manage_content', name: 'Manage Content', category: 'Content Management' },
    { id: 'manage_users', name: 'Manage Users', category: 'User Management' },
    { id: 'manage_roles', name: 'Manage Roles', category: 'User Management' },
    { id: 'system_config', name: 'System Configuration', category: 'System Configuration' },
    { id: 'view_analytics', name: 'View Analytics', category: 'Analytics & Reports' },
    { id: 'export_data', name: 'Export Data', category: 'Analytics & Reports' },
    { id: 'send_notifications', name: 'Send Notifications', category: 'Notification Management' },
    { id: 'manage_calendar', name: 'Manage Calendar', category: 'Calendar Management' }
  ]

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'users':
          await fetchUsers()
          break
        case 'roles':
          await fetchRoles()
          break
        case 'permissions':
          await fetchPermissions()
          break
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    const data = await response.json()
    if (data.success) {
      setUsers(data.users)
    }
  }

  const fetchRoles = async () => {
    const response = await fetch('/api/admin/roles')
    const data = await response.json()
    if (data.success) {
      setRoles(data.roles)
    }
  }

  const fetchPermissions = async () => {
    const response = await fetch('/api/admin/permissions')
    const data = await response.json()
    if (data.success) {
      setPermissions(data.permissions)
    }
  }

  const saveUser = async () => {
    if (!editingUser) return

    try {
      const isNew = !editingUser.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
        setShowUserModal(false)
        setEditingUser(null)
        alert(`User ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save user: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user')
    }
  }

  const saveRole = async () => {
    if (!editingRole) return

    try {
      const isNew = !editingRole.id
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch('/api/admin/roles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRole)
      })

      const data = await response.json()
      if (data.success) {
        fetchRoles()
        setShowRoleModal(false)
        setEditingRole(null)
        alert(`Role ${isNew ? 'created' : 'updated'} successfully!`)
      } else {
        alert('Failed to save role: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save role:', error)
      alert('Failed to save role')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
        alert('User deleted successfully!')
      } else {
        alert('Failed to delete user: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
        alert(`User ${status} successfully!`)
      } else {
        alert('Failed to update user status: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
      alert('Failed to update user status')
    }
  }

  const resetUser2FA = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s 2FA? They will need to set it up again.')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-2fa`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
        alert('2FA reset successfully!')
      } else {
        alert('Failed to reset 2FA: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to reset 2FA:', error)
      alert('Failed to reset 2FA')
    }
  }

  const bulkUpdateUsers = async (action: string) => {
    if (bulkSelected.length === 0) {
      alert('Please select users first')
      return
    }

    const actionText = action === 'activate' ? 'activate' :
                      action === 'suspend' ? 'suspend' :
                      action === 'delete' ? 'delete' : action

    if (!confirm(`Are you sure you want to ${actionText} ${bulkSelected.length} selected users?`)) return

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: bulkSelected, action })
      })

      const data = await response.json()
      if (data.success) {
        fetchUsers()
        setBulkSelected([])
        alert(`${bulkSelected.length} users ${actionText}d successfully!`)
      } else {
        alert('Bulk operation failed: ' + data.error)
      }
    } catch (error) {
      console.error('Bulk operation failed:', error)
      alert('Bulk operation failed')
    }
  }

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }

  const getRoleInfo = (role: string) => {
    return userRoles.find(r => r.value === role) || userRoles[0]
  }

  const getStatusColor = (status: string) => {
    return userStatuses.find(s => s.value === status)?.color || 'gray'
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

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  const toggleBulkSelect = (userId: string) => {
    setBulkSelected(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleSelectAll = () => {
    const filteredUsers = getFilteredUsers()
    if (bulkSelected.length === filteredUsers.length) {
      setBulkSelected([])
    } else {
      setBulkSelected(filteredUsers.map(user => user.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage users, roles, and permissions
          </p>
        </div>

        <div className="flex gap-2">
          {bulkSelected.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-gray-600">{bulkSelected.length} selected</span>
              <select
                onChange={(e) => e.target.value && bulkUpdateUsers(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
                defaultValue=""
              >
                <option value="">Bulk Actions</option>
                <option value="activate">Activate</option>
                <option value="suspend">Suspend</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          )}

          <button
            onClick={() => {
              setEditingUser({
                id: '',
                userId: '',
                email: '',
                role: 'user',
                profile: {
                  firstName: '',
                  lastName: '',
                  phone: '',
                  department: '',
                  position: ''
                },
                twoFactorAuth: {
                  enabled: false
                },
                sessionTokens: [],
                loginCount: 0,
                accountStatus: 'active',
                permissions: [],
                createdAt: '',
                updatedAt: '',
                loginHistory: []
              })
              setShowUserModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* User Management Tabs */}
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
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Roles</option>
                  {userRoles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  {userStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600 flex items-center">
                {getFilteredUsers().length} of {users.length} users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={bulkSelected.length === getFilteredUsers().length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Loading users...
                      </td>
                    </tr>
                  ) : getFilteredUsers().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    getFilteredUsers().map((user) => {
                      const roleInfo = getRoleInfo(user.role)
                      const RoleIcon = roleInfo.icon

                      return (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={bulkSelected.includes(user.id)}
                              onChange={() => toggleBulkSelect(user.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {user.profile.avatar ? (
                                <img
                                  src={user.profile.avatar}
                                  alt={`${user.profile.firstName} ${user.profile.lastName}`}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.profile.firstName[0]}{user.profile.lastName[0]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.profile.firstName} {user.profile.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.profile.department && (
                                  <div className="text-xs text-gray-400">{user.profile.department}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {roleInfo.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {user.permissions.length} permissions
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(user.accountStatus)}-100 text-${getStatusColor(user.accountStatus)}-800`}>
                                {user.accountStatus === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {user.accountStatus === 'suspended' && <AlertCircle className="h-3 w-3 mr-1" />}
                                {user.accountStatus === 'locked' && <Lock className="h-3 w-3 mr-1" />}
                                {user.accountStatus === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                                {user.accountStatus.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {user.lastLogin ? (
                                  <>Last: {getRelativeTime(user.lastLogin)}</>
                                ) : (
                                  'Never logged in'
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.loginCount} logins
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className={`flex items-center text-xs ${
                                user.twoFactorAuth.enabled ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                <Shield className="h-3 w-3 mr-1" />
                                2FA {user.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.sessionTokens.length} active sessions
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowDetailsModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingUser(user)
                                  setShowUserModal(true)
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              {user.accountStatus === 'active' ? (
                                <button
                                  onClick={() => updateUserStatus(user.id, 'suspended')}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Suspend User"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateUserStatus(user.id, 'active')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activate User"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}

                              {user.twoFactorAuth.enabled && (
                                <button
                                  onClick={() => resetUser2FA(user.id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Reset 2FA"
                                >
                                  <Key className="h-4 w-4" />
                                </button>
                              )}

                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Roles & Permissions</h3>
              <p className="text-sm text-gray-600">Define user roles and their associated permissions</p>
            </div>

            <button
              onClick={() => {
                setEditingRole({
                  id: '',
                  name: '',
                  description: '',
                  permissions: [],
                  isActive: true,
                  userCount: 0
                })
                setShowRoleModal(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingRole(role)
                        setShowRoleModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <div className={`w-2 h-2 rounded-full ${role.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Users:</span>
                    <span className="font-medium">{role.userCount}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Permissions:</span>
                    <span className="font-medium">{role.permissions.length}</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    {role.permissions.slice(0, 3).map(permission => (
                      <span key={permission} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-gray-400">+{role.permissions.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">System Permissions</h3>
            <p className="text-sm text-gray-600">Manage available permissions for user roles</p>
          </div>

          <div className="space-y-6">
            {permissionCategories.map((category) => {
              const categoryPermissions = permissions.filter(p => p.category === category)

              return (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">{category}</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                        {permission.isSystemPermission && (
                          <div className="text-xs text-orange-600 font-medium">SYSTEM</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                User Details - {selectedUser.profile.firstName} {selectedUser.profile.lastName}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Profile Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedUser.profile.firstName} {selectedUser.profile.lastName}</div>
                    <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedUser.profile.phone || 'Not provided'}</div>
                    <div><span className="font-medium">Department:</span> {selectedUser.profile.department || 'Not specified'}</div>
                    <div><span className="font-medium">Position:</span> {selectedUser.profile.position || 'Not specified'}</div>
                    <div><span className="font-medium">Role:</span> {getRoleInfo(selectedUser.role).label}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Account Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><span className="font-medium">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(selectedUser.accountStatus)}-100 text-${getStatusColor(selectedUser.accountStatus)}-800`}>
                        {selectedUser.accountStatus.toUpperCase()}
                      </span>
                    </div>
                    <div><span className="font-medium">Created:</span> {formatDate(selectedUser.createdAt)}</div>
                    <div><span className="font-medium">Last Login:</span> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</div>
                    <div><span className="font-medium">Login Count:</span> {selectedUser.loginCount}</div>
                    <div><span className="font-medium">2FA Status:</span>
                      <span className={`ml-2 ${selectedUser.twoFactorAuth.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {selectedUser.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedUser.permissions.map((permission) => (
                    <span key={permission} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>

              {/* Login History */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Login History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedUser.loginHistory.slice(0, 10).map((login, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(login.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {login.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              login.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {login.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {login.location || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editingUser.id ? 'Edit User' : 'Create User'}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.profile.firstName}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      profile: { ...editingUser.profile, firstName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.profile.lastName}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      profile: { ...editingUser.profile, lastName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {userRoles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.accountStatus}
                    onChange={(e) => setEditingUser({ ...editingUser, accountStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {userStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingUser.profile.phone || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      profile: { ...editingUser.profile, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingUser.profile.department || ''}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      profile: { ...editingUser.profile, department: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {defaultPermissions.map((permission) => (
                    <label key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingUser.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingUser({
                              ...editingUser,
                              permissions: [...editingUser.permissions, permission.id]
                            })
                          } else {
                            setEditingUser({
                              ...editingUser,
                              permissions: editingUser.permissions.filter(p => p !== permission.id)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-700">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingUser.id ? 'Update User' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {showRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editingRole.id ? 'Edit Role' : 'Create Role'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {permissionCategories.map((category) => {
                    const categoryPermissions = defaultPermissions.filter(p => p.category === category)

                    return (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-1 ml-4">
                          {categoryPermissions.map((permission) => (
                            <label key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editingRole.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingRole({
                                      ...editingRole,
                                      permissions: [...editingRole.permissions, permission.id]
                                    })
                                  } else {
                                    setEditingRole({
                                      ...editingRole,
                                      permissions: editingRole.permissions.filter(p => p !== permission.id)
                                    })
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <span className="text-sm text-gray-700">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingRole.isActive}
                    onChange={(e) => setEditingRole({ ...editingRole, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Role</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRole.id ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
