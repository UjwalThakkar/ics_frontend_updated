// src/components/admin/layout/AdminSidebar.tsx
import {
  Home,
  FileText,
  Calendar,
  Users,
  Settings,
  Clock,
  Table,
} from "lucide-react";

const tabs = [
  // { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "users", label: "Users", icon: Users },
  { id: "services", label: "Services", icon: FileText },
  { id: "slots", label: "Slot Settings", icon: Clock },
  { id: "counters", label: "Counter Settings", icon: Table },
  { id: "service-details", label: "Service Details", icon: FileText },
  // { id: "settings", label: "Settings", icon: Settings },
];

interface Props {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: Props) {
  return (
    <nav className="bg-white w-64 min-h-screen shadow-sm">
      <div className="p-4">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
