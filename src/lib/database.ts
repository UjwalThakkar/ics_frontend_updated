import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/indian-consular-services'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

interface GlobalMongoDB {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: GlobalMongoDB | undefined
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts)
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}

export default connectDB

// Application Schema
const ApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  serviceType: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'in-progress', 'ready-for-collection', 'completed', 'rejected'],
    default: 'submitted'
  },
  applicantInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: String,
    nationality: String,
    address: String,
    preferredNotification: { type: String, enum: ['email', 'sms', 'whatsapp'], default: 'email' }
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  fees: {
    amount: Number,
    currency: String,
    paid: { type: Boolean, default: false },
    paymentId: String
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String,
    updatedBy: String
  }],
  processingNotes: String,
  expectedCompletionDate: Date,
  submittedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
})

// Service Schema
const ServiceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  processingTime: String,
  fees: [{
    description: String,
    amount: Number,
    currency: { type: String, default: 'ZAR' }
  }],
  requiredDocuments: [String],
  eligibilityRequirements: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// User Schema
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super-admin'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    department: String
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: String,
    backupCodes: [String]
  },
  sessionTokens: [String],
  lastLogin: Date,
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
})

// Admin Activity Log Schema
const AdminLogSchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  action: { type: String, required: true },
  target: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
})

// File Upload Schema
const FileUploadSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  originalName: String,
  filename: String,
  path: String,
  size: Number,
  mimetype: String,
  uploadedBy: String,
  applicationId: String,
  scanStatus: { type: String, enum: ['pending', 'clean', 'infected'], default: 'pending' },
  scanResults: mongoose.Schema.Types.Mixed,
  uploadedAt: { type: Date, default: Date.now }
})

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true },
  recipient: { type: String, required: true },
  method: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
  subject: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: Date,
  error: String,
  createdAt: { type: Date, default: Date.now }
})

// Export models
export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema)
export const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema)
export const User = mongoose.models.User || mongoose.model('User', UserSchema)
export const AdminLog = mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema)
export const FileUpload = mongoose.models.FileUpload || mongoose.model('FileUpload', FileUploadSchema)
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
