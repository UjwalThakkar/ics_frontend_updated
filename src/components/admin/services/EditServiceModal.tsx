// src/components/admin/services/EditServiceModal.tsx
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface FeeRow {
  type: string;
  amount: string;
}

interface Props {
  serviceId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditServiceModal({
  serviceId,
  onClose,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(true);

  // Form state
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    processing_time: "",
    required_documents: "",
    eligibility_requirements: "",
    display_order: 99,
    is_active: 1 as 0 | 1,
  });

  const [fees, setFees] = useState<FeeRow[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterIds, setSelectedCenterIds] = useState<number[]>([]);

  // Toggle center selection
  const toggleCenter = (centerId: number) => {
    setSelectedCenterIds((prev) =>
      prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [...prev, centerId]
    );
  };

  // Fee helpers
  const addFeeRow = () =>
    setFees((prev) => [...prev, { type: "", amount: "" }]);
  const removeFeeRow = (idx: number) =>
    setFees((prev) => prev.filter((_, i) => i !== idx));
  const updateFeeRow = (idx: number, field: "type" | "amount", value: string) =>
    setFees((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );

  // Load service + centers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [serviceRes, centersRes] = await Promise.all([
          phpAPI.admin.getService(serviceId),
          phpAPI.admin.getActiveCenters(),
        ]);

        const s = serviceRes.service;

        // Populate form
        setForm({
          category: s.category ?? "",
          title: s.title ?? "",
          description: s.description ?? "",
          processing_time: s.processing_time ?? "",
          required_documents: Array.isArray(s.required_documents)
            ? s.required_documents.join(", ")
            : "",
          eligibility_requirements: Array.isArray(s.eligibility_requirements)
            ? s.eligibility_requirements.join(", ")
            : "",
          display_order: Number(s.display_order) ?? 99,
          is_active: s.is_active ? 1 : 0,
        });

        // Populate fees
        const feeRows =
          Array.isArray(s.fees) && s.fees.length > 0
            ? s.fees.map((f: any) => ({
                type: f.type ?? "",
                amount: String(f.amount ?? ""),
              }))
            : [{ type: "", amount: "" }];
        setFees(feeRows);

        // Set centers and pre-select
        setCenters(centersRes.centers || []);
        setSelectedCenterIds(centersRes.centers[0].center_id);
      } catch (err) {
        alert("Failed to load service or centers");
        onClose();
      } finally {
        setLoading(false);
        setLoadingCenters(false);
      }
    };

    fetchData();
  }, [serviceId, onClose]);

  // Submit update
  const handleSubmit = async () => {
    if (selectedCenterIds.length === 0) {
      alert("Please select at least one verification center");
      return;
    }

    try {
      const payload: any = {
        category: form.category.trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        processing_time: form.processing_time.trim() || undefined,
        fees: fees
          .filter((r) => r.type.trim() && r.amount.trim())
          .map((r) => ({ type: r.type.trim(), amount: Number(r.amount) })),
        required_documents: form.required_documents
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        eligibility_requirements: form.eligibility_requirements
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        center_ids: selectedCenterIds,
        display_order: form.display_order
          ? Number(form.display_order)
          : undefined,
        is_active: form.is_active,
      };

      await phpAPI.admin.updateService(serviceId, payload);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err?.message || "Failed to update service");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Category & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Passport"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Passport Renewal"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the service"
            />
          </div>

          {/* Processing Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Time
            </label>
            <input
              value={form.processing_time}
              onChange={(e) =>
                setForm({ ...form, processing_time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 4-6 weeks"
            />
          </div>

          {/* Verification Centers */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available at Verification Centers
              <span className="text-red-500">*</span>
            </label>
            {loadingCenters ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading centers...
              </div>
            ) : centers.length === 0 ? (
              <p className="text-sm text-red-600">No active centers found</p>
            ) : (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {centers.map((c) => (
                  <label
                    key={c.center_id}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCenterIds.includes(c.center_id)}
                      onChange={() => toggleCenter(c.center_id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.city}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedCenterIds.length} center(s)
            </p>
          </div> */}

          {/* Fees */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Fees
              </label>
              <button
                type="button"
                onClick={addFeeRow}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add fee type
              </button>
            </div>
            <div className="space-y-3">
              {fees.map((row, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    placeholder="Type (e.g. standard)"
                    value={row.type}
                    onChange={(e) => updateFeeRow(idx, "type", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) =>
                      updateFeeRow(idx, "amount", e.target.value)
                    }
                    className="w-32 px-3 py-2 border rounded-md text-sm"
                  />
                  {fees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeeRow(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Eligibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Documents (comma-separated)
              </label>
              <input
                value={form.required_documents}
                onChange={(e) =>
                  setForm({ ...form, required_documents: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Old passport, Photos, Form"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eligibility Requirements (comma-separated)
              </label>
              <input
                value={form.eligibility_requirements}
                onChange={(e) =>
                  setForm({ ...form, eligibility_requirements: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Indian citizen, Age 18+"
              />
            </div>
          </div>

          {/* Display Order & Active */}
          <div className="flex gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm({
                    ...form,
                    display_order:
                      e.target.value === "" ? 99 : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active === 1}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked ? 1 : 0 })
                }
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Update Service
          </button>
        </div>
      </div>
    </div>
  );
}
