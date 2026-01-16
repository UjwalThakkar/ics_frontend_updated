// src/components/admin/common/StatusBadge.tsx
interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const colors: Record<string, string> = {
    submitted: "bg-yellow-100 text-yellow-800",
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    under_review: "bg-blue-100 text-blue-800",
    processing: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    "no-show": "bg-gray-100 text-gray-800",
  };

  const color = colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  
  // Format status for display
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'in-progress': 'In Progress',
      'under_review': 'Under Review',
      'no-show': 'No Show',
    };
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
      {formatStatus(status)}
    </span>
  );
}