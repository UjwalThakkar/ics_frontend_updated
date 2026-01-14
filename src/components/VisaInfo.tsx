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

const VisaInfo = () => {
  const [visaServices, setVisaServices] = useState<Service[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<number | null>(null);
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
          const filteredVisas = data.services.filter(
            (service: Service) => service.category.toLowerCase() === "visa"
          );
          setVisaServices(filteredVisas);
        } else {
          setError("Failed to load visa types");
        }
      } catch (err) {
        setError("Error fetching visa types");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedVisa !== null) {
      setLoadingDetails(true);
      const fetchDetails = async () => {
        try {
          const data = await phpAPI.admin.getServiceDetail(selectedVisa);
          setDetails(data.details);
        } catch (err) {
          setError("Failed to load visa details");
          setDetails(null);
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchDetails();
    }
  }, [selectedVisa]);

  const getTitle = () => {
    const visa = visaServices.find((v) => v.service_id === selectedVisa);
    return visa ? visa.title : "Tourist Visa"; // Default to match screenshot
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
          Please select visa type
        </label>
        <select
          value={selectedVisa || ""}
          onChange={(e) => setSelectedVisa(Number(e.target.value) || null)}
          className="w-full max-w-md border  rounded-md py-3 px-4 text-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
        >
          <option value="">Visa Category</option>
          {visaServices.map((visa) => (
            <option key={visa.service_id} value={visa.service_id}>
              {visa.title}
            </option>
          ))}
        </select>
      </div>

      {/* Visa Details Section */}
      {selectedVisa && (
        <div className=" ">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {getTitle()}
          </h1>
          <div className="border-b mb-8">
            <nav className="flex space-x-6 text-md text-gray-800">
              {[
                { id: "overview", label: "Overview" },
                { id: "visa_fees", label: "Visa Fees" },
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
                {activeTab === "visa_fees" && (
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
              No details available for this visa type.
            </p>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-center py-4">{error}</p>}
    </div>
  );
};

export default VisaInfo;
