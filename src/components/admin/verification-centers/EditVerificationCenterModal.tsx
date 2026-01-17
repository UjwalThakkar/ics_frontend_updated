// src/components/admin/verification-centers/EditVerificationCenterModal.tsx
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Service, Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface Props {
  centerId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditVerificationCenterModal({ centerId, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [center, setCenter] = useState<Center | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
    isActive: true,
    displayOrder: 0,
  });

  const [operatingHours, setOperatingHours] = useState<Record<string, string>>({});
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch center details
        const centersRes = await phpAPI.admin.getCenters();
        const foundCenter = centersRes.centers.find((c) => c.center_id === centerId);
        
        if (foundCenter) {
          setCenter(foundCenter);
          setForm({
            name: foundCenter.name || "",
            address: foundCenter.address || "",
            city: foundCenter.city || "",
            state: foundCenter.state || "",
            country: foundCenter.country || "",
            postalCode: foundCenter.postal_code || "",
            phone: foundCenter.phone || "",
            email: foundCenter.email || "",
            latitude: foundCenter.latitude?.toString() || "",
            longitude: foundCenter.longitude?.toString() || "",
            isActive: foundCenter.is_active !== false && foundCenter.is_active !== 0,
            displayOrder: foundCenter.display_order || 0,
          });

          // Parse operating hours
          if (foundCenter.operating_hours) {
            const hours = typeof foundCenter.operating_hours === "string"
              ? JSON.parse(foundCenter.operating_hours)
              : foundCenter.operating_hours;
            setOperatingHours(hours || {});
          }

          // Parse services
          if (foundCenter.provides_services) {
            const services = typeof foundCenter.provides_services === "string"
              ? JSON.parse(foundCenter.provides_services)
              : foundCenter.provides_services;
            setSelectedServices(Array.isArray(services) ? services : []);
          }
        }

        // Fetch all services
        const servicesRes = await phpAPI.admin.getServices({ limit: 100 });
        setServices(servicesRes.services || []);
      } catch (err: any) {
        alert(err.message || "Failed to load center details");
        onClose();
      } finally {
        setLoading(false);
        setLoadingServices(false);
      }
    };

    fetchData();
  }, [centerId, onClose]);

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.country.trim()) {
      alert("Please fill in all required fields (Name, Address, City, Country)");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
      };

      if (form.state.trim()) payload.state = form.state.trim();
      if (form.postalCode.trim()) payload.postalCode = form.postalCode.trim();
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);
      if (Object.keys(operatingHours).some(k => operatingHours[k].trim() !== "")) {
        payload.operatingHours = Object.fromEntries(
          Object.entries(operatingHours).filter(([_, v]) => v.trim() !== "")
        );
      }
      if (selectedServices.length > 0) payload.providesServices = selectedServices;
      payload.isActive = form.isActive;
      payload.displayOrder = form.displayOrder || 0;

      await phpAPI.admin.updateCenter(centerId, payload);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to update verification center");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Verification Center</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
            <div className="grid grid-cols-2 gap-3">
              {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                <div key={day}>
                  <label className="block text-xs text-gray-600 mb-1 capitalize">{day}</label>
                  <input
                    value={operatingHours[day] || ""}
                    onChange={(e) =>
                      setOperatingHours({ ...operatingHours, [day]: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="09:00-17:00"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Services Provided */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Services Provided</label>
            {loadingServices ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading services...
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                {services.map((service) => (
                  <label
                    key={service.service_id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.service_id)}
                      onChange={() => toggleService(service.service_id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {service.title} ({service.category})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status & Display Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Update Center</span>
          </button>
        </div>
      </div>
    </div>
  );
}

