// src/components/admin/applications/miscellaneous/MiscellaneousApplicationsManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { phpAPI } from "@/lib/php-api-client";
import {
  MiscellaneousApplication,
  Pagination,
} from "@/types/admin";
import MiscellaneousApplicationFilters from "./MiscellaneousApplicationFilters";
import MiscellaneousApplicationsTable from "./MiscellaneousApplicationsTable";
import MiscellaneousApplicationDetailsModal from "./MiscellaneousApplicationDetailsModal";
import EditMiscellaneousApplicationModal from "./EditMiscellaneousApplicationModal";
import { Loader2, AlertCircle, FileText } from "lucide-react";

export default function MiscellaneousApplicationsManagement() {
  const [applications, setApplications] = useState<MiscellaneousApplication[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("submitted_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Modals
  const [selectedApplication, setSelectedApplication] =
    useState<MiscellaneousApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [
    page,
    statusFilter,
    serviceFilter,
    userFilter,
    dateFrom,
    dateTo,
    search,
    sortBy,
    sortOrder,
  ]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (statusFilter) params.status = statusFilter;
      if (serviceFilter) params.service_id = parseInt(serviceFilter);
      if (userFilter) params.user_id = parseInt(userFilter);
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search) params.search = search;

      const res = await phpAPI.admin.getMiscellaneousApplications(params);
      setApplications(res.applications || []);
      setPagination(res.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (app: MiscellaneousApplication) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  const handleEdit = (app: MiscellaneousApplication) => {
    setSelectedApplication(app);
    setShowEditModal(true);
  };

  const handleEditFromDetails = () => {
    setShowDetailsModal(false);
    if (selectedApplication) {
      setShowEditModal(true);
    }
  };

  const handleSave = () => {
    fetchApplications();
    setShowEditModal(false);
    setSelectedApplication(null);
  };

  return (
    <div>
      <MiscellaneousApplicationFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        serviceFilter={serviceFilter}
        setServiceFilter={setServiceFilter}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setCurrentPage={setPage}
      />

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {applications.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No miscellaneous applications found.</p>
        </div>
      )}

      {applications.length > 0 && (
        <MiscellaneousApplicationsTable
          applications={applications}
          pagination={pagination}
          currentPage={page}
          setCurrentPage={setPage}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}

      {showDetailsModal && selectedApplication && (
        <MiscellaneousApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
          onEdit={handleEditFromDetails}
        />
      )}

      {showEditModal && selectedApplication && (
        <EditMiscellaneousApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowEditModal(false);
            setSelectedApplication(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

