// src/components/admin/appointments/AppointmentDetailsModal.tsx
import { X, Calendar, Clock, MapPin, User, FileText, Shield, Phone } from "lucide-react";
import { AppointmentDetails } from "@/types/admin";

interface Props {
  appointment: AppointmentDetails | null;
  onClose: () => void;
}

export default function AppointmentDetailsModal({ appointment, onClose }: Props) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Applicant */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" /> Applicant
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {appointment.first_name} {appointment.last_name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {appointment.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {appointment.phone_no || "N/A"}
              </div>
              <div>
                <span className="font-medium">Passport:</span> {appointment.passport_no}
              </div>
              <div>
                <span className="font-medium">DOB:</span> {appointment.date_of_birth}
              </div>
              <div>
                <span className="font-medium">Nationality:</span> {appointment.nationality}
              </div>
            </div>
          </div>

          {/* Service & Counter */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Service
            </h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Service:</span> {appointment.service_name}</div>
              <div><span className="font-medium">Category:</span> {appointment.service_category}</div>
              <div><span className="font-medium">Processing Time:</span> {appointment.processing_time}</div>
              <div><span className="font-medium">Counter:</span> {appointment.counter_name}</div>
            </div>
          </div>

          {/* Appointment Time */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" /> Appointment
            </h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Date:</span> {new Date(appointment.appointment_date).toLocaleDateString()}</div>
              <div><span className="font-medium">Time:</span> {appointment.start_time} – {appointment.end_time} ({appointment.duration} min)</div>
              <div><span className="font-medium">Status:</span> <span className="capitalize">{appointment.appointment_status}</span></div>
            </div>
          </div>

          {/* Center */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2" /> Verification Center
            </h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Center:</span> {appointment.center_name}</div>
              <div>{appointment.address}, {appointment.city}</div>
              <div>{appointment.state}, {appointment.country}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}