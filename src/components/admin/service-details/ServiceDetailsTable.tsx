// src/components/admin/service-details/ServiceDetailsTable.tsx
"use client";

import { useState } from "react";
import { Pagination, ServiceDetails } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2, Edit, Trash2, AlertCircle } from "lucide-react";
import EditServiceDetailsModal from "./EditServiceDetailsModal";

interface Props {
  details: ServiceDetails[];
  pagination: Pagination | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refresh: () => void;
}

export default function ServiceDetailsTable({
  details,
  pagination,
  currentPage,
  setCurrentPage,
  refresh,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log("details received: ", details);

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Are you sure you want to delete these details?")) return;

    setLoadingDelete(serviceId);
    setError(null);

    try {
      await phpAPI.admin.deleteServiceDetails(serviceId);
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 ">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service ID / Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Overview (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Visa Fees (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documents (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Photo Specs (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Processing Time (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Downloads (Preview)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {details.map((detail) => {
            const safePreview = (text: string | undefined | null) => {
              const str = text || "";
              // Strip HTML tags first to get plain text for preview
              const plainText = str.replace(/<[^>]*>/g, "").trim();
              return plainText.length > 150
                ? plainText.substring(0, 150) + "..."
                : plainText || "No content";
            };

            return (
              <tr key={detail.service_id}>
                <td className="px-6 py-4 whitespace-wrap">
                  <div className="text-sm font-medium text-gray-900">
                    {detail.service_id} - {detail.service_title || "N/A"}
                  </div>
                </td>

                {/* Overview Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.overview)}
                  </div>
                </td>

                {/* Visa Fees Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.visa_fees)}
                  </div>
                </td>

                {/* Documents Required Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.documents_required)}
                  </div>
                </td>

                {/* Photo Specifications Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.photo_specifications)}
                  </div>
                </td>

                {/* Processing Time Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.processing_time)}
                  </div>
                </td>

                {/* Download Forms Preview */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-3">
                    {safePreview(detail.downloads_form)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setEditingId(detail.service_id)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(detail.service_id)}
                    disabled={loadingDelete === detail.service_id}
                    className="text-red-600 hover:text-red-900"
                  >
                    {loadingDelete === detail.service_id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {pagination && (
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {editingId && (
        <EditServiceDetailsModal
          serviceId={editingId}
          onClose={() => setEditingId(null)}
          onUpdate={refresh}
        />
      )}
    </div>
  );
}
