// src/components/admin/slots/SlotsTable.tsx
import { useState } from "react";
import { TimeSlot, Pagination } from "@/types/admin";
import PaginationComponent from "../common/Pagination";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import DeleteSlotModal from "./DeleteSlotModal";

interface Props {
  slots: TimeSlot[];
  pagination: Pagination | null;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  refresh: () => void;
}

export default function SlotsTable({ slots, pagination, currentPage, setCurrentPage, refresh }: Props) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<TimeSlot | null>(null);

  const handleToggle = async (slot: TimeSlot) => {
    setToggling(slot.slot_id);
    try {
      await phpAPI.admin.toggleSlot(slot.slot_id);
      refresh();
    } catch {
      alert("Failed to toggle slot");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await phpAPI.admin.deleteSlot(id);
      refresh();
    } catch {
      alert("Failed to delete slot");
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {slots.map((slot) => (
                <tr key={slot.slot_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{slot.slot_id}</td>
                  <td className="px-6 py-4 text-sm">
                    {slot.start_time} – {slot.end_time}
                  </td>
                  <td className="px-6 py-4 text-sm">{slot.duration} min</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      slot.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {slot.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(slot)}
                        disabled={toggling === slot.slot_id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title={slot.is_active ? "Deactivate" : "Activate"}
                      >
                        {toggling === slot.slot_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : slot.is_active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setShowDeleteModal(slot)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Slot"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteSlotModal
          slotId={showDeleteModal.slot_id}
          startTime={showDeleteModal.start_time}
          endTime={showDeleteModal.end_time}
          onClose={() => setShowDeleteModal(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}