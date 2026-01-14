import mongoose from 'mongoose'

// ==============================================
// PRODUCTION DATABASE CONNECTION
// ==============================================

interface ConnectionOptions {
  useNewUrlParser: boolean
  useUnifiedTopology: boolean
  maxPoolSize: number
  serverSelectionTimeoutMS: number
  socketTimeoutMS: number
  bufferCommands: boolean
  bufferMaxEntries: number
}

class DatabaseConnection {
  private static instance: DatabaseConnection
  private isConnected: boolean = false

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('🔄 Already connected to MongoDB')
      return
    }

    try {
      const mongoUri = process.env.MONGODB_URI
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required')
      }

      const options: ConnectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0 // Disable mongoose buffering
      }

      await mongoose.connect(mongoUri, options)
      this.isConnected = true
      console.log('✅ Connected to MongoDB Atlas')

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error)
        this.isConnected = false
      })

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected')
        this.isConnected = false
      })

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected')
        this.isConnected = true
      })

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error)
      this.isConnected = false
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.disconnect()
      this.isConnected = false
      console.log('✅ Disconnected from MongoDB')
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error)
      throw error
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1
  }
}

// ==============================================
// PRODUCTION DATABASE SCHEMAS
// ==============================================

// User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super-admin'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: 'South Africa' }
    },
    citizenship: String,
    passportNumber: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  preferences: {
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false }
    }
  },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockoutUntil: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'users'
})

// Application Schema
const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  serviceType: { type: String, required: true },
  applicantInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    placeOfBirth: String,
    nationality: String,
    passportNumber: String,
    passportExpiry: Date,
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: String
    }
  },
  documents: [{
    documentType: String,
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    verified: { type: Boolean, default: false }
  }],
  appointmentDetails: {
    appointmentId: String,
    scheduledDate: Date,
    timeSlot: String,
    status: { type: String, enum: ['scheduled', 'confirmed', 'completed', 'cancelled'], default: 'scheduled' }
  },
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'additional-docs-required', 'approved', 'ready-for-collection', 'completed', 'rejected'],
    default: 'submitted'
  },
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: String,
    notes: String
  }],
  fees: {
    serviceAmount: Number,
    processingFee: Number,
    totalAmount: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentReference: String,
    paidAt: Date
  },
  priority: { type: String, enum: ['normal', 'urgent', 'super-urgent'], default: 'normal' },
  notes: String,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'applications'
})

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  applicationId: String,
  userId: String,
  serviceType: String,
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  attendees: [{
    name: String,
    relationship: String,
    idNumber: String
  }],
  requirements: [String],
  checklist: [{
    item: String,
    completed: Boolean,
    verifiedBy: String
  }],
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'appointments'
})

// Content Management Schema
const contentSchema = new mongoose.Schema({
  contentId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['banner', 'announcement', 'service-info', 'faq'], required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  metadata: {
    priority: Number,
    targetPages: [String],
    displayDuration: {
      startDate: Date,
      endDate: Date
    },
    style: {
      backgroundColor: String,
      textColor: String,
      borderColor: String
    }
  },
  isActive: { type: Boolean, default: true },
  language: { type: String, enum: ['en', 'hi', 'both'], default: 'both' },
  createdBy: String,
  updatedBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'content'
})

// System Configuration Schema
const configSchema = new mongoose.Schema({
  configKey: { type: String, required: true, unique: true },
  configValue: mongoose.Schema.Types.Mixed,
  description: String,
  category: String,
  isEditable: { type: Boolean, default: true },
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'system_config'
})

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  userId: String,
  userRole: String,
  resourceType: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: false,
  collection: 'audit_logs'
})

// ==============================================
// EXPORT MODELS AND CONNECTION
// ==============================================

export const dbConnection = DatabaseConnection.getInstance()

// Export models
export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema)
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
export const Content = mongoose.models.Content || mongoose.model('Content', contentSchema)
export const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', configSchema)
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)

// Helper function to ensure database connection
export async function connectDB() {
  try {
    await dbConnection.connect()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Helper function to initialize default data
export async function initializeDefaultData() {
  try {
    await connectDB()

    // Check if admin user exists
    const adminExists = await User.findOne({ role: 'super-admin' })
    if (!adminExists) {
      // Create default admin user
      const defaultAdmin = new User({
        userId: 'admin-001',
        email: 'admin@consular-services-za.com',
        passwordHash: '$2b$12$hashed_password_here', // Replace with actual hashed password
        role: 'super-admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator'
        },
        accountStatus: 'active'
      })
      await defaultAdmin.save()
      console.log('✅ Default admin user created')
    }

    // Initialize system configuration
    const configs = [
      { configKey: 'site_name', configValue: 'Indian Consular Services', category: 'general' },
      { configKey: 'office_hours', configValue: '9:30 AM - 4:30 PM', category: 'general' },
      { configKey: 'appointment_slots_per_day', configValue: 50, category: 'appointments' },
      { configKey: 'max_file_size_mb', configValue: 10, category: 'uploads' },
      { configKey: 'application_processing_days', configValue: 15, category: 'processing' }
    ]

    for (const config of configs) {
      const existingConfig = await SystemConfig.findOne({ configKey: config.configKey })
      if (!existingConfig) {
        await new SystemConfig(config).save()
      }
    }

    console.log('✅ Default system configuration initialized')
    return true
  } catch (error) {
    console.error('Error initializing default data:', error)
    return false
  }
}

export default connectDB
