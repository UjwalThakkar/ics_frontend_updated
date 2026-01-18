// src/lib/php-api-client.ts
/**
 * PHP API client for the Indian Consular Appointment System
 * -------------------------------------------------------
 * - Handles login / token persistence
 * - All endpoints used in the 7-step booking wizard
 * - **NEW** Admin panel endpoints (dashboard, applications, appointments)
 * - Automatic Bearer token injection
 * - Simple error handling (throws on API or network errors)
 * - Type-safe response shapes (mirrors Postman spec)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

console.log("API Base URL:", process.env.NEXT_PUBLIC_API_URL);

/* ------------------------------------------------------------------ */
/* Helper Types – match the exact JSON shapes returned by the backend */
/* ------------------------------------------------------------------ */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: { code: string; message: string };
  [key: string]: any;
}

interface LoginResponse {
  token: string;
  csrfToken: string;  // CSRF token for protecting mutating requests
  type: 'user' | 'admin';
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_no?: string;
  };
}

/* -------------------------- ADMIN TYPES --------------------------- */
import {
  Stats,
  Application,
  Appointment,
  Pagination,
  AdminStatsResponse,
  AdminApplicationsResponse,
  AdminAppointmentsResponse,
  AdminAppointmentDetailsResponse,
  AdminUpdateStatusResponse,
  AdminCreateSlotResponse,
  SlotSettings,
  AdminBulkToggleResponse,
  AdminToggleSlotResponse,
  AdminTimeSlotsResponse,
  AdminToggleServiceResponse,
  ServiceFee,
  AdminCreateServiceResponse,
  AdminServicesResponse,
  Service,
  AdminDeleteServiceDetailsResponse,
  AdminUpdateServiceDetailsResponse,
  AdminCreateServiceDetailsResponse,
  ServiceDetails,
  AdminServiceDetailsResponse,
  Counter,
  AdminMiscellaneousApplicationsResponse,
  AdminMiscellaneousApplicationDetailsResponse,
  ApplicationFile,
  AdminMiscellaneousApplicationStats,
} from "@/types/admin";

/* -------------------------- OCR TYPES --------------------------- */
export interface ExtractedData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNo?: string;
  passportExpiry?: string;
  placeOfBirth?: string;
  issuingCountry?: string;
}

interface ConfidenceScores {
  overall: number;
  fields: Record<string, number>;
}

export interface OCRResult {
  success: boolean;
  extracted_data?: ExtractedData;
  confidence?: ConfidenceScores;
  document_type?: string;
  warnings?: string[];
  error?: string;
}

export interface OCRHealthResponse {
  ocr_service: 'available' | 'unavailable';
  tesseract: boolean;
  version?: string;
  message?: string;
}

