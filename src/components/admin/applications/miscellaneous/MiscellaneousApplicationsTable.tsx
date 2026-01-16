// src/components/admin/applications/miscellaneous/MiscellaneousApplicationsTable.tsx
"use client";

import { MiscellaneousApplication, Pagination } from "@/types/admin";
import MiscellaneousApplicationRow from "./MiscellaneousApplicationRow";
import PaginationComponent from "../../common/Pagination";

interface Props {
  applications: MiscellaneousApplication[];
  pagination: Pagination | null;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  onView: (app: MiscellaneousApplication) => void;
  onEdit: (app: MiscellaneousApplication) => void;
}

export default function MiscellaneousApplicationsTable({
  applications,
  pagination,
  currentPage,
  setCurrentPage,
  onView,
  onEdit,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Files
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <MiscellaneousApplicationRow
                key={app.id}
                app={app}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <PaginationComponent
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

