// src/components/admin/common/Pagination.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "@/types/admin";

interface Props {
  pagination: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({ pagination, currentPage, onPageChange }: Props) {
  return (
    <div className="bg-white px-6 py-3 flex items-center justify-between border-t">
      <div className="text-sm text-gray-700">
        Page <span className="font-medium">{pagination.page}</span> of{" "}
        <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} total)
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(pagination.totalPages, currentPage + 1))}
          disabled={currentPage === pagination.totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}