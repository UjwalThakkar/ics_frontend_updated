// src/components/admin/slots/BulkToggleModal.tsx
import { X } from "lucide-react";
import { TimeSlot } from "@/types/admin";
import { useState } from "react";

interface Props {
  slots: TimeSlot[];
  onClose: () => void;
  onBulkToggle: (ids: number[], activate: boolean) => void;
}

export default function BulkToggleModal({
  slots,
  onClose,
  onBulkToggle,
}: Props) {
  const [selected, setSelected] = useState<number[]>([]);
  const [activate, setActivate] = useState(true);

  const toggleSlot = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onBulkToggle(selected, activate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Bulk Toggle Slots</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={activate}
                onChange={(e) => setActivate(e.target.checked)}
                className="mr-2"
              />
              <span>Activate selected slots</span>
            </label>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {slots.map((slot) => (
              <label key={slot.slot_id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selected.includes(slot.slot_id)}
                  onChange={() => toggleSlot(slot.slot_id)}
                  className="mr-2"
                />
                <span>
                  {slot.start_time} – {slot.end_time} ({slot.duration} min)
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Apply ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
