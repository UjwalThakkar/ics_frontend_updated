// src/components/admin/appointments/AppointmentRow.tsx
import { Eye, Edit } from "lucide-react";
import { Appointment } from "@/types/admin";
import StatusBadge from "../common/StatusBadge";

interface Props {
  appt: Appointment;
  onView: (id: number) => void;
  onEdit: (appt: Appointment) => void;
}

export default function AppointmentRow({
  appt,
  onView,
  onEdit,
}: Props) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
        {appt.appointment_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {appt.first_name} {appt.last_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {appt.passport_no}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {appt.counter_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(appt.appointment_date).toLocaleDateString()} - Slot{" "}
        {appt.slot}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={appt.appointment_status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(appt.appointment_id)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(appt)}
            className="text-green-600 hover:text-green-900"
            title="Update Status"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
