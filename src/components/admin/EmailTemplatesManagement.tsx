"use client";

import { useState, useEffect, useRef } from "react";
import { phpAPI, NotificationTemplate } from "@/lib/php-api-client";
import TipTapEditor from "@/components/ui/TipTapEditor";
import { Loader2, Save, Edit, Eye, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function EmailTemplatesManagement() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const editorRef = useRef<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    category: "",
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, [filterType, filterCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;
      
      const res = await phpAPI.admin.getNotificationTemplates(params);
      setTemplates(res.templates || []);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setEditing(false);
    setFormData({
      name: template.name || "",
      subject: template.subject || "",
      content: template.content || "",
      category: template.category || "",
      is_active: template.is_active,
    });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name || "",
        subject: selectedTemplate.subject || "",
        content: selectedTemplate.content || "",
        category: selectedTemplate.category || "",
        is_active: selectedTemplate.is_active,
      });
    }
    setEditing(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    setError(null);
    try {
      await phpAPI.admin.updateNotificationTemplate(selectedTemplate.id, {
        name: formData.name,
        subject: formData.subject,
        content: formData.content,
        category: formData.category || null,
        is_active: formData.is_active,
      });

      // Refresh templates
      await fetchTemplates();
      
      // Update selected template
      const updated = await phpAPI.admin.getNotificationTemplate(selectedTemplate.id);
      setSelectedTemplate(updated.template);
      setEditing(false);
      
      alert("Template updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  // Define all available variables by template category/type
  const getAllAvailableVariables = (template: NotificationTemplate | null): Array<{
    name: string;
    description: string;
    example: string;
    category?: string; // Which category this variable is typically used for
  }> => {
    if (!template) return [];

    const category = template.category?.toLowerCase() || '';
    const type = template.type?.toLowerCase() || '';

    // All available variables across the system
    const allVariables = [
      // Application variables
      { name: 'applicant_name', description: 'Full name of the applicant', example: 'John Doe', category: 'application' },
      { name: 'application_id', description: 'Unique application ID', example: 'MISC202601185BED0D3F', category: 'application' },
      { name: 'admin_note', description: 'Admin notes/reason (for rejected applications)', example: 'Missing required documents', category: 'application' },
      
      // Appointment variables
      { name: 'client_name', description: 'Full name of the client', example: 'John Doe', category: 'appointment' },
      { name: 'appointment_id', description: 'Unique appointment ID', example: '13', category: 'appointment' },
      { name: 'appointment_date', description: 'Appointment date (formatted)', example: 'January 19, 2026', category: 'appointment' },
      { name: 'appointment_time', description: 'Appointment time (formatted)', example: '09:00 AM', category: 'appointment' },
      { name: 'center_name', description: 'Name of the verification center', example: 'Central Verification Center', category: 'appointment' },
      { name: 'counter_number', description: 'Counter number/ID', example: 'Counter C - Passport Services', category: 'appointment' },
      { name: 'service_type', description: 'Type of service', example: 'Passport Renewal', category: 'appointment' },
    ];

    // If template has a specific category, prioritize those variables but still show all
    if (category === 'application') {
      // Show application variables first, then others
      return [
        ...allVariables.filter(v => v.category === 'application'),
        ...allVariables.filter(v => v.category !== 'application'),
      ];
    }

    if (category === 'appointment') {
      // Show appointment variables first, then others
      return [
        ...allVariables.filter(v => v.category === 'appointment'),
        ...allVariables.filter(v => v.category !== 'appointment'),
      ];
    }

    // For templates without specific category, show all variables
    return allVariables;
  };

  // Extract variables currently used in content
  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, "")))];
  };

  const allAvailableVariables = getAllAvailableVariables(selectedTemplate);
  const usedVariables = selectedTemplate
    ? extractVariables(selectedTemplate.content)
    : [];

  // Insert variable into editor at cursor position
  const insertVariable = (varName: string) => {
    const variable = `{{${varName}}}`;
    
    if (editorRef.current) {
      // Insert at cursor position in TipTap editor
      editorRef.current.chain().focus().insertContent(variable).run();
    } else {
      // Fallback: append to content if editor not ready
      const currentContent = formData.content || '';
      const separator = currentContent.trim() && !currentContent.trim().endsWith(' ') ? ' ' : '';
      const newContent = currentContent + separator + variable;
      setFormData({ ...formData, content: newContent });
    }
  };

  // Get unique categories and types
  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
  const types = [...new Set(templates.map(t => t.type))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage email notification templates used throughout the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Templates</h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : templates.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No templates found</p>
              </div>
            ) : (
              <div className="divide-y">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {template.template_id}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {template.type}
                          </span>
                          {template.category && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {template.category}
                            </span>
                          )}
                          {template.is_active ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedTemplate.template_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!editing ? (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Available Variables */}
                {allAvailableVariables.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">
                      Available Variables
                    </h4>
                    <p className="text-xs text-blue-700 mb-3">
                      {editing 
                        ? "Click on any variable to insert it into the content. Variables will be replaced with actual values when sending emails."
                        : "Variables will be replaced with actual values when sending emails."
                      }
                    </p>
                    <div className="space-y-3">
                      {/* Group variables by category if template has a category */}
                      {selectedTemplate?.category && (() => {
                        const primaryVars = allAvailableVariables.filter(v => v.category === selectedTemplate.category?.toLowerCase());
                        const otherVars = allAvailableVariables.filter(v => v.category !== selectedTemplate.category?.toLowerCase());
                        
                        return (
                          <>
                            {primaryVars.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-blue-800 mb-2">
                                  {selectedTemplate.category.charAt(0).toUpperCase() + selectedTemplate.category.slice(1)} Variables
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {primaryVars.map((variable) => {
                                    const isUsed = usedVariables.includes(variable.name);
                                    return (
                                      <div
                                        key={variable.name}
                                        className={`flex items-start gap-2 p-2 rounded border ${
                                          isUsed
                                            ? 'bg-green-50 border-green-300'
                                            : editing
                                            ? 'bg-white border-blue-200 hover:border-blue-400 cursor-pointer'
                                            : 'bg-white border-blue-200'
                                        } transition-colors`}
                                        onClick={() => editing && insertVariable(variable.name)}
                                        title={editing ? `Click to insert {{${variable.name}}}` : ''}
                                      >
                                        <code
                                          className={`text-xs px-2 py-1 rounded font-mono flex-shrink-0 ${
                                            isUsed
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-blue-100 text-blue-700'
                                          }`}
                                        >
                                          {`{{${variable.name}}}`}
                                        </code>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-900">
                                            {variable.description}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            Example: {variable.example}
                                          </p>
                                        </div>
                                        {isUsed && (
                                          <span className="text-xs text-green-600 font-medium flex-shrink-0">Used</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {otherVars.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-gray-600 mb-2">
                                  Other Available Variables
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {otherVars.map((variable) => {
                                    const isUsed = usedVariables.includes(variable.name);
                                    return (
                                      <div
                                        key={variable.name}
                                        className={`flex items-start gap-2 p-2 rounded border ${
                                          isUsed
                                            ? 'bg-green-50 border-green-300'
                                            : editing
                                            ? 'bg-white border-gray-200 hover:border-gray-400 cursor-pointer'
                                            : 'bg-white border-gray-200'
                                        } transition-colors`}
                                        onClick={() => editing && insertVariable(variable.name)}
                                        title={editing ? `Click to insert {{${variable.name}}}` : ''}
                                      >
                                        <code
                                          className={`text-xs px-2 py-1 rounded font-mono flex-shrink-0 ${
                                            isUsed
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}
                                        >
                                          {`{{${variable.name}}}`}
                                        </code>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-900">
                                            {variable.description}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            Example: {variable.example}
                                          </p>
                                        </div>
                                        {isUsed && (
                                          <span className="text-xs text-green-600 font-medium flex-shrink-0">Used</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      
                      {/* If no category, show all variables in one group */}
                      {!selectedTemplate?.category && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {allAvailableVariables.map((variable) => {
                            const isUsed = usedVariables.includes(variable.name);
                            return (
                              <div
                                key={variable.name}
                                className={`flex items-start gap-2 p-2 rounded border ${
                                  isUsed
                                    ? 'bg-green-50 border-green-300'
                                    : editing
                                    ? 'bg-white border-blue-200 hover:border-blue-400 cursor-pointer'
                                    : 'bg-white border-blue-200'
                                } transition-colors`}
                                onClick={() => editing && insertVariable(variable.name)}
                                title={editing ? `Click to insert {{${variable.name}}}` : ''}
                              >
                                <code
                                  className={`text-xs px-2 py-1 rounded font-mono flex-shrink-0 ${
                                    isUsed
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {`{{${variable.name}}}`}
                                </code>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900">
                                    {variable.description}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Example: {variable.example}
                                  </p>
                                </div>
                                {isUsed && (
                                  <span className="text-xs text-green-600 font-medium flex-shrink-0">Used</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="e.g., Application Approved"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="e.g., application, appointment"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content *
                  </label>
                  {editing ? (
                    <TipTapEditor
                      value={formData.content}
                      onChange={(content) =>
                        setFormData({ ...formData, content })
                      }
                      minHeight="400px"
                      onEditorReady={(editor) => {
                        editorRef.current = editor;
                      }}
                    />
                  ) : (
                    <div
                      className="border rounded-lg p-4 bg-gray-50 min-h-[400px] prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    disabled={!editing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Template is active
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Template
              </h3>
              <p className="text-gray-500">
                Choose a template from the list to view and edit its content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

