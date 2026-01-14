// src/components/admin/counters/CountersTable.tsx (new file)
import { useState } from "react";
import { Counter, Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2, ToggleLeft, ToggleRight, Edit } from "lucide-react";
import EditCounterModal from "./EditCounterModal";

interface Props {
  counters: Counter[];
  centers: Center[];
  refresh: () => void;
}

export default function CountersTable({ counters, centers, refresh }: Props) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [editCounterId, setEditCounterId] = useState<number | null>(null);

  const handleToggle = async (counter: Counter) => {
    setToggling(counter.counter_id);
    try {
      await phpAPI.admin.toggleCounter(counter.counter_id);
      refresh();
    } catch {
      alert("Failed to toggle counter");
    } finally {
      setToggling(null);
    }
  };

  const getCenterName = (centerId: number) => {
    const center = centers.find((c) => c.center_id === centerId);
    return center ? `${center.name} (${center.city})` : `ID: ${centerId}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services Handled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {counters.map((c) => (
                <tr key={c.counter_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.counter_id}</td>
                  <td className="px-6 py-4 text-sm">{c.counter_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getCenterName(c.center_id)}</td>
                  <td className="px-6 py-4 text-sm">{c.service_handled.join(", ")}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        c.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleToggle(c)}
                        disabled={toggling === c.counter_id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {toggling === c.counter_id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : c.is_active ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditCounterId(c.counter_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editCounterId && (
        <EditCounterModal
          counterId={editCounterId}
          onClose={() => setEditCounterId(null)}
          onUpdate={refresh}
        />
      )}
    </>
  );
}