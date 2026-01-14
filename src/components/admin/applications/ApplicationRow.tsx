// src/components/admin/applications/ApplicationRow.tsx
import { Eye, Edit, Trash2 } from "lucide-react";
import { Application } from "@/types/admin";
import StatusBadge from "../common/StatusBadge";

interface Props {
  app: Application;
}

export default function ApplicationRow({ app }: Props) {
  let info: any = {};
  try {
    info = JSON.parse(app.applicant_info);
  } catch {}
  const name = `${info.firstName || ""} ${info.lastName || ""}`.trim() || "N/A";
  const email = info.email || "N/A";
  const phone = info.phone || "N/A";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
        {app.application_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{email}</div>
        <div>{phone}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {app.service_title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={app.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(app.submitted_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
          <button className="text-green-600 hover:text-green-900"><Edit className="h-4 w-4" /></button>
          <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
}