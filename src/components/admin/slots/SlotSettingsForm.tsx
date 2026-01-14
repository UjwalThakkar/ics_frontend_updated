// src/components/admin/slots/SlotSettingsForm.tsx
import { SlotSettings } from "@/types/admin";
import { useState } from "react";

interface Props {
  settings: SlotSettings;
  onUpdate: (s: Partial<SlotSettings>) => void;
}

export default function SlotSettingsForm({ settings, onUpdate }: Props) {
  const [form, setForm] = useState(settings);

  const handleSubmit = () => {
    onUpdate(form);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Global Slot Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (min)</label>
          <input
            type="number"
            value={form.slot_duration_minutes}
            onChange={(e) => setForm({ ...form, slot_duration_minutes: +e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Appts per Slot</label>
          <input
            type="number"
            value={form.max_appointments_per_slot}
            onChange={(e) => setForm({ ...form, max_appointments_per_slot: +e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Advance Booking (days)</label>
          <input
            type="number"
            value={form.advance_booking_days}
            onChange={(e) => setForm({ ...form, advance_booking_days: +e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation (hours)</label>
          <input
            type="number"
            value={form.cancellation_hours}
            onChange={(e) => setForm({ ...form, cancellation_hours: +e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}