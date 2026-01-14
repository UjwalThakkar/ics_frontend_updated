// components/ServiceManagement.tsx (modified to use phpAPI.admin methods)
'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  FileText,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react'
import { phpAPI } from '@/lib/php-api-client' // Adjust path as needed

interface ServiceFee {
  description: string
  amount: number
  currency: string
}

interface Service {
  _id?: string
  id?: number // Adjust if backend uses number
  serviceId: string
  category: string
  title: string
  description: string
  processingTime: string
  fees: ServiceFee[]
  requiredDocuments: string[]
  eligibilityRequirements: string[]
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isNewService, setIsNewService] = useState(false)

  const categories = [
    'Passport Services',
    'Visa Services',
    'Police Clearance Certificate',
    'Consular Services',
    'OCI Related Services',
    'Document Attestation',
    'Special Services'
  ]

  const defaultService: Service = {
    serviceId: '',
    category: categories[0],
    title: '',
    description: '',
    processingTime: '',
    fees: [{ description: 'Standard Fee', amount: 0, currency: 'ZAR' }],
    requiredDocuments: [''],
    eligibilityRequirements: [''],
    isActive: true
  }

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm, categoryFilter, statusFilter])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await phpAPI.admin.getServices({ limit: 1000 }) // Fetch all, adjust limit as needed
      setServices(response.services) // From AdminServicesResponse
    } catch (error) {
      console.error('Failed to fetch services:', error)
      alert('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = services

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(service => service.isActive === isActive)
    }

    setFilteredServices(filtered)
  }

  const openEditModal = async (service?: Service) => {
    if (service) {
      // For edit, fetch full details if needed
      try {
        const fullService = await phpAPI.admin.getService(service.id || parseInt(service._id)) // Adjust ID type
        setEditingService(fullService.service)
      } catch (error) {
        setEditingService({ ...service })
      }
      setIsNewService(false)
    } else {
      setEditingService({ ...defaultService })
      setIsNewService(true)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setEditingService(null)
    setShowModal(false)
    setIsNewService(false)
  }

  const saveService = async () => {
    if (!editingService) return

    // Validation
    if (!editingService.serviceId || !editingService.title || !editingService.category) {
      alert('Please fill in all required fields')
      return
    }

    // Check for duplicate service ID (for new services)
    if (isNewService && services.some(s => s.serviceId === editingService.serviceId)) {
      alert('Service ID already exists')
      return
    }

    try {
      if (isNewService) {
        await phpAPI.admin.createService({
          category: editingService.category,
          title: editingService.title,
          description: editingService.description,
          processing_time: editingService.processingTime,
          fees: editingService.fees, // Assume array accepted, fix if singular
          required_documents: editingService.requiredDocuments,
          eligibility_requirements: editingService.eligibilityRequirements,
          is_active: editingService.isActive ? 1 : 0
        })
      } else {
        await phpAPI.admin.updateService(editingService.id || parseInt(editingService._id), {
          title: editingService.title,
          description: editingService.description,
          processing_time: editingService.processingTime,
          fees: editingService.fees,
          required_documents: editingService.requiredDocuments,
          eligibility_requirements: editingService.eligibilityRequirements
        })
      }
      fetchServices()
      closeModal()
      alert(`Service ${isNewService ? 'created' : 'updated'} successfully!`)
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service')
    }
  }

  const deleteService = async (serviceId: number | string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await phpAPI.admin.deleteService(typeof serviceId === 'string' ? parseInt(serviceId) : serviceId)
      fetchServices()
      alert('Service deleted successfully!')
    } catch (error) {
      console.error('Failed to delete service:', error)
      alert('Failed to delete service')
    }
  }

  const toggleServiceStatus = async (service: Service) => {
    try {
      await phpAPI.admin.toggleService(service.id || parseInt(service._id))
      fetchServices()
      alert(`Service ${!service.isActive ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Failed to update service status:', error)
      alert('Failed to update service status')
    }
  }

  // ... rest of the code (exportServices, importServices, addArrayItem, etc.) remains similar
  // Note: For importServices, you may need to adjust to use API for bulk, but kept as local for now

  return (
    // ... JSX remains the same, adjust service.id to service.id || service._id if needed
    // In map, key={service.id || service._id}
    // In deleteService(service.id || service._id)
    // In toggleServiceStatus(service)
  )
}

export default ServiceManagement