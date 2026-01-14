"use client";
import React, { useState, useEffect } from "react";
import { phpAPI } from "@/lib/php-api-client";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

interface Service {
  service_id: number;
  category: string;
  title: string;
  description: string;
  processing_time: string;
  fees: Array<{ type: string; amount: number }>;
  required_documents: string[];
  eligibility_requirements: string[];
  is_active: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ServiceDetails {
  overview: string;
  visa_fees: string;
  documents_required: string;
  photo_specifications: string;
  processing_time: string;
  downloads_form: string;
}

const PassportInfo = () => {
  const [passportServices, setPassportServices] = useState<Service[]>([]);
  const [selectedPassport, setSelectedPassport] = useState<number | null>(null);
  const [details, setDetails] = useState<ServiceDetails | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await phpAPI.getServices();
        const data = response.data;
        if (data.success) {
          const filteredPassports = data.services.filter(
            (service: Service) => service.category.toLowerCase() === "passport"
          );
          setPassportServices(filteredPassports);
        } else {
          setError("Failed to load passport types");
        }
      } catch (err) {
        setError("Error fetching passport types");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedPassport !== null) {
      setLoadingDetails(true);
      const fetchDetails = async () => {
        try {
          const data = await phpAPI.admin.getServiceDetail(selectedPassport);
          setDetails(data.details);
        } catch (err) {
          setError("Failed to load passport details");
          setDetails(null);
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchDetails();
    }
  }, [selectedPassport]);

  const getTitle = () => {
    const passport = passportServices.find((v) => v.service_id === selectedPassport);
    return passport ? passport.title : "New Passport"; // Default to match screenshot
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Dropdown Selector */}
      <div className="mb-12">
        <label className="block text-2xl font-bold text-gray-800 mb-2">
          Please select passport type
        </label>
        <select
          value={selectedPassport || ""}
          onChange={(e) => setSelectedPassport(Number(e.target.value) || null)}
          className="w-full max-w-md border  rounded-md py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
        >
          <option value="">Passport Category</option>
          {passportServices.map((passport) => (
            <option key={passport.service_id} value={passport.service_id}>
              {passport.title}
            </option>
          ))}
        </select>
      </div>

      {/* Passport Details Section */}
      {selectedPassport && (
        <div className=" ">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {getTitle()}
          </h1>
          <div className="border-b mb-8">
            <nav className="flex space-x-6 text-md text-gray-800">
              {[
                { id: "overview", label: "Overview" },
                { id: "passport_fees", label: "Passport Fees" },
                { id: "documents_required", label: "Documents Required" },
                { id: "photo_specifications", label: "Photo Specifications" },
                { id: "processing_time", label: "Processing Time" },
                { id: "downloads_form", label: "Download Forms" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 ${
                    activeTab === tab.id
                      ? "border-b-4 border-orange-500 font-semibold"
                      : "hover:border-b-4 hover:border-orange-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {loadingDetails ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-800" />
            </div>
          ) : details ? (
            <>
              <div className="prose prose-blue max-w-none text-gray-800">
                {activeTab === "overview" && (
                  <div dangerouslySetInnerHTML={{ __html: details.overview }} />
                )}
                {activeTab === "passport_fees" && (
                  <div
                    dangerouslySetInnerHTML={{ __html: details.visa_fees }}
                  />
                )}
                {activeTab === "documents_required" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: details.documents_required,
                    }}
                  />
                )}
                {activeTab === "photo_specifications" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: details.photo_specifications,
                    }}
                  />
                )}
                {activeTab === "processing_time" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: details.processing_time,
                    }}
                  />
                )}
                {activeTab === "downloads_form" && (
                  <div
                    dangerouslySetInnerHTML={{ __html: details.downloads_form }}
                  />
                )}
                <div className="flex w-full justify-end">
                  <button
                    onClick={() => redirect("/appointment")}
                    className="mt-8 px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 hover:text-white "
                  >
                    Book an Appointment
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No details available for this passport type.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-center py-4">{error}</p>}
    </div>
  );
};

export default PassportInfo;
