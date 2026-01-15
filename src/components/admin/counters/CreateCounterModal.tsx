// src/components/admin/counters/CreateCounterModal.tsx
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Service, Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface Props {
  onClose: () => void;
  onCreate: (data: any) => void;
}

export default function CreateCounterModal({ onClose, onCreate }: Props) {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  const [form, setForm] = useState({
    counter_name: "",
    is_active: true,
  });

  // Fetch centers on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await phpAPI.admin.getActiveCenters();
        setCenters(res.centers || []);
      } catch {
        alert("Failed to load centers");
      } finally {
        setLoadingCenters(false);
      }
    };
    fetch();
  }, []);

  // Fetch services when center is selected
  useEffect(() => {
    if (!selectedCenterId) {
      setServices([]);
      setSelectedServices([]);
      return;
    }

    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = await phpAPI.admin.getCenterServices(selectedCenterId);
        setServices(res.services || []);
        setSelectedServices([]); // Reset selection when center changes
      } catch {
        alert("Failed to load services for this center");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [selectedCenterId]);

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = () => {
    if (!selectedCenterId) {
      alert("Please select a verification center");
      return;
    }

    if (!form.counter_name.trim()) {
      alert("Please enter a counter name");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }

    const payload = {
      center_id: selectedCenterId,
      counter_name: form.counter_name.trim(),
      service_handled: selectedServices,
      is_active: form.is_active ? 1 : 0,
    };

    console.log("CreateCounterModal: Submitting payload:", payload);
    onCreate(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Counter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Center Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification Center <span className="text-red-500">*</span>
            </label>
            {loadingCenters ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading centers...
              </div>
            ) : (
              <select
                value={selectedCenterId || ""}
                onChange={(e) => setSelectedCenterId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a center</option>
                {centers.map((c) => (
                  <option key={c.center_id} value={c.center_id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Counter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counter Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.counter_name}
              onChange={(e) => setForm({ ...form, counter_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Counter A - Visa Services"
            />
          </div>

          {/* Services Handled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services Handled <span className="text-red-500">*</span>
            </label>
            {!selectedCenterId ? (
              <div className="border rounded-lg p-4 bg-gray-50 text-gray-500 text-center">
                Please select a center first
              </div>
            ) : loadingServices ? (
              <div className="flex items-center gap-2 text-gray-500 p-4 border rounded-lg bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading services...
              </div>
            ) : services.length === 0 ? (
              <div className="border rounded-lg p-4 bg-gray-50 text-gray-500 text-center">
                No services available for this center
              </div>
            ) : (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {services.map((s) => (
                  <label
                    key={s.service_id}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.service_id)}
                      onChange={() => toggleService(s.service_id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedServices.length} service(s)
            </p>
          </div>

          {/* Active */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-700">Active</span>
          </label>
        </div>

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
            Create Counter
          </button>
        </div>
      </div>
    </div>
  );
}

