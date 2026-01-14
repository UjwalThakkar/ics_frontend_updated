// src/components/admin/slots/DeleteSlotModal.tsx
import { X, AlertTriangle } from "lucide-react";

interface Props {
  slotId: number;
  startTime: string;
  endTime: string;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export default function DeleteSlotModal({ slotId, startTime, endTime, onClose, onDelete }: Props) {
  const handleDelete = () => {
    onDelete(slotId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center p-6 border-b">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          <h2 className="text-xl font-bold text-red-700">Delete Time Slot</h2>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            Are you sure you want to delete the time slot:
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            {startTime} – {endTime}
          </p>
          <p className="mt-3 text-sm text-red-600">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Slot
          </button>
        </div>
      </div>
    </div>
  );
}