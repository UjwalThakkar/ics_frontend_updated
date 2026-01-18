// src/pages/admin/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { phpAPI } from "@/lib/php-api-client";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import { Center, Counter } from "@/types/admin";
import ApplicationFilters from "@/components/admin/applications/ApplicationFilters";
import ApplicationsTable from "@/components/admin/applications/ApplicationsTable";
import AppointmentFilters from "@/components/admin/appointments/AppointmentFilters";
import AppointmentsTable from "@/components/admin/appointments/AppointmentsTable";
import {
  Stats,
  Application,
  Appointment,
  Pagination,
  TimeSlot,
  SlotSettings,
  Service,
  ServiceDetails,
} from "@/types/admin";
import { Loader2, AlertCircle, Calendar, FileText } from "lucide-react";
import SlotsTable from "./admin/slots/SlotsTable";
import CreateSlotModal from "./admin/slots/CreateSlotModal";
import BulkToggleModal from "./admin/slots/BulkToggleModal";
import SlotSettingsForm from "./admin/slots/SlotSettingsForm";
import BulkCreateSlotsModal from "./admin/slots/BulkCreateSlotsModal";
import CreateServiceModal from "./admin/services/CreateServiceModal";
import ServicesTable from "./admin/services/ServicesTable";
import CountersTable from "./admin/counters/CountersTable";
import CreateCounterModal from "./admin/counters/CreateCounterModal";
import CreateServiceDetailsModal from "./admin/service-details/CreateServiceDetailsModal";
import ServiceDetailsTable from "./admin/service-details/ServiceDetailsTable";
import MiscellaneousApplicationsManagement from "./admin/applications/miscellaneous/MiscellaneousApplicationsManagement";
import VerificationCentersTable from "./admin/verification-centers/VerificationCentersTable";
import CreateVerificationCenterModal from "./admin/verification-centers/CreateVerificationCenterModal";
import EmailTemplatesManagement from "./admin/EmailTemplatesManagement";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Shared
  const [error, setError] = useState<string | null>(null);

  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null);
  // const [loadingStats, setLoadingStats] = useState(true);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [appPagination, setAppPagination] = useState<Pagination | null>(null);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appPage, setAppPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptPagination, setApptPagination] = useState<Pagination | null>(null);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [apptPage, setApptPage] = useState(1);
  const [apptSearch, setApptSearch] = useState("");
  const [apptStatus, setApptStatus] = useState("");
  const [apptCenterId, setApptCenterId] = useState("");
  const [apptDateFrom, setApptDateFrom] = useState("");
  const [apptDateTo, setApptDateTo] = useState("");

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotSettings, setSlotSettings] = useState<SlotSettings | null>(null);
  const [slotPagination, setSlotPagination] = useState<Pagination | null>(null);
  const [slotPage, setSlotPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);

  const [serviceDetails, setServiceDetails] = useState<ServiceDetails[]>([]);
  const [serviceDetailsPagination, setServiceDetailsPagination] =
    useState<Pagination | null>(null);
  const [serviceDetailsPage, setServiceDetailsPage] = useState(1);
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  const [showCreateServiceDetails, setShowCreateServiceDetails] =
    useState(false);

  // service state
  const [services, setServices] = useState<Service[]>([]);
  const [servicePagination, setServicePagination] = useState<Pagination | null>(
    null
  );
  const [servicePage, setServicePage] = useState(1);
  const [showCreateService, setShowCreateService] = useState(false);

  // NEW: Counters
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loadingCounters, setLoadingCounters] = useState(false);
  const [showCreateCounter, setShowCreateCounter] = useState(false);

  // NEW: Global centers (fetched once)
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingGlobalCenters, setLoadingGlobalCenters] = useState(true);

  // NEW: Verification Centers
  const [verificationCenters, setVerificationCenters] = useState<Center[]>([]);
  const [loadingVerificationCenters, setLoadingVerificationCenters] = useState(false);
  const [showCreateVerificationCenter, setShowCreateVerificationCenter] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAppointments = () => setRefreshTrigger((p) => p + 1);
  const refreshSlots = () => setRefreshTrigger((p) => p + 1);
  const refreshServices = () => setRefreshTrigger((p) => p + 1);
  const refreshCounters = () => setRefreshTrigger((p) => p + 1);
  const refreshServiceDetails = () => setRefreshTrigger((p) => p + 1);
  const refreshVerificationCenters = () => setRefreshTrigger((p) => p + 1);



  // Fetch global centers once
  useEffect(() => {
    const fetchCenters = async () => {
      setLoadingGlobalCenters(true);
      try {
        const res = await phpAPI.admin.getActiveCenters();
        setCenters(res.centers || []);
      } catch {
        setError("Failed to load centers");
      } finally {
        setLoadingGlobalCenters(false);
      }
    };
    fetchCenters();
  }, []);

  // Fetch Stats
  // useEffect(() => {
  //   const fetchStats = async () => {
  //     setLoadingStats(true);
  //     try {
  //       const res = await phpAPI.admin.getDashboardStats();
  //       if (res.success) setStats(res.stats);
  //     } catch (err: any) {
  //       setError(err.message || "Failed to load stats");
  //     } finally {
  //       setLoadingStats(false);
  //     }
  //   };
  //   fetchStats();
  // }, []);

  useEffect(() => {
    if (activeTab !== "services") return;

    const fetch = async () => {
      setLoadingAppts(true); // reuse loading state
      try {
        const res = await phpAPI.admin.getServices({
          page: servicePage,
          limit: 10,
        });
        setServices(res.services);
        console.log(res.services)
        setServicePagination(res.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetch();
  }, [activeTab, servicePage, refreshTrigger]);

  // NEW: Fetch Counters
  useEffect(() => {
    if (activeTab !== "counters") return;

    const fetch = async () => {
      setLoadingCounters(true);
      try {
        const res = await phpAPI.admin.getCounters();
        setCounters(res.counters || []);
      } catch {
        setError("Failed to load counters");
      } finally {
        setLoadingCounters(false);
      }
    };
    fetch();
  }, [activeTab, refreshTrigger]);

  // NEW: Fetch Verification Centers
  useEffect(() => {
    if (activeTab !== "verification-centers") return;

    const fetch = async () => {
      setLoadingVerificationCenters(true);
      try {
        const res = await phpAPI.admin.getCenters();
        setVerificationCenters(res.centers || []);
      } catch {
        setError("Failed to load verification centers");
      } finally {
        setLoadingVerificationCenters(false);
      }
    };
    fetch();
  }, [activeTab, refreshTrigger]);

  // Fetch Applications
  useEffect(() => {
    if (activeTab !== "applications") return;
    const fetch = async () => {
      setLoadingApps(true);
      setError(null);
      try {
        const res = await phpAPI.admin.getApplications({
          page: appPage,
          limit: 20,
          status: statusFilter || undefined,
        });
        setApplications(res.applications || []);
        setAppPagination(res.pagination || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingApps(false);
      }
    };

    fetch();
  }, [activeTab, appPage, statusFilter]);

  useEffect(() => {
    if (activeTab === "service-details") {
      const fetchServiceDetails = async () => {
        setLoadingServiceDetails(true);
        setError(null);

        try {
          // Fetch existing service details
          const response = await phpAPI.admin.getServiceDetails({
            page: serviceDetailsPage,
            limit: 10,
          });
          setServiceDetails(response.details);
          setServiceDetailsPagination(response.pagination);

          // ALSO Fetch services list for the dropdown
          // Use a higher limit to ensure we get them all for the dropdown
          const servicesRes = await phpAPI.admin.getServices({
            limit: 100,
          });
          setServices(servicesRes.services);

        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoadingServiceDetails(false);
        }
      };

      fetchServiceDetails();
    }
  }, [activeTab, serviceDetailsPage, refreshTrigger]);

  // Fetch Appointments
  useEffect(() => {
    if (activeTab !== "appointments") return;
    const fetch = async () => {
      setLoadingAppts(true);
      setError(null);
      try {
        const res = await phpAPI.admin.getAppointments({
          page: apptPage,
          limit: 20,
          status: apptStatus || undefined,
          centerId: apptCenterId || undefined,
          dateFrom: apptDateFrom || undefined,
          dateTo: apptDateTo || undefined,
          search: apptSearch || undefined,
        });
        setAppointments(res.appointments || []);
        setApptPagination(res.pagination || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetch();
  }, [
    activeTab,
    apptPage,
    apptStatus,
    apptCenterId,
    apptDateFrom,
    apptDateTo,
    apptSearch,
    refreshTrigger,
  ]);

  // Fetch slots
  useEffect(() => {
    if (activeTab !== "slots") return;

    const fetch = async () => {
      setLoadingSlots(true);
      try {
        const res = await phpAPI.admin.getTimeSlots({
          page: slotPage,
          limit: 10,
        });
        setSlots(res.slots);
        setSlotSettings(res.settings);
        setSlotPagination(res.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetch();
  }, [activeTab, slotPage, refreshTrigger]);

  // Handlers

  const handleBulkCreate = async (
    start: string,
    end: string,
    duration?: number
  ): Promise<{ message: string; skipped: number }> => {
    try {
      const res = await phpAPI.admin.bulkCreateSlots({
        start_time: start,
        end_time: end,
        duration,
      });

      // Show toast
      const msg =
        res.skipped > 0
          ? `${res.message}, ${res.skipped} overlapping slot(s) skipped`
          : res.message;

      alert(msg);
      refreshSlots();

      // Return the data for modal (if needed)
      return { message: res.message, skipped: res.skipped };
    } catch (err: any) {
      alert(err.message || "Failed to create slots");
      throw err; // re-throw to satisfy Promise return
    }
  };

  const handleCreateSlot = async (start: string, end: string) => {
    await phpAPI.admin.createSlot({
      start_time: start,
      end_time: end,
      is_active: 1,
    });
    refreshSlots();
  };

  const handleCreateService = async (payload: any) => {
    try {
      await phpAPI.admin.createService(payload);
      refreshServices();
    } catch {
      alert("Failed to create service");
    }
  };

  const handleCreateCounter = async (payload: any) => {
    console.log("Creating counter with payload:", payload);
    try {
      const result = await phpAPI.admin.createCounter(payload);
      console.log("Counter created successfully:", result);
      refreshCounters();
    } catch (err: any) {
      console.error("Failed to create counter:", err);
      console.error("Error details:", {
        message: err?.message,
        stack: err?.stack,
        response: err?.response
      });
      alert(err?.message || "Failed to create counter");
    }
  };

  const handleCreateVerificationCenter = async (payload: any) => {
    try {
      await phpAPI.admin.createCenter(payload);
      refreshVerificationCenters();
      // Also refresh global centers list
      const res = await phpAPI.admin.getActiveCenters();
      setCenters(res.centers || []);
    } catch (err: any) {
      alert(err?.message || "Failed to create verification center");
    }
  };

  const handleUpdateSettings = async (s: Partial<SlotSettings>) => {
    await phpAPI.admin.updateSlotSettings(s);
    refreshSlots();
  };

  const handleBulkToggle = async (ids: number[], activate: boolean) => {
    await phpAPI.admin.bulkToggleSlots(ids, activate);
    refreshSlots();
  };

  const exportData = () => {
    const data = {
      stats,
      applications: activeTab === "applications" ? applications : undefined,
      appointments: activeTab === "appointments" ? appointments : undefined,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consular-export-${new Date().toISOString().split("T")[0]
      }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout onExport={exportData} onLogout={onLogout}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8">
        {activeTab === "dashboard" && (
          // <DashboardOverview
          //   stats={stats}
          //   loading={loadingStats}
          //   error={error}
          // />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Management
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <>
            <ApplicationFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setCurrentPage={setAppPage}
            />
            {loadingApps && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {error && !loadingApps && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {applications.length === 0 && !loadingApps && !error && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No applications found.</p>
              </div>
            )}
            {applications.length > 0 && (
              <ApplicationsTable
                applications={applications}
                pagination={appPagination}
                currentPage={appPage}
                setCurrentPage={setAppPage}
              />
            )}
          </>
        )}

        {activeTab === "miscellaneous-applications" && (
          <MiscellaneousApplicationsManagement />
        )}

        {activeTab === "appointments" && (
          <>
            <AppointmentFilters
              search={apptSearch}
              setSearch={setApptSearch}
              status={apptStatus}
              setStatus={setApptStatus}
              centerId={apptCenterId}
              setCenterId={setApptCenterId}
              dateFrom={apptDateFrom}
              setDateFrom={setApptDateFrom}
              dateTo={apptDateTo}
              setDateTo={setApptDateTo}
              setPage={setApptPage}
              centers={centers}
            />
            {loadingAppts && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            {error && !loadingAppts && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            {appointments.length === 0 && !loadingAppts && !error && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments found.</p>
              </div>
            )}
            {appointments.length > 0 && (
              <AppointmentsTable
                appointments={appointments}
                pagination={apptPagination}
                currentPage={apptPage}
                setCurrentPage={setApptPage}
                refresh={refreshAppointments}
              />
            )}
          </>
        )}

        {activeTab === "slots" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Slot Settings
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + New Slot
                </button>
                <button
                  onClick={() => setShowBulkCreateModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Bulk Create
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bulk Toggle
                </button>
              </div>
            </div>

            {slotSettings && (
              <div className="mb-8">
                <SlotSettingsForm
                  settings={slotSettings}
                  onUpdate={handleUpdateSettings}
                />
              </div>
            )}

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <SlotsTable
                slots={slots}
                pagination={slotPagination}
                currentPage={slotPage}
                setCurrentPage={setSlotPage}
                refresh={refreshSlots}
              />
            )}

            {showCreateModal && (
              <CreateSlotModal
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateSlot}
              />
            )}
            {showBulkModal && (
              <BulkToggleModal
                slots={slots}
                onClose={() => setShowBulkModal(false)}
                onBulkToggle={handleBulkToggle}
              />
            )}
            {showBulkCreateModal && slotSettings && (
              <BulkCreateSlotsModal
                defaultDuration={slotSettings.slot_duration_minutes}
                onClose={() => setShowBulkCreateModal(false)}
                onCreate={handleBulkCreate} // ← now async
              />
            )}
          </>
        )}

        {activeTab === "services" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Services</h2>
              <button
                onClick={() => setShowCreateService(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Service
              </button>
            </div>

            <ServicesTable
              services={services}
              pagination={servicePagination}
              currentPage={servicePage}
              setCurrentPage={setServicePage}
              refresh={refreshServices}
            />

            {showCreateService && (
              <CreateServiceModal
                onClose={() => setShowCreateService(false)}
                onCreate={handleCreateService}
              />
            )}
          </>
        )}

        {activeTab === "counters" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Counters</h2>
              <button
                onClick={() => setShowCreateCounter(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Counter
              </button>
            </div>

            {loadingCounters || loadingGlobalCenters ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <CountersTable
                counters={counters}
                centers={centers}
                refresh={refreshCounters}
              />
            )}

            {showCreateCounter && (
              <CreateCounterModal
                onClose={() => setShowCreateCounter(false)}
                onCreate={handleCreateCounter}
              />
            )}
          </>
        )}

        {activeTab === "verification-centers" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Verification Centers</h2>
              <button
                onClick={() => setShowCreateVerificationCenter(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Center
              </button>
            </div>

            {loadingVerificationCenters ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <VerificationCentersTable
                centers={verificationCenters}
                refresh={refreshVerificationCenters}
              />
            )}

            {showCreateVerificationCenter && (
              <CreateVerificationCenterModal
                onClose={() => setShowCreateVerificationCenter(false)}
                onCreate={handleCreateVerificationCenter}
              />
            )}
          </>
        )}

        {activeTab === "service-details" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Service Details
              </h2>
              <button
                onClick={() => setShowCreateServiceDetails(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + New Details
              </button>
            </div>

            {loadingServiceDetails ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <ServiceDetailsTable
                details={serviceDetails}
                pagination={serviceDetailsPagination}
                currentPage={serviceDetailsPage}
                setCurrentPage={setServiceDetailsPage}
                refresh={refreshServiceDetails}
              />
            )}

            {showCreateServiceDetails && (
              <CreateServiceDetailsModal
                onClose={() => setShowCreateServiceDetails(false)}
                onCreate={refreshServiceDetails}
                services={services} // Pass services for selection
              />
            )}
          </>
        )}

        {activeTab === "email-templates" && <EmailTemplatesManagement />}

        {["users", "settings"].includes(activeTab) && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Management
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
