// src/components/admin/services/EditServiceModal.tsx
import { X, Loader2, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Center } from "@/types/admin";
import { phpAPI } from "@/lib/php-api-client";

interface FeeRow {
  type: string;
  amount: string;
}

interface DocumentRequirement {
  name: string;
  alternatives: string[];
  note?: string; // Additional instructions/notes for the document
}

interface Props {
  serviceId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditServiceModal({
  serviceId,
  onClose,
  onUpdate,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    processing_time: "",
    required_documents: "",
    eligibility_requirements: "",
    display_order: 99,
    is_active: 1 as 0 | 1,
  });

  const [fees, setFees] = useState<FeeRow[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterIds, setSelectedCenterIds] = useState<number[]>([]);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);

  // Toggle center selection
  const toggleCenter = (centerId: number) => {
    setSelectedCenterIds((prev) =>
      prev.includes(centerId)
        ? prev.filter((id) => id !== centerId)
        : [...prev, centerId]
    );
  };

  // Fee helpers
  const addFeeRow = () =>
    setFees((prev) => [...prev, { type: "", amount: "" }]);
  const removeFeeRow = (idx: number) =>
    setFees((prev) => prev.filter((_, i) => i !== idx));
  const updateFeeRow = (idx: number, field: "type" | "amount", value: string) =>
    setFees((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );

  // Document requirements management
  const addDocumentRequirement = () => {
    setDocumentRequirements(prev => [...prev, { name: "", alternatives: [] }]);
  };

  const removeDocumentRequirement = (index: number) => {
    setDocumentRequirements(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateDocumentName = (index: number, name: string) => {
    setDocumentRequirements(prev =>
      prev.map((doc, idx) => (idx === index ? { ...doc, name } : doc))
    );
  };

  const addAlternative = (docIndex: number) => {
    setDocumentRequirements(prev =>
      prev.map((doc, idx) =>
        idx === docIndex ? { ...doc, alternatives: [...doc.alternatives, ""] } : doc
      )
    );
  };

  const removeAlternative = (docIndex: number, altIndex: number) => {
    setDocumentRequirements(prev =>
      prev.map((doc, idx) =>
        idx === docIndex
          ? { ...doc, alternatives: doc.alternatives.filter((_, aIdx) => aIdx !== altIndex) }
          : doc
      )
    );
  };

  const updateAlternative = (docIndex: number, altIndex: number, value: string) => {
    setDocumentRequirements(prev =>
      prev.map((doc, idx) =>
        idx === docIndex
          ? {
              ...doc,
              alternatives: doc.alternatives.map((alt, aIdx) =>
                aIdx === altIndex ? value : alt
              ),
            }
          : doc
      )
    );
  };

  const updateDocumentNote = (docIndex: number, note: string) => {
    setDocumentRequirements(prev =>
      prev.map((doc, idx) => (idx === docIndex ? { ...doc, note } : doc))
    );
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await phpAPI.getCategories();
        setCategories(res.data?.categories || []);
      } catch {
        console.warn("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        categoryInputRef.current &&
        !categoryInputRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories based on input
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(form.category.toLowerCase())
  );

  // Check if current input matches an existing category (case-insensitive)
  const exactMatch = categories.some(
    (cat) => cat.toLowerCase() === form.category.toLowerCase()
  );

  const selectCategory = (category: string) => {
    setForm({ ...form, category });
    setShowCategoryDropdown(false);
    categoryInputRef.current?.blur();
  };

  // Load service + centers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [serviceRes, centersRes] = await Promise.all([
          phpAPI.admin.getService(serviceId),
          phpAPI.admin.getActiveCenters(),
        ]);

        const s = serviceRes.service;

        // Handle required_documents - support both old format (array of strings) and new format (array of objects)
        let docRequirements: DocumentRequirement[] = [];
        if (Array.isArray(s.required_documents)) {
          if (s.required_documents.length > 0) {
            // Check if it's new format (objects with name and alternatives)
            if (typeof s.required_documents[0] === 'object' && s.required_documents[0].name) {
              docRequirements = s.required_documents.map((doc: any) => ({
                name: doc.name || '',
                alternatives: Array.isArray(doc.alternatives) ? doc.alternatives : [],
                note: doc.note || undefined
              }));
            } else {
              // Old format (array of strings) - convert to new format
              docRequirements = s.required_documents.map((doc: string) => ({
                name: doc,
                alternatives: []
              }));
            }
          }
        }

        // Populate form
        setForm({
          category: s.category ?? "",
          title: s.title ?? "",
          description: s.description ?? "",
          processing_time: s.processing_time ?? "",
          required_documents: "", // Keep for backward compatibility but use documentRequirements state
          eligibility_requirements: Array.isArray(s.eligibility_requirements)
            ? s.eligibility_requirements.join(", ")
            : "",
          display_order: Number(s.display_order) ?? 99,
          is_active: s.is_active ? 1 : 0,
        });

        setDocumentRequirements(docRequirements);

        // Populate fees
        const feeRows =
          Array.isArray(s.fees) && s.fees.length > 0
            ? s.fees.map((f: any) => ({
                type: f.type ?? "",
                amount: String(f.amount ?? ""),
              }))
            : [{ type: "", amount: "" }];
        setFees(feeRows);

        // Set centers and pre-select
        setCenters(centersRes.centers || []);
        setSelectedCenterIds(centersRes.centers[0].center_id);
      } catch (err) {
        alert("Failed to load service or centers");
        onClose();
      } finally {
        setLoading(false);
        setLoadingCenters(false);
      }
    };

    fetchData();
  }, [serviceId, onClose]);

  // Submit update
  const handleSubmit = async () => {
    if (selectedCenterIds.length === 0) {
      alert("Please select at least one verification center");
      return;
    }

    try {
      // Prepare required_documents
      let finalRequiredDocs: Array<{ name: string; alternatives: string[] }> = [];
      
      if (documentRequirements.length > 0) {
        finalRequiredDocs = documentRequirements
          .filter(doc => doc.name.trim())
          .map(doc => ({
            name: doc.name.trim(),
            alternatives: doc.alternatives.filter(alt => alt.trim()).map(alt => alt.trim()),
            note: doc.note?.trim() || undefined
          }));
      } else if (form.required_documents.trim()) {
        // Fallback to old format if documentRequirements is empty but form field has data
        finalRequiredDocs = form.required_documents
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(name => ({ name, alternatives: [] }));
      }
      
      // Log for debugging
      console.log("Updating service with documentRequirements:", documentRequirements);
      console.log("Final required_documents being sent:", finalRequiredDocs);

      const payload: any = {
        category: form.category.trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        processing_time: form.processing_time.trim() || undefined,
        fees: fees
          .filter((r) => r.type.trim() && r.amount.trim())
          .map((r) => ({ type: r.type.trim(), amount: Number(r.amount) })),
        required_documents: finalRequiredDocs,
        eligibility_requirements: form.eligibility_requirements
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        center_ids: selectedCenterIds,
        display_order: form.display_order
          ? Number(form.display_order)
          : undefined,
        is_active: form.is_active,
      };

      await phpAPI.admin.updateService(serviceId, payload);
      onUpdate();
      onClose();
    } catch (err: any) {
      alert(err?.message || "Failed to update service");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Category & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={categoryInputRef}
                  value={form.category}
                  onChange={(e) => {
                    setForm({ ...form, category: e.target.value });
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Passport Services"
                />
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              
              {/* Category Dropdown */}
              {showCategoryDropdown && (
                <div
                  ref={categoryDropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {loadingCategories ? (
                    <div className="p-3 text-sm text-gray-500 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading categories...
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    <>
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => selectCategory(cat)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                        >
                          {cat}
                        </button>
                      ))}
                      {!exactMatch && form.category.trim() && (
                        <div className="border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              selectCategory(form.category.trim());
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm text-gray-600 italic"
                          >
                            + Create new: "{form.category.trim()}"
                          </button>
                        </div>
                      )}
                    </>
                  ) : form.category.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        selectCategory(form.category.trim());
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm text-gray-600 italic"
                    >
                      + Create new: "{form.category.trim()}"
                    </button>
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No categories found. Type to create a new one.
                    </div>
                  )}
                </div>
              )}
              
              {/* Hint text */}
              {form.category && !exactMatch && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ This will create a new category. Check suggestions above to use an existing one.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Passport Renewal"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the service"
            />
          </div>

          {/* Processing Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Processing Time
            </label>
            <input
              value={form.processing_time}
              onChange={(e) =>
                setForm({ ...form, processing_time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 4-6 weeks"
            />
          </div>

          {/* Verification Centers */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available at Verification Centers
              <span className="text-red-500">*</span>
            </label>
            {loadingCenters ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading centers...
              </div>
            ) : centers.length === 0 ? (
              <p className="text-sm text-red-600">No active centers found</p>
            ) : (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                {centers.map((c) => (
                  <label
                    key={c.center_id}
                    className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCenterIds.includes(c.center_id)}
                      onChange={() => toggleCenter(c.center_id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.city}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedCenterIds.length} center(s)
            </p>
          </div> */}

          {/* Fees */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Fees
              </label>
              <button
                type="button"
                onClick={addFeeRow}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                + Add fee type
              </button>
            </div>
            <div className="space-y-3">
              {fees.map((row, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input
                    placeholder="Type (e.g. standard)"
                    value={row.type}
                    onChange={(e) => updateFeeRow(idx, "type", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={row.amount}
                    onChange={(e) =>
                      updateFeeRow(idx, "amount", e.target.value)
                    }
                    className="w-32 px-3 py-2 border rounded-md text-sm"
                  />
                  {fees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeeRow(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Document Requirements */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Required Documents
              </label>
              <button
                type="button"
                onClick={addDocumentRequirement}
                className="text-xs text-blue-600 hover:underline"
              >
                + Add Document Requirement
              </button>
            </div>
            {documentRequirements.length === 0 ? (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">
                  No document requirements added. Click "+ Add Document Requirement" to add one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documentRequirements.map((doc, docIndex) => (
                  <div key={docIndex} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Document Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => updateDocumentName(docIndex, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="e.g. Residential Proof, Passport, Photo"
                        />
                      </div>
                      {documentRequirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocumentRequirement(docIndex)}
                          className="mt-6 text-red-600 hover:text-red-800"
                          title="Remove document requirement"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {/* Alternatives */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-medium text-gray-600">
                          Alternative Documents (Optional)
                        </label>
                        <button
                          type="button"
                          onClick={() => addAlternative(docIndex)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          + Add Alternative
                        </button>
                      </div>
                      {doc.alternatives.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No alternatives. Users must provide "{doc.name || "this document"}".
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {doc.alternatives.map((alt, altIndex) => (
                            <div key={altIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={alt}
                                onChange={(e) =>
                                  updateAlternative(docIndex, altIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                                placeholder="e.g. Aadhar Card, Light Bill, Bank Statement"
                              />
                              <button
                                type="button"
                                onClick={() => removeAlternative(docIndex, altIndex)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove alternative"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {doc.alternatives.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Users can choose any one of these alternatives to satisfy "{doc.name || "this requirement"}".
                        </p>
                      )}
                    </div>

                    {/* Document Note/Instructions */}
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Additional Instructions/Notes (Optional)
                      </label>
                      <textarea
                        value={doc.note || ""}
                        onChange={(e) => updateDocumentNote(docIndex, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Document must be clear and readable, Maximum file size: 5MB, Must be in PDF or JPG format..."
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        These instructions will be shown to users when uploading this document.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eligibility Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eligibility Requirements (comma-separated)
            </label>
            <input
              value={form.eligibility_requirements}
              onChange={(e) =>
                setForm({ ...form, eligibility_requirements: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Indian citizen, Age 18+"
            />
          </div>

          {/* Display Order & Active */}
          <div className="flex gap-6 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm({
                    ...form,
                    display_order:
                      e.target.value === "" ? 99 : Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active === 1}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked ? 1 : 0 })
                }
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Update Service
          </button>
        </div>
      </div>
    </div>
  );
}
