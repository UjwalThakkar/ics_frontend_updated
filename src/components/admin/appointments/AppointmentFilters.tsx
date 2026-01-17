// src/components/admin/appointments/AppointmentFilters.tsx
import { Search } from "lucide-react";
import { Center } from "@/types/admin";

interface Props {
  search: string;
  setSearch: (s: string) => void;
  status: string;
  setStatus: (s: string) => void;
  centerId: string;
  setCenterId: (s: string) => void;
  dateFrom: string;
  setDateFrom: (s: string) => void;
  dateTo: string;
  setDateTo: (s: string) => void;
  setPage: (p: number) => void;
  centers?: Center[];
}

const today = new Date().toISOString().split("T")[0];

export default function AppointmentFilters({
  search, setSearch, status, setStatus, centerId, setCenterId,
  dateFrom, setDateFrom, dateTo, setDateTo, setPage, centers = []
}: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Appointments Management</h2>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Name / Passport"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-Show</option>
        </select>
        <select
          value={centerId}
          onChange={(e) => { setCenterId(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Centers</option>
          {centers.map((center) => (
            <option key={center.center_id} value={center.center_id}>
              {center.name} {center.city && `(${center.city})`}
            </option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm" />
      </div>
    </div>
  );
}