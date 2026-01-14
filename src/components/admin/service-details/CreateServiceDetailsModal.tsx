// src/components/admin/service-details/CreateServiceDetailsModal.tsx
"use client";

import { useState } from "react";
import { Service, ServiceDetails } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { X, Loader2, AlertCircle } from "lucide-react";
import TipTapEditor from "@/components/ui/TipTapEditor";

interface Props {
  onClose: () => void;
  onCreate: () => void;
  services: Service[]; // Pass available services for selection
}

export default function CreateServiceDetailsModal({
  onClose,
  onCreate,
  services,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceDetails>>({
    service_id: undefined,
    overview: "",
    visa_fees: "",
    documents_required: "",
    photo_specifications: "",
    processing_time: "",
    downloads_form: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_id) {
      setError("Please select a service");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await phpAPI.admin.createServiceDetails({
        serviceId: formData.service_id,
        overview: formData.overview || "",
        visaFees: formData.visa_fees || "", // Now string
        documentsRequired: formData.documents_required || "", // Now string
        photoSpecifications: formData.photo_specifications || "",
        processingTime: formData.processing_time || "",
        downloadsForm: formData.downloads_form || "", // Now string
      });
      onCreate();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Service Details</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Service
              </label>
              <select
                value={formData.service_id || ""}
                onChange={(e) => setFormData({ ...formData, service_id: Number(e.target.value) })}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.title} ({service.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overview
              </label>
              <TipTapEditor
                value={formData.overview || ""}
                onChange={(content) => setFormData({ ...formData, overview: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visa Fees
              </label>
              <TipTapEditor
                value={formData.visa_fees || ""}
                onChange={(content) => setFormData({ ...formData, visa_fees: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documents Required
              </label>
              <TipTapEditor
                value={formData.documents_required || ""}
                onChange={(content) => setFormData({ ...formData, documents_required: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Specifications
              </label>
              <TipTapEditor
                value={formData.photo_specifications || ""}
                onChange={(content) => setFormData({ ...formData, photo_specifications: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Processing Time
              </label>
              <TipTapEditor
                value={formData.processing_time || ""}
                onChange={(content) => setFormData({ ...formData, processing_time: content })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Download Forms
              </label>
              <TipTapEditor
                value={formData.downloads_form || ""}
                onChange={(content) => setFormData({ ...formData, downloads_form: content })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin inline" />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}