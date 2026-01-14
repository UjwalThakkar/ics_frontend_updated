// src/components/admin/counters/EditCounterModal.tsx (new file)
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Counter, Service, Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface Props {
  counterId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditCounterModal({ counterId, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    counter_name: "",
    is_active: 1 as 0 | 1,
  });
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerName, setCenterName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [counterRes, servicesRes, centersRes] = await Promise.all([
          phpAPI.admin.getCounter(counterId),
          phpAPI.admin.getServices({ limit: 100 }), // Adjust if needed
          phpAPI.admin.getActiveCenters(),
        ]);

        const c = counterRes.counter;

        setForm({
          counter_name: c.counter_name,
          is_active: c.is_active,
        });
        setSelectedServices(c.service_handled || []);

        setServices(servicesRes.services || []);
        setCenters(centersRes.centers || []);

        // Find center name
        const center = centersRes.centers.find((cen: Center) => cen.center_id === c.center_id);
        setCenterName(center ? `${center.name} (${center.city})` : `ID: ${c.center_id}`);
      } catch {
        alert("Failed to load data");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [counterId, onClose]);

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }

    try {
      const payload = {
        counter_name: form.counter_name.trim(),
        service_handled: selectedServices,
        is_active: form.is_active,
      };

      await phpAPI.admin.updateCounter(counterId, payload);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err?.message || "Failed to update counter");
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Counter</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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

          {/* Center (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
            <div className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-gray-600">
              {centerName}
            </div>
          </div>

          {/* Services Handled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services Handled <span className="text-red-500">*</span>
            </label>
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
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedServices.length} service(s)
            </p>
          </div>

          {/* Active */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_active === 1}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
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
            Update Counter
          </button>
        </div>
      </div>
    </div>
  );
}