// src/components/admin/verification-centers/VerificationCentersTable.tsx
import { useState } from "react";
import { Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2, ToggleLeft, ToggleRight, Edit, MapPin } from "lucide-react";
import EditVerificationCenterModal from "./EditVerificationCenterModal";

interface Props {
  centers: Center[];
  refresh: () => void;
}

export default function VerificationCentersTable({ centers, refresh }: Props) {
  const [toggling, setToggling] = useState<number | null>(null);
  const [editCenterId, setEditCenterId] = useState<number | null>(null);

  const handleToggle = async (center: Center) => {
    setToggling(center.center_id);
    try {
      await phpAPI.admin.toggleCenter(center.center_id);
      refresh();
    } catch {
      alert("Failed to toggle center");
    } finally {
      setToggling(null);
    }
  };

  const parseJsonField = (field: string | number[] | Record<string, string> | undefined): any => {
    if (!field) return null;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return field;
      }
    }
    return field;
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Counters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {centers.map((center) => {
                const providesServices = parseJsonField(center.provides_services);
                const serviceCount = Array.isArray(providesServices) ? providesServices.length : 0;
                const counterCount = center.counter_count || 0;

                return (
                  <tr key={center.center_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{center.center_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{center.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {center.city}
                          {center.state && `, ${center.state}`}
                          {center.country && `, ${center.country}`}
                        </span>
                      </div>
                      {center.address && (
                        <div className="text-xs text-gray-400 mt-1">{center.address}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {center.phone && <div>{center.phone}</div>}
                      {center.email && <div className="text-xs">{center.email}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{serviceCount} services</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{counterCount} counters</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          center.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {center.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleToggle(center)}
                          disabled={toggling === center.center_id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title={center.is_active ? "Deactivate" : "Activate"}
                        >
                          {toggling === center.center_id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : center.is_active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditCenterId(center.center_id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {centers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No verification centers found.</p>
          </div>
        )}
      </div>

      {editCenterId && (
        <EditVerificationCenterModal
          centerId={editCenterId}
          onClose={() => setEditCenterId(null)}
          onUpdate={refresh}
        />
      )}
    </>
  );
}

