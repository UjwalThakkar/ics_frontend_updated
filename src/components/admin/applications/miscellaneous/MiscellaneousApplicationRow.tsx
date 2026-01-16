// src/components/admin/applications/miscellaneous/MiscellaneousApplicationRow.tsx
"use client";

import { Eye, Edit, Download } from "lucide-react";
import { MiscellaneousApplication } from "@/types/admin";
import StatusBadge from "../../common/StatusBadge";

interface Props {
  app: MiscellaneousApplication;
  onView: (app: MiscellaneousApplication) => void;
  onEdit: (app: MiscellaneousApplication) => void;
}

export default function MiscellaneousApplicationRow({
  app,
  onView,
  onEdit,
}: Props) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
        {app.application_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{app.full_name}</div>
        <div className="text-xs text-gray-500">{app.nationality}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {app.user_first_name || app.user_last_name || app.user_email ? (
          <>
            <div className="font-medium text-gray-900">
              {app.user_first_name && app.user_last_name
                ? `${app.user_first_name} ${app.user_last_name}`
                : app.user_first_name || app.user_last_name || "User"}
            </div>
            <div className="text-xs text-gray-500">{app.user_email || "N/A"}</div>
            {app.user_id && (
              <div className="text-xs text-gray-400">ID: {app.user_id}</div>
            )}
          </>
        ) : (
          <span className="text-gray-400 italic">Guest/Not logged in</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>{app.email_address || "N/A"}</div>
        <div>{app.phone_number || "N/A"}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>{app.service_title}</div>
        <div className="text-xs text-gray-500">{app.service_category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={app.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(app.submitted_at).toLocaleDateString()}
        <div className="text-xs text-gray-400">
          {new Date(app.submitted_at).toLocaleTimeString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {app.file_count || 0} file{app.file_count !== 1 ? "s" : ""}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onView(app)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(app)}
            className="text-green-600 hover:text-green-900"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

