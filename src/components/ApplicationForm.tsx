"use client";

import React, { useState } from "react";
import {
  FileText,
  User,
  Mail,
  Phone,
  Upload,
  CheckCircle,
  Download,
} from "lucide-react";
import { phpAPI } from "@/lib/php-api-client";
import DocumentUploader from "@/components/DocumentUploader";

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  gender: string;
  maritalStatus: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  serviceType: string;
  urgency: string;
  previousApplications: string;
  uploadedDocuments: Array<{
    name: string;
    size: number;
    type: string;
    file: File;
  }>;
}

interface ApplicationFormProps {
  serviceType: string;
  onSubmit: (formData: ApplicationFormData) => void;
  onSave: (formData: ApplicationFormData) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  serviceType,
  onSubmit,
  onSave,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionMethod, setSubmissionMethod] = useState<"online" | "pdf">(
    "online"
  );
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    gender: "",
    maritalStatus: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    serviceType: serviceType,
    urgency: "",
    previousApplications: "",
    uploadedDocuments: [],
  });

  const steps = [
    { id: 1, title: "Submission Method", icon: FileText },
    { id: 2, title: "Personal Information", icon: User },
    { id: 3, title: "Contact Details", icon: Mail },
    { id: 4, title: "Review & Submit", icon: CheckCircle },
  ];

  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const downloadPDFForm = () => {
    const formContent = `
${serviceType.replace("-", " ").toUpperCase()} APPLICATION FORM
Indian Consulate General, Johannesburg

PERSONAL INFORMATION:
- First Name: ________________________
- Last Name: _________________________
- Email: _____________________________
- Phone: _____________________________

Instructions:
1. Fill out this form completely
2. Gather all required documents
3. Schedule an appointment
4. Submit the form and documents in person

For online submission and tracking, visit: https://indianconsulate.gov.za
    `;

    const blob = new Blob([formContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${serviceType}-application-form.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (submissionMethod === "online") {
      console.log("submitting form data: ", formData);
      try {
        const response = await phpAPI.submitApplication({
          serviceType,
          applicantInfo: formData,
        });

        console.log("response from submissoin: ", response);

        if (response.success) {
          alert(
            `✅ Application submitted successfully!\n📧 Confirmation sent to: ${response?.applicationId}`
          );
          window.location.href = `/track?id=${response?.application_id}`;
        }
      } catch (error) {
        alert("❌ Failed to submit application. Please try again.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-[80%] mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-blue-700 text-white p-6 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">
          {serviceType
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
          Application
        </h1>
        <p className="text-blue-800">
          Complete the form below to submit your application
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                      ? "border-saffron text-saffron"
                      : "border-gray-300 text-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden md:block w-full h-1 mx-4 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Submission Method */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Choose Submission Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Online Submission Option */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  submissionMethod === "online"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
                onClick={() => setSubmissionMethod("online")}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    name="submissionMethod"
                    value="online"
                    checked={submissionMethod === "online"}
                    onChange={() => setSubmissionMethod("online")}
                    className="mr-3"
                  />
                  <h3 className="text-lg font-medium text-gray-900">
                    Online Submission
                  </h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Real-time application tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Instant form validation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Email notifications
                  </li>
                </ul>

                {/* Online Submission Option */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    submissionMethod === "online"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setSubmissionMethod("online")}
                >
                  <div className="flex items-center mb-4">
                    <input
                      type="radio"
                      name="submissionMethod"
                      value="online"
                      checked={submissionMethod === "online"}
                      onChange={() => setSubmissionMethod("online")}
                      className="mr-3"
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                      Online Submission
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {/* ... list items ... */}
                  </ul>

                  {/* ← HERE: Replace the empty <DocumentUploader /> with this */}
                  <div className="mt-6">
                    <DocumentUploader
                      documentType="passport"
                      onDataExtracted={(extractedData, confidence) => {
                        setFormData((prev) => ({
                          ...prev,
                          firstName:
                            extractedData.firstName ||
                            extractedData.fullName?.split(" ")[0] ||
                            prev.firstName,
                          lastName:
                            extractedData.lastName ||
                            extractedData.fullName?.split(" ").slice(-1)[0] ||
                            prev.lastName,
                          dateOfBirth:
                            extractedData.dateOfBirth || prev.dateOfBirth,
                          placeOfBirth:
                            extractedData.placeOfBirth || prev.placeOfBirth,
                          nationality:
                            extractedData.nationality ||
                            extractedData.issuingCountry ||
                            prev.nationality,
                          gender: extractedData.gender || prev.gender,
                        }));

                        const confidencePercent = Math.round(confidence * 100);
                        if (confidencePercent >= 80) {
                          alert(
                            `✅ Auto-filled with high confidence (${confidencePercent}%)!`
                          );
                        } else if (confidencePercent >= 50) {
                          alert(
                            `⚠️ Auto-filled with medium confidence (${confidencePercent}%). Please check.`
                          );
                        } else {
                          alert(
                            `ℹ️ Auto-filled with low confidence (${confidencePercent}%). Review carefully.`
                          );
                        }
                      }}
                      onError={(error) => {
                        alert(`❌ Extraction failed: ${error}`);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* PDF Download Option */}
              <div
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  submissionMethod === "pdf"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-300"
                }`}
                onClick={() => setSubmissionMethod("pdf")}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    name="submissionMethod"
                    value="pdf"
                    checked={submissionMethod === "pdf"}
                    onChange={() => setSubmissionMethod("pdf")}
                    className="mr-3"
                  />
                  <h3 className="text-lg font-medium text-gray-900">
                    Download PDF Form
                  </h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2" />
                    Fill offline at your convenience
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2" />
                    Print and submit in person
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2" />
                    No internet required after download
                  </li>
                </ul>

                <button
                  onClick={downloadPDFForm}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Continue with online form only if online submission is selected */}
        {submissionMethod === "online" && (
          <>
            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Review & Submit
                </h2>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-800 mb-4">
                    Application Summary
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {formData.phone}
                    </p>
                    <p>
                      <span className="font-medium">Service:</span>{" "}
                      {serviceType
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
          <div>
            {submissionMethod === "online" && currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
          </div>

          <div>
            {submissionMethod === "online" && (
              <>
                {currentStep < steps.length ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-2 bg-saffron text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
