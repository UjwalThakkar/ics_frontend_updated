// src/components/admin/services/ServicesTable.tsx
import { useState } from "react";
import { Service, Pagination } from "@/types/admin";
import PaginationComponent from "../common/Pagination";
import { phpAPI } from "@/lib/php-api-client";
import {
  Loader2,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
} from "lucide-react";
import EditServiceModal from "./EditServiceModal";
import DeleteServiceModal from "./DeleteServiceModal";

interface Props {
  services: Service[];
  pagination: Pagination | null;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  refresh: () => void;
}

export default function ServicesTable({
  services,
  pagination,
  currentPage,
  setCurrentPage,
  refresh,
}: Props) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [editServiceId, setEditServiceId] = useState<number | null>(null);

  const handleToggle = async (service: Service) => {
    setToggling(service.service_id);
    try {
      await phpAPI.admin.toggleService(service.service_id);
      refresh();
    } catch {
      alert("Failed to toggle service");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await phpAPI.admin.deleteService(id);
      refresh();
    } catch {
      alert("Failed to delete service");
    } finally {
      setDeleteService(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((s) => (
                <tr key={s.service_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {s.service_id}
                  </td>
                  <td className="px-6 py-4 text-sm">{s.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.category}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {Array.isArray(s.fees)
                      ? s.fees
                          .map((f) => `${f.type}: $${f.amount}`)
                          .join(", ")
                      : Object.entries(s.fees ?? {})
                          .map(([k, v]) => `${k}: $${v}`)
                          .join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        s.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {s.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggle(s)}
                        disabled={toggling === s.service_id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {toggling === s.service_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : s.is_active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>

                      <button
                        onClick={() => setEditServiceId(s.service_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteService(s)}
                        className="text-red-600 hover:text-red-900"
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

      {/* ---------- Delete modal ---------- */}
      {deleteService && (
        <DeleteServiceModal
          service={deleteService}
          onClose={() => setDeleteService(null)}
          onDelete={handleDelete}
        />
      )}

      {/* ---------- Edit modal (by id) ---------- */}
      {editServiceId && (
        <EditServiceModal
          serviceId={editServiceId}
          onClose={() => setEditServiceId(null)}
          onUpdate={refresh}               // <-- matches the expected () => void
        />
      )}
    </>
  );
}