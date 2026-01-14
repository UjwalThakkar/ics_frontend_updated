"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Building,
} from "lucide-react";
import { phpAPI } from "@/lib/php-api-client";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────
interface Service {
  service_id: string;
  title: string;
  description: string;
  category: string;
  processing_time: string;
  fees: {
    description?: string;
    amount: string;
    currency?: string;
    type?: string;
  }[];
  required_documents: string[];
  is_active?: number;
}

interface Center {
  center_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
}

interface TimeSlot {
  slot_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  available_count: number;
  counter_number: string;
  counter_name: string;
}

interface ApplicantInfo {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  currentNationality: string;
  passportNumber: string;
  passportExpiry: string;
  contactNumber: string;
  email: string;
}

interface BookingResponse {
  appointmentId: string;
  appointment: {
    appointment_id: string;
    booked_date: string;
    start_time: string;
    end_time: string;
    center_name: string;
    center_address: string;
    counter_number: string;
    counter_name: string;
    service_title: string;
    client_name: string;
    user_email: string;
    client_phone: string;
  };
}

// ──────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────
export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  const [applicantInfo, setApplicantInfo] = useState<ApplicantInfo>({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    currentNationality: "Indian",
    passportNumber: "",
    passportExpiry: "",
    contactNumber: "",
    email: "",
  });

  const numberOfApplicants = 1;

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [bookingResponse, setBookingResponse] =
    useState<BookingResponse | null>(null);

  // ──────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) fetchCenters();
  }, [selectedService]);

  useEffect(() => {
    if (step === 3 && !applicantInfo.firstName) fetchUserDetails();
  }, [step]);

  useEffect(() => {
    if (selectedCenter && selectedService) fetchAvailableDates();
  }, [selectedCenter, selectedService]);

  useEffect(() => {
    if (selectedDate && selectedCenter && selectedService)
      fetchAvailableSlots();
  }, [selectedDate, selectedCenter, selectedService]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await phpAPI.getServices();
      if (res.data.success) {
        const activeServices = res.data.services.filter(
          (s: Service) => s.is_active !== 0
        );
        setServices(activeServices);
      } else
        throw new Error(res.data.error?.message ?? "Failed to load services");
    } catch (e) {
      console.error(e);
      alert("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await phpAPI.getCentersForService(
        selectedService!.service_id
      );
      if (res.data.success) setCenters(res.data.centers);
      else throw new Error(res.data.error?.message ?? "Failed to load centers");
    } catch (e) {
      console.error(e);
      alert("Failed to load centers");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await phpAPI.getUserDetails();
      if (res.data.success) {
        const u = res.data.user;
        setApplicantInfo({
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          gender: u.gender ?? "",
          dateOfBirth: u.date_of_birth ?? "",
          currentNationality: u.nationality ?? "Indian",
          passportNumber: u.passport_no ?? "",
          passportExpiry: u.passport_expiry ?? "",
          contactNumber: u.phone_no ?? "",
          email: u.email ?? "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDates = async () => {
    setLoading(true);
    try {
      const res = await phpAPI.getAvailableDates(
        selectedCenter!.center_id,
        selectedService!.service_id
      );
      if (res.data.success)
        setAvailableDates(res.data.dates.map((d: any) => d.date));
      else throw new Error(res.data.error?.message ?? "Failed to load dates");
    } catch (e) {
      console.error(e);
      alert("Failed to load dates");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const res = await phpAPI.getAvailableSlots(
        selectedCenter!.center_id,
        selectedService!.service_id,
        selectedDate
      );
      if (res.data.success) setAvailableSlots(res.data.slots ?? []);
      else throw new Error(res.data.error?.message ?? "Failed to load slots");
    } catch (e) {
      console.error(e);
      alert("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const payload = {
        serviceId: selectedService!.service_id,
        centerId: selectedCenter!.center_id,
        date: selectedDate,
        slotId: selectedSlot.slot_id,
        userDetails: {
          gender: applicantInfo.gender,
          dateOfBirth: applicantInfo.dateOfBirth,
          nationality: applicantInfo.currentNationality,
          passportNo: applicantInfo.passportNumber,
          passportExpiry: applicantInfo.passportExpiry,
          phoneNo: applicantInfo.contactNumber,
        },
      };

      const res = await phpAPI.bookAppointment(payload);
      if (res.data.success) {
        setBookingResponse({
          appointmentId: res.data.appointmentId,
          appointment: res.data.confirmation,
        });
        setStep(7);
      } else {
        alert(res.data.error?.message ?? "Booking failed");
      }
    } catch (e) {
      console.error(e);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!bookingResponse) return;
    const win = window.open("", "_blank");
    if (!win) return;

    const { appointment } = bookingResponse;
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>Appointment ${appointment.appointment_id}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:auto}
        .header{text-align:center;border-bottom:3px solid #FF9933;padding-bottom:20px;margin-bottom:30px}
        .logo{color:#000080;font-size:24px;font-weight:bold}
        .id{background:#FF9933;color:#fff;padding:10px 20px;border-radius:5px;display:inline-block;margin:20px 0;font-size:18px;font-weight:bold}
        .section{margin:20px 0;padding:15px;border:1px solid #ddd;border-radius:5px}
        .section h3{color:#000080;margin-top:0}
        .row{display:flex;padding:8px 0;border-bottom:1px solid #f0f0f0}
        .label{font-weight:bold;width:200px}
        .value{flex:1}
        .footer{margin-top:40px;padding-top:20px;border-top:2px solid #138808;text-align:center;color:#666}
        @media print{body{padding:20px}}
      </style></head><body>
        <div class="header">
          <div class="logo">Indian Consular Services</div>
          <h2>Appointment Confirmation</h2>
          <div class="id">${appointment.appointment_id}</div>
        </div>

        <div class="section"><h3>Appointment Details</h3>
          <div class="row"><div class="label">Date:</div><div class="value">${new Date(
            appointment.booked_date
          ).toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</div></div>
          <div class="row"><div class="label">Time:</div><div class="value">${appointment.start_time.slice(
            0,
            5
          )} - ${appointment.end_time.slice(0, 5)}</div></div>
          <div class="row"><div class="label">Service:</div><div class="value">${
            appointment.service_title
          }</div></div>
          <div class="row"><div class="label">Counter:</div><div class="value">${
            appointment.counter_number
          } - ${appointment.counter_name}</div></div>
        </div>

        <div class="section"><h3>Applicant</h3>
          <div class="row"><div class="label">Name:</div><div class="value">${
            appointment.client_name
          }</div></div>
          <div class="row"><div class="label">Email:</div><div class="value">${
            appointment.user_email
          }</div></div>
          <div class="row"><div class="label">Phone:</div><div class="value">${
            appointment.client_phone
          }</div></div>
        </div>

        <div class="section"><h3>Location</h3>
          <div class="row"><div class="label">Center:</div><div class="value">${
            appointment.center_name
          }</div></div>
          <div class="row"><div class="label">Address:</div><div class="value">${
            appointment.center_address
          }</div></div>
        </div>

        <div class="section"><h3>Instructions</h3>
          <ul>
            <li>Arrive 15 minutes early</li>
            <li>Bring all required documents</li>
            <li>Carry photo ID</li>
            <li>Print or show this confirmation</li>
          </ul>
        </div>

        <div class="footer">
          <p><strong>Contact:</strong> ${appointment.center_name}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p style="margin-top:20px;color:#FF9933;">Government of India – Ministry of External Affairs</p>
        </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const isStepValid = (s: number): boolean => {
    switch (s) {
      case 1:
        return !!selectedService;
      case 2:
        return !!selectedCenter;
      case 3:
        return (
          applicantInfo.firstName.trim() &&
          applicantInfo.lastName.trim() &&
          applicantInfo.gender &&
          applicantInfo.dateOfBirth &&
          applicantInfo.currentNationality &&
          applicantInfo.passportNumber.trim() &&
          applicantInfo.passportExpiry &&
          applicantInfo.contactNumber.trim() &&
          applicantInfo.email.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantInfo.email)
        );
      case 5:
        return !!selectedDate && !!selectedSlot;
      default:
        return true;
    }
  };

  // Get unique categories, sorted nicely
  const categories = Array.from(new Set(services.map((s) => s.category))).sort(
    (a, b) => {
      const order = [
        "Passport",
        "Visa",
        "OCI",
        "Document Verification",
        "Attestation",
        "Others",
      ];
      const aIdx = order.indexOf(a);
      const bIdx = order.indexOf(b);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            Book Your <span className="text-orange-500">Appointment</span>
          </h1>
          <p className="text-gray-600">
            Indian Consular Services – simple steps
          </p>
        </div>

        {/* Progress Bar */}
        {step < 7 && (
          <div className="mb-8 flex items-center justify-between max-w-4xl mx-auto">
            {[
              { n: 1, l: "Category" },
              { n: 2, l: "Center" },
              { n: 3, l: "Details" },
              { n: 4, l: "Applicants" },
              { n: 5, l: "Date & Time" },
              { n: 6, l: "Confirm" },
            ].map((i, idx) => (
              <div key={i.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= i.n
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > i.n ? "✓" : i.n}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      step >= i.n
                        ? "text-orange-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {i.l}
                  </span>
                </div>
                {idx < 5 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > i.n ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* ───── STEP 1: Service Category Selection ───── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Select Service Category
              </h2>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {categories.map((category) => {
                    const categoryServices = services.filter(
                      (s) => s.category === category
                    );
                    const firstService = categoryServices[0];

                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedService(firstService);
                          // You can later change to a sub-step if needed
                        }}
                        className={`group p-10 border-2 rounded-2xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                          selectedService?.category === category
                            ? "border-orange-500 bg-orange-50 shadow-lg"
                            : "border-gray-200 hover:border-orange-400"
                        }`}
                      >
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-200 transition-colors">
                          <FileText className="w-10 h-10 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {categoryServices.length} service
                          {categoryServices.length > 1 ? "s" : ""} available
                        </p>
                        {/* {selectedService?.category === category && (
                          <p className="mt-4 text-sm font-medium text-orange-600">
                            Selected: {selectedService.title}
                          </p>
                        )} */}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedService}
                  className="px-10 py-4 bg-orange-500 text-white rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 flex items-center shadow-lg disabled:shadow-none"
                >
                  Continue with {selectedService?.category || "Selected"}{" "}
                  Service
                  <ArrowRight className="w-6 h-6 ml-3" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 2 ───── */}
          {step === 2 && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="mb-4 text-gray-600 hover:text-orange-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Select Application Center
              </h2>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {centers.map((c) => (
                    <button
                      key={c.center_id}
                      onClick={() => setSelectedCenter(c)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                        selectedCenter?.center_id === c.center_id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-start">
                        <Building className="w-5 h-5 text-orange-500 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {c.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {c.address}, {c.city}
                          </p>
                          <p className="text-xs text-gray-500">{c.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStepValid(2)}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-orange-600 flex items-center"
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 3 ───── */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="mb-4 text-gray-600 hover:text-orange-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Applicant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.firstName}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="First name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.lastName}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Last name"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={applicantInfo.gender}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={applicantInfo.dateOfBirth}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.currentNationality}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        currentNationality: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Indian"
                  />
                </div>

                {/* Passport No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={applicantInfo.passportNumber}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        passportNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="A1234567"
                  />
                </div>

                {/* Passport Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Expiry
                  </label>
                  <input
                    type="date"
                    value={applicantInfo.passportExpiry}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        passportExpiry: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={applicantInfo.contactNumber}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        contactNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={applicantInfo.email}
                    onChange={(e) =>
                      setApplicantInfo({
                        ...applicantInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!isStepValid(3)}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-orange-600 flex items-center"
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 4 ───── */}
          {step === 4 && (
            <div>
              <button
                onClick={() => setStep(3)}
                className="mb-4 text-gray-600 hover:text-orange-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Number of Applicants
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <User className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      1 Applicant
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      The system currently supports one applicant per
                      appointment.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 flex items-center"
                >
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 5 ───── */}
          {step === 5 && (
            <div>
              <button
                onClick={() => setStep(4)}
                className="mb-4 text-gray-600 hover:text-orange-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Select Date & Time
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Date selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Choose a date --</option>
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {new Date(d).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {!selectedDate ? (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Please select a date first</p>
                    </div>
                  ) : loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No slots for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {availableSlots.map((s) => (
                        <button
                          key={s.slot_id}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3 border-2 rounded-lg text-sm transition-all ${
                            selectedSlot?.slot_id === s.slot_id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          <div className="font-semibold">
                            {s.start_time.slice(0, 5)} -{" "}
                            {s.end_time.slice(0, 5)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {s.available_count} spots left
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setStep(6)}
                  disabled={!isStepValid(5)}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-orange-600 flex items-center"
                >
                  Review Booking <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 6 ───── */}
          {step === 6 && (
            <div>
              <button
                onClick={() => setStep(5)}
                className="mb-4 text-gray-600 hover:text-orange-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Review Your Booking
              </h2>

              {/* Service */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold flex items-center mb-3">
                  <FileText className="w-5 h-5 mr-2 text-orange-500" /> Service
                </h3>
                <p className="text-sm">
                  <span className="text-gray-600">Title:</span>{" "}
                  {selectedService?.title}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Processing:</span>{" "}
                  {selectedService?.processing_time}
                </p>
              </div>

              {/* Center */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold flex items-center mb-3">
                  <Building className="w-5 h-5 mr-2 text-orange-500" /> Center
                </h3>
                <p className="font-medium">{selectedCenter?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedCenter?.address}, {selectedCenter?.city}
                </p>
              </div>

              {/* Applicant */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold flex items-center mb-3">
                  <User className="w-5 h-5 mr-2 text-orange-500" /> Applicant
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{" "}
                    {applicantInfo.firstName} {applicantInfo.lastName}
                  </div>
                  <div>
                    <span className="text-gray-600">Gender:</span>{" "}
                    {applicantInfo.gender}
                  </div>
                  <div>
                    <span className="text-gray-600">DOB:</span>{" "}
                    {new Date(applicantInfo.dateOfBirth).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-gray-600">Nationality:</span>{" "}
                    {applicantInfo.currentNationality}
                  </div>
                  <div>
                    <span className="text-gray-600">Passport:</span>{" "}
                    {applicantInfo.passportNumber}
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>{" "}
                    {applicantInfo.email}
                  </div>
                </div>
              </div>

              {/* Appointment */}
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold flex items-center mb-3">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />{" "}
                  Appointment
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>{" "}
                    {new Date(selectedDate).toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>{" "}
                    {selectedSlot?.start_time.slice(0, 5)} -{" "}
                    {selectedSlot?.end_time.slice(0, 5)}
                  </div>
                  <div>
                    <span className="text-gray-600">Counter:</span>{" "}
                    {selectedSlot?.counter_number} -{" "}
                    {selectedSlot?.counter_name}
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>{" "}
                    {selectedSlot?.duration_minutes} min
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important
                </h4>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Arrive 15 minutes early</li>
                  <li>Bring all required documents</li>
                  <li>Carry a photo ID</li>
                  <li>Appointment cannot be transferred</li>
                </ul>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:bg-gray-300 hover:bg-green-700 flex items-center"
                >
                  {loading ? (
                    <>Booking…</>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 7 ───── */}
          {step === 7 && bookingResponse && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Appointment Booked!
              </h2>
              <p className="text-gray-600 mb-8">
                Your appointment is confirmed.
              </p>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="text-center mb-4">
                  <span className="text-sm text-gray-600">Appointment ID</span>
                  <div className="text-3xl font-bold text-orange-600 mt-1">
                    {bookingResponse.appointmentId}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-600">Date</span>
                      <p className="font-semibold">
                        {new Date(
                          bookingResponse.appointment.booked_date
                        ).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Time</span>
                      <p className="font-semibold">
                        {bookingResponse.appointment.start_time.slice(0, 5)} -{" "}
                        {bookingResponse.appointment.end_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-600">Service</span>
                      <p className="font-semibold">
                        {bookingResponse.appointment.service_title}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Counter</span>
                      <p className="font-semibold">
                        {bookingResponse.appointment.counter_number} -{" "}
                        {bookingResponse.appointment.counter_name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-orange-200">
                  <p className="font-medium">
                    {bookingResponse.appointment.center_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookingResponse.appointment.center_address}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={generatePDF}
                  className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" /> Download PDF
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedService(null);
                    setSelectedCenter(null);
                    setAvailableDates([]);
                    setSelectedDate("");
                    setSelectedSlot(null);
                    setBookingResponse(null);
                    setApplicantInfo({
                      firstName: "",
                      lastName: "",
                      gender: "",
                      dateOfBirth: "",
                      currentNationality: "Indian",
                      passportNumber: "",
                      passportExpiry: "",
                      contactNumber: "",
                      email: "",
                    });
                  }}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Book Another
                </button>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>
                    Confirmation email sent to{" "}
                    {bookingResponse.appointment.user_email}
                  </strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
