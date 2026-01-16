// src/components/admin/applications/miscellaneous/MiscellaneousApplicationDetailsModal.tsx
"use client";

import { X, Download, FileText, User, Mail, Phone, Calendar } from "lucide-react";
import { MiscellaneousApplication, ApplicationFile } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";
import { useState, useEffect } from "react";
import StatusBadge from "../../common/StatusBadge";

interface Props {
  application: MiscellaneousApplication;
  onClose: () => void;
  onEdit: () => void;
}

export default function MiscellaneousApplicationDetailsModal({
  application,
  onClose,
  onEdit,
}: Props) {
  const [files, setFiles] = useState<ApplicationFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
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

  const handleDownload = async (file: ApplicationFile) => {
    setDownloadingFile(file.file_id);
    try {
      const blob = await phpAPI.admin.downloadMiscellaneousApplicationFile(
        application.application_id,
        file.file_id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Failed to download file");
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Application Details
            </h2>
            <p className="text-sm text-gray-500">{application.application_id}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <StatusBadge status={application.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Service</label>
              <div className="mt-1 text-sm text-gray-900">
                {application.service_title}
              </div>
            </div>
          </div>

          {/* Submitted By (User Account) */}
          {(application.user_first_name || application.user_last_name || application.user_email) && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Submitted By (User Account)
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.user_first_name && application.user_last_name
                      ? `${application.user_first_name} ${application.user_last_name}`
                      : application.user_first_name || application.user_last_name || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.user_email || "N/A"}
                  </div>
                </div>
                {application.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.user_id}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                Note: This is the user account that submitted the application. The applicant information below may be different if the user submitted on behalf of someone else.
              </p>
            </div>
          )}

          {/* Personal Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <div className="mt-1 text-sm text-gray-900">{application.full_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nationality</label>
                <div className="mt-1 text-sm text-gray-900">{application.nationality}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.date_of_birth
                    ? new Date(application.date_of_birth).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Place of Birth</label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.place_of_birth || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Family Information */}
          {(application.father_name ||
            application.mother_name ||
            application.spouse_name) && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Family Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {application.father_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Father's Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.father_name}
                      {application.father_nationality &&
                        ` (${application.father_nationality})`}
                    </div>
                  </div>
                )}
                {application.mother_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mother's Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.mother_name}
                      {application.mother_nationality &&
                        ` (${application.mother_nationality})`}
                    </div>
                  </div>
                )}
                {application.spouse_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Spouse Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.spouse_name}
                      {application.spouse_nationality &&
                        ` (${application.spouse_nationality})`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.email_address || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.phone_number || "N/A"}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Present Address (South Africa)
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.present_address_sa || "N/A"}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Permanent Address (India)
                </label>
                <div className="mt-1 text-sm text-gray-900">
                  {application.permanent_address_india || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {(application.profession || application.employer_details) && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {application.profession && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Profession
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.profession}
                    </div>
                  </div>
                )}
                {application.employer_details && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Employer Details
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.employer_details}
                    </div>
                  </div>
                )}
                {application.visa_immigration_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Visa/Immigration Status
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {application.visa_immigration_status}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passport Information */}
          {application.passport_number && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Passport Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Passport Number
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.passport_number}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Validity
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.passport_validity
                      ? new Date(application.passport_validity).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date of Issue
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.passport_date_of_issue
                      ? new Date(application.passport_date_of_issue).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Place of Issue
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.passport_place_of_issue || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Registration Information */}
          {application.is_registered_with_mission === 1 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mission Registration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration Number
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.registration_number || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration Date
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {application.registration_date
                      ? new Date(application.registration_date).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {application.admin_notes && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Notes
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">{application.admin_notes}</p>
              </div>
            </div>
          )}

          {/* Files */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Uploaded Files ({files.length})
            </h3>
            {loadingFiles ? (
              <div className="text-center py-4 text-gray-500">Loading files...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No files uploaded</div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {file.original_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.document_type} •{" "}
                          {(file.file_size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingFile === file.file_id}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        {downloadingFile === file.file_id ? "Downloading..." : "Download"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-500">Submitted At</label>
                <div className="mt-1 text-gray-900">
                  {new Date(application.submitted_at).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-500">Last Updated</label>
                <div className="mt-1 text-gray-900">
                  {new Date(application.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

