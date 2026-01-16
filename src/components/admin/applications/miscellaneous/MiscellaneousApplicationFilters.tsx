// src/components/admin/applications/miscellaneous/MiscellaneousApplicationFilters.tsx
"use client";

import { Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { Service } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface Props {
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  serviceFilter: string;
  setServiceFilter: (s: string) => void;
  userFilter: string;
  setUserFilter: (u: string) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  search: string;
  setSearch: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  sortOrder: "ASC" | "DESC";
  setSortOrder: (o: "ASC" | "DESC") => void;
  setCurrentPage: (p: number) => void;
}

export default function MiscellaneousApplicationFilters({
  statusFilter,
  setStatusFilter,
  serviceFilter,
  setServiceFilter,
  userFilter,
  setUserFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  search,
  setSearch,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setCurrentPage,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await phpAPI.admin.getServices({ limit: 100 });
        // Filter only Miscellaneous services
        const miscServices = res.services.filter(
          (s) => s.category === "Miscellaneous"
        );
        setServices(miscServices);
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };
    fetchServices();
  }, []);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Miscellaneous Applications
        </h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
        >
          <Filter className="h-4 w-4" />
          <span>{showAdvanced ? "Hide" : "Show"} Filters</span>
        </button>
      </div>

      {/* Basic Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone, or passport..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID (Submitted By)
            </label>
            <input
              type="number"
              placeholder="Filter by user ID"
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for all users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            handleFilterChange();
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="submitted_at">Submitted Date</option>
          <option value="updated_at">Updated Date</option>
          <option value="full_name">Name</option>
          <option value="status">Status</option>
          <option value="service_title">Service</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value as "ASC" | "DESC");
            handleFilterChange();
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>
      </div>
    </div>
  );
}

