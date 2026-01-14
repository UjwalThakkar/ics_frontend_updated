// src/components/admin/appointments/AppointmentsTable.tsx
import { useState } from "react";
import { Appointment, Pagination, AppointmentDetails } from "@/types/admin";
import AppointmentRow from "./AppointmentRow";
import PaginationComponent from "../common/Pagination";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import UpdateStatusModal from "./UpdateStatusModal";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2 } from "lucide-react";

interface Props {
  appointments: Appointment[];
  pagination: Pagination | null;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  refresh: () => void;
}

export default function AppointmentsTable({
  appointments,
  pagination,
  currentPage,
  setCurrentPage,
  refresh,
}: Props) {
  // ---- View modal ----
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // ---- Edit modal ----
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);

  // ---- View handler ----
  const handleView = async (id: number) => {
    setLoadingDetails(true);
    try {
      const res = await phpAPI.admin.getAppointmentDetails(id);
      setDetails(res.appointment);
    } catch {
      alert("Failed to load details");
    } finally {
      setLoadingDetails(false);
    }
  };

  // ---- Edit handler (open modal) ----
  const handleEdit = (appt: Appointment) => {
    setEditAppt(appt);
  };

  // ---- Status update ----
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await phpAPI.admin.updateAppointmentStatus(id, status as any);
      refresh();               // <-- re‑fetch the list
      setEditAppt(null);       // close modal
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <>
      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* thead … */}
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appt) => (
                <AppointmentRow
                  key={appt.appointment_id}
                  appt={appt}
                  onView={handleView}
                  onEdit={handleEdit}   // ← new prop
                />
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <PaginationComponent
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* DETAILS MODAL */}
      {details && (
        <AppointmentDetailsModal
          appointment={details}
          onClose={() => setDetails(null)}
        />
      )}

      {/* UPDATE STATUS MODAL */}
      {editAppt && (
        <UpdateStatusModal
          appointmentId={editAppt.appointment_id}
          currentStatus={editAppt.appointment_status}
          onClose={() => setEditAppt(null)}
          onUpdate={handleUpdateStatus}
        />
      )}

      {/* Loading overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
    </>
  );
}