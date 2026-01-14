// src/components/admin/slots/BulkCreateSlotsModal.tsx
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  defaultDuration: number;
  onClose: () => void;
  onCreate: (
    start: string,
    end: string,
    duration?: number
  ) => Promise<{ message: string; skipped: number }>;
}

export default function BulkCreateSlotsModal({
  defaultDuration,
  onClose,
  onCreate,
}: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(defaultDuration.toString());

  
  const handleSubmit = async () => {
    if (!startTime || !endTime) return;

    const dur = duration ? parseInt(duration) : undefined;
    await onCreate(startTime, endTime, dur); // ← now awaits the promise
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Bulk Create Time Slots</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Duration (minutes)
              <span className="text-xs text-gray-500 ml-1">
                (default: {defaultDuration} min)
              </span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={defaultDuration.toString()}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to use default duration.
            </p>
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
            disabled={!startTime || !endTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Slots
          </button>
        </div>
      </div>
    </div>
  );
}