/* ------------------------------------------------------------------ */
/* Main Client Class                                                  */
/* ------------------------------------------------------------------ */
class PHPAPIClient {
  private csrfToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.csrfToken = localStorage.getItem("csrf_token") ?? null;
    }
  }

  /**
   * Get CSRF token from cookie (set by backend)
   */
  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/ics_csrf_token=([^;]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get the current CSRF token (from memory, localStorage, or cookie)
   */
  getCsrfToken(): string | null {
    return this.csrfToken || this.getCsrfTokenFromCookie();
  }

  /* --------------------------------------------------------------- */
  /* Private request wrapper                                         */
  /* --------------------------------------------------------------- */
  private async request<T>(
    endpoint: string,
    init: RequestInit = {}
  ): Promise<{ data: T }> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };

    // Note: No Bearer token sent. Authentication is handled via HTTP-only cookie.


    // Add CSRF token for mutating requests (POST, PUT, DELETE, PATCH)
    const method = init.method?.toUpperCase() ?? "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      const csrf = this.getCsrfToken();
      if (csrf) {
        headers["X-CSRF-Token"] = csrf;
      }
    }

    console.debug("→", method, url);

    // credentials: 'include' sends HTTP-only cookies automatically
    const res = await fetch(url, {
      ...init,
      headers,
      credentials: "include"  // Required for cookie-based auth!
    });

    const payload: ApiResponse<T> = await res.json();

    if (!res.ok || !payload.success) {
      // Helper to safely extract error message
      let errMsg = "Unknown API error";
      const err = payload.error;

      if (err) {
        if (typeof err === 'string') {
          errMsg = err;
        } else if (typeof err === 'object' && err !== null && 'message' in err) {
          errMsg = (err as any).message;
        }
      } else if (payload.message) {
        errMsg = payload.message;
      }

      console.error("API error:", {
        url,
        method,
        status: res.status,
        statusText: res.statusText,
        errorMessage: errMsg,
        fullPayload: payload,
        responseHeaders: Object.fromEntries(res.headers.entries())
      });
      throw new Error(errMsg);
    }

    return { data: payload as any };
  }

  /* --------------------------------------------------------------- */
  /* Auth                                                            */
  /* --------------------------------------------------------------- */
  async login(
    type: "user" | "admin",
    email: string,
    password: string,
    otp?: string
  ): Promise<LoginResponse> {
    const { data } = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ type, email, password, otp }),
    });

    // We do NOT store auth_token in localStorage anymore.
    // Auth is handled via HTTP-only cookie.

    // Store CSRF token for mutating requests
    if (data.csrfToken) {
      this.csrfToken = data.csrfToken;
      localStorage.setItem("csrf_token", data.csrfToken);
    }

    // Store user data for UI convenience/caching
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  }

  async logout(): Promise<void> {
    try {
      // Call backend to clear HTTP-only cookies
      await this.request("/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout API call failed, clearing local state anyway", e);
    }

    // Clear local state
    this.csrfToken = null;
    localStorage.removeItem("user");
    localStorage.removeItem("csrf_token");
    // Also clean up any legacy token if it exists
    localStorage.removeItem("auth_token");
  }

  /**
   * Send registration OTP
   */
  async sendRegistrationOtp(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; message?: string; expiresAt?: string; error?: string }> {
    const { data } = await this.request<any>("/auth/send-registration-otp", {
      method: "POST",
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return data;
  }

  /**
   * Regenerate registration OTP
   */
  async regenerateRegistrationOtp(
    email: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; message?: string; expiresAt?: string; error?: string }> {
    const { data } = await this.request<any>("/auth/regenerate-registration-otp", {
      method: "POST",
      body: JSON.stringify({ email, firstName, lastName }),
    });
    return data;
  }

  /**
   * Register a new user (with OTP verification)
   */
  async register(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    password: string,
    otp: string
  ): Promise<any> {
    const { data } = await this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        firstName: first_name,
        lastName: last_name,
        email,
        phoneNo: phone,
        password,
        otp,
      }),
    });
    return data;
  }

  /* --------------------------------------------------------------- */
  /* Services                                                        */
  /* --------------------------------------------------------------- */
  async getServices(): Promise<any> {
    return this.request<any>("/booking/services");
  }

  async getCategories(): Promise<any> {
    return this.request<any>("/services/categories");
  }

  async getCentersForService(serviceId: string): Promise<any> {
    return this.request<any>(`/booking/centers/${serviceId}`);
  }

  /* --------------------------------------------------------------- */
  /* User details (prefill)                                          */
  /* --------------------------------------------------------------- */
  async getUserDetails(): Promise<any> {
    return this.request<any>("/auth/me");
  }

  /* --------------------------------------------------------------- */
  /* Dates & Slots                                                   */
  /* --------------------------------------------------------------- */
  async getAvailableDates(centerId: string, serviceId: string): Promise<any> {
    return this.request<any>(
      `/booking/available-dates?centerId=${centerId}&serviceId=${serviceId}`
    );
  }

  async getAvailableSlots(
    centerId: string,
    serviceId: string,
    date: string
  ): Promise<any> {
    return this.request<any>(
      `/booking/available-slots?centerId=${centerId}&serviceId=${serviceId}&date=${date}`
    );
  }

  /* --------------------------------------------------------------- */
  /* Booking                                                         */
  /* --------------------------------------------------------------- */
  async bookAppointment(payload: {
    serviceId: string;
    centerId: string;
    date: string;
    slotId: string;
    userDetails: {
      gender: string;
      dateOfBirth: string;
      nationality: string;
      passportNo: string;
      passportExpiry: string;
      phoneNo: string;
    };
  }): Promise<any> {
    return this.request<any>("/booking/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /* ---------------------------------------------------------------- */
  /* -------------------------- ADMIN PANEL -------------------------- */
  /* ---------------------------------------------------------------- */

  /** @namespace admin */
  admin = {
    /** Dashboard stats */
    getDashboardStats: async (): Promise<AdminStatsResponse> => {
      const { data } = await this.request<AdminStatsResponse>(
        "/admin/dashboard-stats"
      );
      return data;
    },

    /** Applications list (with pagination & optional status filter) */
    getApplications: async (params: {
      page?: number;
      limit?: number;
      status?: string;
    }): Promise<AdminApplicationsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminApplicationsResponse>(
        `/admin/applications?${query}`
      );
      return data;
    },

    /** Appointments list (all filters you showed) */
    getAppointments: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      centerId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    }): Promise<AdminAppointmentsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminAppointmentsResponse>(
        `/admin/appointments?${query}`
      );
      return data;
    },

    getAppointmentDetails: async (
      id: number
    ): Promise<AdminAppointmentDetailsResponse> => {
      const { data } = await this.request<AdminAppointmentDetailsResponse>(
        `/admin/appointments/${id}`
      );
      return data;
    },

    /** Update appointment status */
    updateAppointmentStatus: async (
      id: number,
      status: "completed" | "scheduled" | "cancled" | "no-show"
    ): Promise<AdminUpdateStatusResponse> => {
      const { data } = await this.request<AdminUpdateStatusResponse>(
        `/admin/appointments/${id}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
      return data;
    },

    getTimeSlots: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminTimeSlotsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminTimeSlotsResponse>(
        `/admin/time-slots?${query}`
      );
      return data;
    },

    /** Toggle single slot */
    toggleSlot: async (id: number): Promise<AdminToggleSlotResponse> => {
      const { data } = await this.request<AdminToggleSlotResponse>(
        `/admin/time-slots/${id}/toggle`,
        {
          method: "PUT",
        }
      );
      return data;
    },

    /** Bulk toggle */
    bulkToggleSlots: async (
      slot_ids: number[],
      activate: boolean
    ): Promise<AdminBulkToggleResponse> => {
      const { data } = await this.request<AdminBulkToggleResponse>(
        "/admin/time-slots/bulk-toggle",
        {
          method: "POST",
          body: JSON.stringify({ slot_ids, activate }),
        }
      );
      return data;
    },

    /** Create new slot */
    createSlot: async (payload: {
      start_time: string;
      end_time: string;
      is_active?: 1 | 0;
    }): Promise<AdminCreateSlotResponse> => {
      const { data } = await this.request<AdminCreateSlotResponse>(
        "/admin/time-slots",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update global settings */
    updateSlotSettings: async (
      settings: Partial<SlotSettings>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        "/admin/time-slots/settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        }
      );
      return data;
    },

    /** Delete a time slot */
    deleteSlot: async (id: number): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/time-slots/${id}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },

    /** Bulk create slots – now returns skipped count */
    bulkCreateSlots: async (payload: {
      start_time: string;
      end_time: string;
      duration?: number;
    }): Promise<{
      message: string;
      slots: {
        slot_id: number;
        start_time: string;
        end_time: string;
        duration: number;
      }[];
      skipped: number;
    }> => {
      const { data } = await this.request<any>(
        "/admin/time-slots/bulk-create",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      // Normalize response
      return {
        message: data.message,
        slots: data.slots || [],
        skipped: data.skipped || 0,
      };
    },
    getServices: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminServicesResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminServicesResponse>(
        `/admin/services?${query}`
      );
      return data;
    },

    /** Create service */
    createService: async (payload: {
      category: string;
      title: string;
      description?: string;
      processing_time?: string;
      fees: ServiceFee;
      required_documents?: string[];
      eligibility_requirements?: string[];
      is_active?: 1 | 0;
      display_order?: number;
    }): Promise<AdminCreateServiceResponse> => {
      const { data } = await this.request<AdminCreateServiceResponse>(
        "/admin/services",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update service */
    updateService: async (
      id: number,
      payload: Partial<{
        title: string;
        description: string;
        processing_time: string;
        fees: ServiceFee;
        required_documents: string[];
        eligibility_requirements: string[];
        display_order: number;
      }>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/services/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Toggle service */
    toggleService: async (id: number): Promise<AdminToggleServiceResponse> => {
      const { data } = await this.request<AdminToggleServiceResponse>(
        `/admin/services/${id}/toggle`,
        {
          method: "PUT",
        }
      );
      return data;
    },

    /** Delete service */
    deleteService: async (id: number): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/services/${id}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },

    getService: async (id: number): Promise<{ service: Service }> => {
      const { data } = await this.request<{ service: Service }>(
        `/admin/services/${id}`
      );
      return data;
    },

    getActiveCenters: async (): Promise<{
      centers: { center_id: number; name: string; city: string }[];
    }> => {
      const { data } = await this.request<any>(`/centers`);
      return { centers: data.centers || data }; // adjust based on actual response shape
    },

    getCenterServices: async (centerId: number): Promise<{ services: Service[] }> => {
      const { data } = await this.request<{ services: Service[] }>(
        `/admin/centers/${centerId}/services`
      );
      return data;
    },

    // Verification Centers Management
    getCenters: async (params?: {
      page?: number;
      limit?: number;
    }): Promise<{
      centers: Center[];
      pagination?: Pagination;
    }> => {
      const query = params
        ? new URLSearchParams(
            Object.entries(params)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, String(v)])
          ).toString()
        : "";
      const { data } = await this.request<{
        centers: Center[];
        pagination?: Pagination;
      }>(`/admin/centers${query ? `?${query}` : ""}`);
      return data;
    },

    createCenter: async (payload: {
      name: string;
      address: string;
      city: string;
      country: string;
      state?: string;
      postalCode?: string;
      phone?: string;
      email?: string;
      operatingHours?: Record<string, string>;
      providesServices?: number[];
      hasCounters?: number[];
      latitude?: number;
      longitude?: number;
      isActive?: boolean;
      displayOrder?: number;
    }): Promise<{ message: string; centerId: number }> => {
      const { data } = await this.request<{ message: string; centerId: number }>(
        "/admin/centers",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    updateCenter: async (
      id: number,
      payload: Partial<{
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        phone: string;
        email: string;
        operatingHours: Record<string, string>;
        providesServices: number[];
        latitude: number;
        longitude: number;
        isActive: boolean;
        displayOrder: number;
      }>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/centers/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    toggleCenter: async (
      id: number
    ): Promise<{ message: string; isActive: boolean }> => {
      const { data } = await this.request<{
        message: string;
        isActive: boolean;
      }>(`/admin/centers/${id}/toggle`, { method: "POST" });
      return data;
    },
    getCounters: async (): Promise<{ counters: Counter[] }> => {
      const { data } = await this.request<{ counters: Counter[] }>(
        "/admin/counters"
      );
      return data;
    },

    createCounter: async (payload: {
      center_id: number;
      counter_name: string;
      service_handled?: number[];
      is_active?: 1 | 0;
    }): Promise<{ message: string; counterId: number }> => {
      console.log("API Client: createCounter called with payload:", payload);
      try {
        const { data } = await this.request<{ message: string; counterId: number }>(
          "/admin/counters",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        console.log("API Client: createCounter success:", data);
        return data;
      } catch (error) {
        console.error("API Client: createCounter error:", error);
        throw error;
      }
    },

    toggleCounter: async (
      id: number
    ): Promise<{ message: string; isActive: boolean }> => {
      const { data } = await this.request<{
        message: string;
        isActive: boolean;
      }>(`/admin/counters/${id}/toggle`, { method: "POST" });
      return data;
    },

    getCounter: async (id: number): Promise<{ counter: Counter }> => {
      const { data } = await this.request<{ counter: Counter }>(
        `/admin/counters/${id}`
      );
      return data;
    },

    updateCounter: async (
      id: number,
      payload: Partial<Counter>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/counters/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Get all service details */
    getServiceDetails: async (params: {
      page?: number;
      limit?: number;
    }): Promise<AdminServiceDetailsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminServiceDetailsResponse>(
        `/admin/service-details?${query}`
      );
      return data;
    },

    /** Get single service details */
    getServiceDetail: async (
      serviceId: number
    ): Promise<{ details: ServiceDetails }> => {
      const { data } = await this.request<{ details: ServiceDetails }>(
        `/service-details/${serviceId}`
      );
      console.log("details fetched from api client", data);
      return data;
    },

    /** Create service details */
    createServiceDetails: async (payload: {
      serviceId: number;
      overview: string;
      visaFees: string;
      documentsRequired: string;
      photoSpecifications: string;
      processingTime: string;
      downloadsForm: string;
    }): Promise<AdminCreateServiceDetailsResponse> => {
      const { data } = await this.request<AdminCreateServiceDetailsResponse>(
        "/admin/service-details",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Update service details */
    updateServiceDetails: async (
      serviceId: number,
      payload: Partial<{
        overview: string;
        visaFees: string;
        documentsRequired: string;
        photoSpecifications: string;
        processingTime: string;
        downloadsForm: string;
      }>
    ): Promise<AdminUpdateServiceDetailsResponse> => {
      const { data } = await this.request<AdminUpdateServiceDetailsResponse>(
        `/admin/service-details/${serviceId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    /** Delete service details */
    deleteServiceDetails: async (
      serviceId: number
    ): Promise<AdminDeleteServiceDetailsResponse> => {
      const { data } = await this.request<AdminDeleteServiceDetailsResponse>(
        `/admin/service-details/${serviceId}`,
        {
          method: "DELETE",
        }
      );
      return data;
    },

    /** Miscellaneous Applications */
    getMiscellaneousApplications: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      service_id?: number;
      user_id?: number;
      date_from?: string;
      date_to?: string;
      search?: string;
      sort_by?: string;
      sort_order?: 'ASC' | 'DESC';
    }): Promise<AdminMiscellaneousApplicationsResponse> => {
      const query = new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => [k, String(v)])
      ).toString();

      const { data } = await this.request<AdminMiscellaneousApplicationsResponse>(
        `/admin/applications/miscellaneous?${query}`
      );
      return data;
    },

    getMiscellaneousApplicationDetails: async (
      applicationId: string
    ): Promise<AdminMiscellaneousApplicationDetailsResponse> => {
      const { data } = await this.request<AdminMiscellaneousApplicationDetailsResponse>(
        `/admin/applications/miscellaneous/${applicationId}`
      );
      return data;
    },

    updateMiscellaneousApplication: async (
      applicationId: string,
      payload: Partial<{
        full_name: string;
        nationality: string;
        father_name: string;
        father_nationality: string;
        mother_name: string;
        mother_nationality: string;
        date_of_birth: string;
        place_of_birth: string;
        country_of_birth: string;
        spouse_name: string;
        spouse_nationality: string;
        present_address_sa: string;
        phone_number: string;
        email_address: string;
        profession: string;
        employer_details: string;
        visa_immigration_status: string;
        permanent_address_india: string;
        passport_number: string;
        passport_validity: string;
        passport_date_of_issue: string;
        passport_place_of_issue: string;
        is_registered_with_mission: boolean;
        registration_number: string;
        registration_date: string;
        status: string;
        admin_notes: string;
      }>
    ): Promise<{ message: string }> => {
      const { data } = await this.request<{ message: string }>(
        `/admin/applications/miscellaneous/${applicationId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return data;
    },

    getMiscellaneousApplicationFile: async (
      applicationId: string,
      fileId: string
    ): Promise<{ file: ApplicationFile }> => {
      const { data } = await this.request<{ file: ApplicationFile }>(
        `/admin/applications/miscellaneous/${applicationId}/files/${fileId}`
      );
      return data;
    },

    downloadMiscellaneousApplicationFile: async (
      applicationId: string,
      fileId: string
    ): Promise<Blob> => {
      const url = `${API_BASE_URL}/admin/applications/miscellaneous/${applicationId}/files/${fileId}/download`;
      const headers: Record<string, string> = {};
      
      const csrf = this.getCsrfToken();
      if (csrf) {
        headers['X-CSRF-Token'] = csrf;
      }

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to download file');
      }

      return res.blob();
    },

    getMiscellaneousApplicationStats: async (): Promise<{
      stats: AdminMiscellaneousApplicationStats;
    }> => {
      const { data } = await this.request<{ stats: AdminMiscellaneousApplicationStats }>(
        `/admin/applications/miscellaneous/stats`
      );
      return data;
    },
  };

  /* --------------------------------------------------------------- */
  /* Miscellaneous Applications (User)                               */
  /* --------------------------------------------------------------- */

  /**
   * Submit miscellaneous application
   */
  async submitMiscellaneousApplication(payload: {
    service_id: number;
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
    phone_number: string;
    email_address: string;
    profession?: string;
    employer_details?: string;
    visa_immigration_status?: string;
    permanent_address_india?: string;
    passport_number?: string;
    passport_validity?: string;
    passport_date_of_issue?: string;
    passport_place_of_issue?: string;
    is_registered_with_mission?: boolean;
    registration_number?: string;
    registration_date?: string;
  }, files?: { [key: string]: File | File[] }): Promise<{
    success: boolean;
    application_id: string;
    message: string;
    files_uploaded: number;
    service_title: string;
    filled_pdf_path?: string;
    filled_pdf_url?: string;
  }> {
    const formData = new FormData();

    // Add all form fields
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Add files
    if (files) {
      Object.entries(files).forEach(([fieldName, fileOrFiles]) => {
        if (Array.isArray(fileOrFiles)) {
          fileOrFiles.forEach((file) => {
            formData.append(fieldName + '[]', file);
          });
        } else {
          formData.append(fieldName, fileOrFiles);
        }
      });
    }

    const url = `${API_BASE_URL}/applications/miscellaneous/submit`;
    const headers: Record<string, string> = {};

    // Add CSRF token
    const csrf = this.getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers,
    });

    const response = await res.json();

    if (!res.ok || !response.success) {
      const errMsg = response.error || response.message || 'Failed to submit application';
      throw new Error(errMsg);
    }

    return response.data || response;
  }

  /**
   * Download filled PDF form for a miscellaneous application
   * @param applicationId The application ID
   */
  async downloadFilledPdf(applicationId: string): Promise<Blob> {
    const url = `${API_BASE_URL}/applications/miscellaneous/${applicationId}/filled-pdf`;
    const headers: Record<string, string> = {};

    const csrf = this.getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to download PDF' }));
      throw new Error(error.error || 'Failed to download PDF');
    }

    return await res.blob();
  }

  /**
   * Track miscellaneous application status
   * @param applicationId The application ID
   */
  async trackMiscellaneousApplication(applicationId: string): Promise<{
    application_id: string;
    status: string;
    service_type: string;
    submitted_at: string;
    expected_completion: string;
    timeline: Array<{
      name: string;
      completed: boolean;
      current: boolean;
      date?: string;
    }>;
    admin_notes?: string | null;
  }> {
    // Pass just the endpoint path, not the full URL
    const { data } = await this.request<{
      application_id: string;
      status: string;
      service_type: string;
      submitted_at: string;
      expected_completion: string;
      timeline: Array<{
        name: string;
        completed: boolean;
        current: boolean;
        date?: string;
      }>;
      admin_notes?: string | null;
    }>(`/applications/miscellaneous/${applicationId}/track`);
    return data;
  }

  /* --------------------------------------------------------------- */
  /* OCR Document Extraction                                         */
  /* --------------------------------------------------------------- */

  /**
   * Extract data from an uploaded document using OCR.
   * @param file The document file (JPG, PNG, or PDF)
   * @param documentType Either 'passport' or 'birth_certificate'
   */
  async extractFromDocument(
    file: File,
    documentType: 'passport' | 'birth_certificate'
  ): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const url = `${API_BASE_URL}/ocr/extract`;
    const headers: Record<string, string> = {};

    // Add CSRF token
    const csrf = this.getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers,
    });

    const payload = await res.json();

    if (!res.ok || !payload.success) {
      const errMsg = payload.error || payload.message || 'OCR extraction failed';
      throw new Error(errMsg);
    }

    return payload;
  }

  /**
   * Check OCR service health status.
   */
  async getOcrHealth(): Promise<OCRHealthResponse> {
    const { data } = await this.request<OCRHealthResponse>('/ocr/health');
    return data;
  }
}

/* ------------------------------------------------------------------ */
/* Exported singleton (recommended usage)                              */
/* ------------------------------------------------------------------ */
export const phpAPI = new PHPAPIClient();

export default PHPAPIClient;
