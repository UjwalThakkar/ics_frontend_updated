// src/components/admin/services/CreateServiceModal.tsx
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { phpAPI } from "@/lib/php-api-client";

interface Center {
  center_id: number;
  name: string;
  city: string;
}

interface FeeRow {
  type: string;
  amount: string;
}

interface Props {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateServiceModal({ onClose, onCreate }: Props) {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [selectedCenterIds, setSelectedCenterIds] = useState<number[]>([]);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    processing_time: "",
    required_documents: "",
    eligibility_requirements: "",
    display_order: 99,
    is_active: true,
  });

  const [fees, setFees] = useState<FeeRow[]>([{ type: "standard", amount: "0" }]);

  // Fetch centers + auto-select all
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await phpAPI.admin.getActiveCenters();
        setCenters(res.centers || []);
        // Auto-select all centers
        setSelectedCenterIds((res.centers || []).map((c: Center) => c.center_id));
      } catch {
        alert("Failed to load centers");
      } finally {
        setLoadingCenters(false);
      }
    };
    fetch();
  }, []);

  const toggleCenter = (id: number) => {
    setSelectedCenterIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addFeeRow = () => setFees(prev => [...prev, { type: "", amount: "" }]);
  const removeFeeRow = (i: number) => setFees(prev => prev.filter((_, idx) => idx !== i));
  const updateFee = (i: number, field: "type" | "amount", val: string) =>
    setFees(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const handleSubmit = () => {
    if (selectedCenterIds.length === 0) {
      alert("Please select at least one verification center");
      return;
    }

    const payload = {
      category: form.category.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      processing_time: form.processing_time.trim() || undefined,
      fees: fees
        .filter(r => r.type.trim() && r.amount.trim())
        .map(r => ({ type: r.type.trim(), amount: Number(r.amount) })),
      required_documents: form.required_documents
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      eligibility_requirements: form.eligibility_requirements
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      center_ids: selectedCenterIds,
      display_order: Number(form.display_order) || 99,
      is_active: form.is_active ? 1 : 0,
    };

    onCreate(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Service</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Passport" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Passport Renewal" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Brief description of the service" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
            <input value={form.processing_time} onChange={e => setForm({ ...form, processing_time: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 4-6 weeks" />
          </div>

          {/* Verification Centers */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available at Verification Centers <span className="text-red-500">*</span>
            </label>
            {loadingCenters ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading centers...
              </div>
            ) : centers.length === 0 ? (
              <p className="text-red-600">No active centers found</p>
            ) : (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {centers.map(c => (
                  <label key={c.center_id} className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCenterIds.includes(c.center_id)}
                      onChange={() => toggleCenter(c.center_id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.city}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selected: {selectedCenterIds.length} center(s)
            </p>
          </div> */}

          {/* Fees */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Fees</label>
              <button type="button" onClick={addFeeRow} className="text-xs text-blue-600 hover:underline">
                + Add fee type
              </button>
            </div>
            {fees.map((row, i) => (
              <div key={i} className="flex gap-3 items-center mb-2">
                <input placeholder="Type (e.g. standard)" value={row.type}
                  onChange={e => updateFee(i, "type", e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm" />
                <input type="number" placeholder="Amount" value={row.amount}
                  onChange={e => updateFee(i, "amount", e.target.value)}
                  className="w-32 px-3 py-2 border rounded-md text-sm" />
                {fees.length > 1 && (
                  <button onClick={() => removeFeeRow(i)} className="text-red-600">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents</label>
              <input value={form.required_documents} onChange={e => setForm({ ...form, required_documents: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Old passport, Photos, Form" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Requirements</label>
              <input value={form.eligibility_requirements} onChange={e => setForm({ ...form, eligibility_requirements: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Indian citizen, Age 18+" />
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: +e.target.value || 99 })}
                className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Service
          </button>
        </div>
      </div>
    </div>
  );
}