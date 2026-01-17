// src/types/admin.ts
export interface Stats {
  applications: {
    total: number;
    submitted: number;
    this_month: number;
    today: number;
  };
  appointments: {
    total: number;
    today: number;
    upcoming_week: number;
    top_services: any[];
  };
  notifications: {
    total: number;
    failed: number;
    email: number;
  };
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
}

export interface Application {
  id: number;
  application_id: string;
  user_id: string | null;
  service_id: string;
  service_title: string;
  applicant_info: string; // JSON string
  status: string;
  priority: string;
  submitted_at: string;
  last_updated: string;
}

export interface Appointment {
  appointment_id: number;
  booked_by: number;
  booked_for_service: number;
  at_counter: number;
  appointment_date: string;
  slot: number;
  appointment_status: string;
  created_at: string;
  updated_at: string;
  counter_name: string;
  center_id: number;
  service_id: number;
  first_name: string;
  last_name: string;
  passport_no: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface AdminStatsResponse {
  stats: Stats;
}

export interface AdminApplicationsResponse {
  applications: Application[];
  pagination: Pagination;
}

export interface AdminAppointmentsResponse {
  appointments: Appointment[];
  pagination: Pagination;
}

// src/types/admin.ts (append)
export interface AppointmentDetails {
  appointment_id: number;
  booked_by: number;
  booked_for_service: number;
  at_counter: number;
  appointment_date: string;
  slot: number;
  appointment_status: string;
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
  duration: number;
  service_name: string;
  service_category: string;
  processing_time: string;
  counter_name: string;
  center_id: number;
  center_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string | null;
  passport_no: string;
  date_of_birth: string;
  nationality: string;
}

export interface AdminAppointmentDetailsResponse {
  appointment: AppointmentDetails;
}

export interface AdminUpdateStatusResponse {
  message: string;
}

// src/types/admin.ts (append)
export interface TimeSlot {
  slot_id: number;
  start_time: string;
  end_time: string;
  duration: number;
  is_active: 1 | 0;
  created_at: string;
  updated_at: string;
}

export interface SlotSettings {
  slot_duration_minutes: number;
  max_appointments_per_slot: number;
  advance_booking_days: number;
  cancellation_hours: number;
}

export interface AdminTimeSlotsResponse {
  slots: TimeSlot[];
  settings: SlotSettings;
  pagination: Pagination;
}

export interface AdminToggleSlotResponse {
  message: string;
  is_active: boolean;
}

export interface AdminBulkToggleResponse {
  message: string;
}

export interface AdminCreateSlotResponse {
  slot_id: number;
  message: string;
}

// src/types/admin.ts (append)
export interface ServiceFeeObject {
  [key: string]: number; // e.g. { standard: 50, express: 100 }
}

export interface ServiceFeeArray {
  type: string;
  amount: number;
}

export type ServiceFee = ServiceFeeObject | ServiceFeeArray[];

export interface Service {
  service_id: number;
  category: string;
  title: string;
  description: string;
  processing_time: string;
  fees: ServiceFee;
  required_documents: string[];
  eligibility_requirements: string[];
  is_active: 1 | 0;
  display_order: number;
  center_ids?: number[];
  created_at: string;
  updated_at: string;
}

export interface AdminServicesResponse {
  services: Service[];
  pagination: Pagination;
}

export interface AdminCreateServiceResponse {
  serviceId: number;
  message: string;
}

export interface AdminToggleServiceResponse {
  message: string;
  isActive: boolean;
}

export interface Center {
  center_id: number;
  name: string;
  city: string;
  address?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  operating_hours?: Record<string, string> | string;
  provides_services?: number[] | string;
  has_counters?: number[] | string;
  latitude?: number;
  longitude?: number;
  is_active?: 0 | 1 | boolean;
  display_order?: number;
  counter_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Counter {
  counter_id: number;
  center_id: number;
  counter_name: string;
  service_handled: number[];
  is_active: 0 | 1;
  updated_at?: string;
}

// src/types/admin.ts (append to existing file)
export interface ServiceDetails {
  service_id: number;
  overview: string; // HTML
  visa_fees: string; // HTML instead of array
  documents_required: string; // HTML instead of array
  photo_specifications: string; // HTML
  processing_time: string; // HTML
  downloads_form: string; // HTML instead of array
  created_at: string;
  updated_at: string;
  service_title?: string;
}

export interface AdminServiceDetailsResponse {
  details: ServiceDetails[];
  pagination: Pagination;
}

export interface AdminCreateServiceDetailsResponse {
  message: string;
}

export interface AdminUpdateServiceDetailsResponse {
  message: string;
}

export interface AdminDeleteServiceDetailsResponse {
  message: string;
}

// Miscellaneous Applications Types
export interface MiscellaneousApplication {
  id: number;
  application_id: string;
  user_id: number;
  service_id: number;
  service_title: string;
  service_category: string;
  full_name: string;
  nationality: string;
  father_name?: string;
  father_nationality?: string;
  mother_name?: string;
  mother_nationality?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  country_of_birth?: string;
  spouse_name?: string;
  spouse_nationality?: string;
  present_address_sa?: string;
  phone_number?: string;
  email_address?: string;
  profession?: string;
  employer_details?: string;
  visa_immigration_status?: string;
  permanent_address_india?: string;
  passport_number?: string;
  passport_validity?: string;
  passport_date_of_issue?: string;
  passport_place_of_issue?: string;
  is_registered_with_mission: 0 | 1;
  registration_number?: string;
  registration_date?: string;
  status: 'submitted' | 'in-progress' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  submitted_at: string;
  updated_at: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_phone?: string;
  file_count?: number;
}

export interface ApplicationFile {
  id: number;
  file_id: string;
  application_id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  uploaded_by?: number;
  uploaded_at: string;
}

export interface MiscellaneousApplicationDetails {
  application: MiscellaneousApplication;
  files: ApplicationFile[];
}

export interface AdminMiscellaneousApplicationsResponse {
  applications: MiscellaneousApplication[];
  pagination: Pagination;
}

export interface AdminMiscellaneousApplicationDetailsResponse {
  application: MiscellaneousApplication;
  files: ApplicationFile[];
}

export interface AdminMiscellaneousApplicationStats {
  total: number;
  by_status: {
    [key: string]: number;
  };
  this_month: number;
  today: number;
  by_service: Array<{
    service_id: number;
    title: string;
    count: number;
  }>;
}