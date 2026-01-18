// src/components/admin/applications/miscellaneous/EditMiscellaneousApplicationModal.tsx
"use client";

import { X, Save, Upload, FileText, Trash2 } from "lucide-react";
import { MiscellaneousApplication, ApplicationFile } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { useState, useEffect } from "react";

interface Props {
  application: MiscellaneousApplication;
  onClose: () => void;
  onSave: () => void;
}

export default function EditMiscellaneousApplicationModal({
  application,
  onClose,
  onSave,
}: Props) {
  const [formData, setFormData] = useState({
    full_name: application.full_name || "",
    nationality: application.nationality || "",
    father_name: application.father_name || "",
    father_nationality: application.father_nationality || "",
    mother_name: application.mother_name || "",
    mother_nationality: application.mother_nationality || "",
    date_of_birth: application.date_of_birth || "",
    place_of_birth: application.place_of_birth || "",
    country_of_birth: application.country_of_birth || "",
    spouse_name: application.spouse_name || "",
    spouse_nationality: application.spouse_nationality || "",
    present_address_sa: application.present_address_sa || "",
    phone_number: application.phone_number || "",
    email_address: application.email_address || "",
    profession: application.profession || "",
    employer_details: application.employer_details || "",
    visa_immigration_status: application.visa_immigration_status || "",
    permanent_address_india: application.permanent_address_india || "",
    passport_number: application.passport_number || "",
    passport_validity: application.passport_validity || "",
    passport_date_of_issue: application.passport_date_of_issue || "",
    passport_place_of_issue: application.passport_place_of_issue || "",
    is_registered_with_mission: application.is_registered_with_mission === 1,
    registration_number: application.registration_number || "",
    registration_date: application.registration_date || "",
    status: application.status,
    admin_notes: application.admin_notes || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // File upload state
  const [files, setFiles] = useState<ApplicationFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileDocumentType, setNewFileDocumentType] = useState("admin_upload");
  const [newFileDescription, setNewFileDescription] = useState("");

  // Fetch files when modal opens
  useEffect(() => {
    const fetchFiles = async () => {
      setLoadingFiles(true);
      try {
        const res = await phpAPI.admin.getMiscellaneousApplicationDetails(
          application.application_id
        );
        setFiles(res.files || []);
      } catch (err) {
        console.error("Failed to load files:", err);
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, [application.application_id]);

  // Update formData when application prop changes (e.g., after refresh)
  useEffect(() => {
    if (application) {
      setFormData({
        full_name: application.full_name || "",
        nationality: application.nationality || "",
        father_name: application.father_name || "",
        father_nationality: application.father_nationality || "",
        mother_name: application.mother_name || "",
        mother_nationality: application.mother_nationality || "",
        date_of_birth: application.date_of_birth || "",
        place_of_birth: application.place_of_birth || "",
        country_of_birth: application.country_of_birth || "",
        spouse_name: application.spouse_name || "",
        spouse_nationality: application.spouse_nationality || "",
        present_address_sa: application.present_address_sa || "",
        phone_number: application.phone_number || "",
        email_address: application.email_address || "",
        profession: application.profession || "",
        employer_details: application.employer_details || "",
        visa_immigration_status: application.visa_immigration_status || "",
        permanent_address_india: application.permanent_address_india || "",
        passport_number: application.passport_number || "",
        passport_validity: application.passport_validity || "",
        passport_date_of_issue: application.passport_date_of_issue || "",
        passport_place_of_issue: application.passport_place_of_issue || "",
        is_registered_with_mission: application.is_registered_with_mission === 1,
        registration_number: application.registration_number || "",
        registration_date: application.registration_date || "",
        status: application.status || "submitted", // Ensure status is set
        admin_notes: application.admin_notes || "",
      });
    }
  }, [application]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate: Admin notes are required when status is 'rejected'
    if (formData.status === 'rejected' && !formData.admin_notes?.trim()) {
      setError('Admin notes are required when rejecting an application. Please provide a reason for rejection.');
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('.bg-red-50');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setSaving(true);

      const payload: any = { ...formData };
      payload.is_registered_with_mission = formData.is_registered_with_mission ? 1 : 0;

      // Remove empty strings and convert to null (but keep status and admin_notes even if empty)
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" && key !== "status" && key !== "admin_notes") {
          payload[key] = null;
        }
      });

      // Ensure status is included in payload
      if (!payload.status) {
        payload.status = formData.status || "submitted";
      }

      console.log("Updating application with payload:", payload);
      console.log("Status being sent:", payload.status);

      await phpAPI.admin.updateMiscellaneousApplication(
        application.application_id,
        payload
      );
      
      console.log("Application updated successfully");
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newFile) {
      setError("Please select a file to upload");
      return;
    }

    setUploadingFile(true);
    setError(null);

    try {
      const result = await phpAPI.admin.uploadMiscellaneousApplicationFile(
        application.application_id,
        newFile,
        newFileDocumentType,
        newFileDescription || undefined
      );

      // Refresh files list
      const res = await phpAPI.admin.getMiscellaneousApplicationDetails(
        application.application_id
      );
      setFiles(res.files || []);

      // Reset form
      setNewFile(null);
      setNewFileDocumentType("admin_upload");
      setNewFileDescription("");
      
      // Clear file input
      const fileInput = document.getElementById('admin-file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      return;
    }

    try {
      // Note: You may need to add a delete endpoint in the backend
      // For now, we'll just show an error
      setError("File deletion not yet implemented. Please contact the developer.");
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
            <p className="text-sm text-gray-500">{application.application_id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="submitted">Submitted</option>
              <option value="in-progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Birth
                </label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Family Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Nationality
                </label>
                <input
                  type="text"
                  name="father_nationality"
                  value={formData.father_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mother's Nationality
                </label>
                <input
                  type="text"
                  name="mother_nationality"
                  value={formData.mother_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spouse Name
                </label>
                <input
                  type="text"
                  name="spouse_name"
                  value={formData.spouse_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spouse Nationality
                </label>
                <input
                  type="text"
                  name="spouse_nationality"
                  value={formData.spouse_nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Present Address (South Africa)
                </label>
                <textarea
                  name="present_address_sa"
                  value={formData.present_address_sa}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address (India)
                </label>
                <textarea
                  name="permanent_address_india"
                  value={formData.permanent_address_india}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Professional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visa/Immigration Status
                </label>
                <input
                  type="text"
                  name="visa_immigration_status"
                  value={formData.visa_immigration_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Details
                </label>
                <textarea
                  name="employer_details"
                  value={formData.employer_details}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Passport Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Passport Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number
                </label>
                <input
                  type="text"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity
                </label>
                <input
                  type="date"
                  name="passport_validity"
                  value={formData.passport_validity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Issue
                </label>
                <input
                  type="date"
                  name="passport_date_of_issue"
                  value={formData.passport_date_of_issue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place of Issue
                </label>
                <input
                  type="text"
                  name="passport_place_of_issue"
                  value={formData.passport_place_of_issue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Registration Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mission Registration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_registered_with_mission"
                    checked={formData.is_registered_with_mission}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Registered with Indian Mission/Post
                  </span>
                </label>
              </div>
              {formData.is_registered_with_mission && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registration_number"
                      value={formData.registration_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Date
                    </label>
                    <input
                      type="date"
                      name="registration_date"
                      value={formData.registration_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Admin Notes
              {formData.status === 'rejected' && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </h3>
            {formData.status === 'rejected' && (
              <p className="text-sm text-red-600 mb-2">
                Admin notes are required when rejecting an application. Please provide a reason for rejection.
              </p>
            )}
            <textarea
              name="admin_notes"
              value={formData.admin_notes}
              onChange={handleChange}
              rows={4}
              required={formData.status === 'rejected'}
              placeholder={
                formData.status === 'rejected' 
                  ? "Please provide a reason for rejection (required)..." 
                  : "Add any admin notes or comments here..."
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.status === 'rejected' && !formData.admin_notes?.trim()
                  ? 'border-red-500'
                  : ''
              }`}
            />
          </div>

          {/* Admin File Upload Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Additional Documents
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload additional supporting documents that may be required for this application.
            </p>

            {/* Upload Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin-file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 10MB. Allowed formats: PDF, JPG, PNG
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={newFileDocumentType}
                  onChange={(e) => setNewFileDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin_upload">Additional Supporting Document</option>
                  <option value="verification">Verification Document</option>
                  <option value="correction">Correction Document</option>
                  <option value="supplement">Supplemental Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newFileDescription}
                  onChange={(e) => setNewFileDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of the document..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleFileUpload}
                disabled={!newFile || uploadingFile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{uploadingFile ? "Uploading..." : "Upload File"}</span>
              </button>
            </div>

            {/* Uploaded Files List */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Uploaded Files ({files.length})
              </h4>
              {loadingFiles ? (
                <div className="text-center py-4 text-gray-500 text-sm">Loading files...</div>
              ) : files.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">No files uploaded</div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {file.original_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.document_type} • {(file.file_size / 1024).toFixed(2)} KB
                            {file.uploaded_by === null && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                Admin Upload
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.file_id)}
                        className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (formData.status === 'rejected' && !formData.admin_notes?.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title={formData.status === 'rejected' && !formData.admin_notes?.trim() ? 'Please provide admin notes before saving' : ''}
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

