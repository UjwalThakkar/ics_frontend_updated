"use client";

import React, { useState, useCallback, useRef } from "react";

// Types for extracted data matching the booking form fields
export interface ExtractedData {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNo?: string;
    passportExpiry?: string;
    placeOfBirth?: string;
    issuingCountry?: string;
}

interface ConfidenceScores {
    overall: number;
    fields: Record<string, number>;
}

export interface OCRResult {
    success: boolean;
    extracted_data?: ExtractedData;
    confidence?: ConfidenceScores;
    document_type?: string;
    warnings?: string[];
    error?: string;
}

type DocumentType = "passport" | "birth_certificate";

interface DocumentUploaderProps {
    onDataExtracted: (data: ExtractedData, confidence: number) => void;
    onError?: (error: string) => void;
    documentType?: DocumentType;
    className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * DocumentUploader - Upload documents for OCR extraction
 * 
 * Features:
 * - Drag and drop support
 * - File type validation
 * - Upload progress indicator
 * - Preview for images
 * - Extracted data display with confidence scores
 */
export function DocumentUploader({
    onDataExtracted,
    onError,
    documentType = "passport",
    className = "",
}: DocumentUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<OCRResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType>(documentType);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Validate file before upload
    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Invalid file type. Please upload JPG, PNG, or PDF files.";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "File too large. Maximum size is 10MB.";
        }
        return null;
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            onError?.(validationError);
            return;
        }

        setFile(selectedFile);
        setError(null);
        setResult(null);

        // Create preview for images
        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }
    }, [validateFile, onError]);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    }, [handleFileSelect]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    }, [handleFileSelect]);

    // Upload and extract
    const handleExtract = useCallback(async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("document_type", selectedDocType);

            // Get CSRF token from localStorage
            const csrfToken = localStorage.getItem("csrf_token");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/ocr/extract`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || "Extraction failed");
            }

            setResult(data);

            if (data.success && data.extracted_data) {
                onDataExtracted(data.extracted_data, data.confidence?.overall ?? 0);
            } else if (data.error) {
                setError(data.error);
                onError?.(data.error);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to extract document";
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [file, selectedDocType, onDataExtracted, onError]);

    // Clear selection
    const handleClear = useCallback(() => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    return (
        <div className={`document-uploader ${className}`}>
            {/* Document Type Selection */}
            <div className="doc-type-selector">
                <label className="doc-type-label">Document Type:</label>
                <div className="doc-type-buttons">
                    <button
                        type="button"
                        className={`doc-type-btn ${selectedDocType === "passport" ? "active" : ""}`}
                        onClick={() => setSelectedDocType("passport")}
                        disabled={isUploading}
                    >
                        🛂 Passport
                    </button>
                    <button
                        type="button"
                        className={`doc-type-btn ${selectedDocType === "birth_certificate" ? "active" : ""}`}
                        onClick={() => setSelectedDocType("birth_certificate")}
                        disabled={isUploading}
                    >
                        📜 Birth Certificate
                    </button>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleInputChange}
                    style={{ display: "none" }}
                />

                {!file ? (
                    <div className="drop-zone-content">
                        <div className="drop-icon">📄</div>
                        <p className="drop-text">
                            Drag & drop your document here, or <span className="browse-link">browse</span>
                        </p>
                        <p className="drop-hint">Supported formats: JPG, PNG, PDF (max 10MB)</p>
                    </div>
                ) : (
                    <div className="file-info">
                        {preview && (
                            <img src={preview} alt="Document preview" className="file-preview" />
                        )}
                        <div className="file-details">
                            <p className="file-name">{file.name}</p>
                            <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {/* Actions */}
            {file && !result && (
                <div className="upload-actions">
                    <button
                        type="button"
                        className="btn-extract"
                        onClick={handleExtract}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <span className="spinner"></span>
                                Extracting...
                            </>
                        ) : (
                            <>🔍 Extract Data</>
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn-clear"
                        onClick={handleClear}
                        disabled={isUploading}
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* Results */}
            {result?.success && result.extracted_data && (
                <div className="extraction-result">
                    <div className="result-header">
                        <h4>✅ Data Extracted Successfully</h4>
                        <span className="confidence-badge">
                            {((result.confidence?.overall ?? 0) * 100).toFixed(0)}% confidence
                        </span>
                    </div>

                    <div className="extracted-fields">
                        {Object.entries(result.extracted_data).map(([key, value]) => {
                            if (!value) return null;
                            return (
                                <div key={key} className="field-row">
                                    <span className="field-label">{formatFieldName(key)}:</span>
                                    <span className="field-value">{value}</span>
                                </div>
                            );
                        })}
                    </div>

                    {result.warnings && result.warnings.length > 0 && (
                        <div className="warnings">
                            {result.warnings.map((warning, i) => (
                                <p key={i} className="warning-text">⚠️ {warning}</p>
                            ))}
                        </div>
                    )}

                    <div className="result-actions">
                        <button type="button" className="btn-clear" onClick={handleClear}>
                            Upload Another Document
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        .document-uploader {
          width: 100%;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .doc-type-selector {
          margin-bottom: 1rem;
        }

        .doc-type-label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .doc-type-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .doc-type-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .doc-type-btn:hover {
          border-color: #3b82f6;
        }

        .doc-type-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .doc-type-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .drop-zone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }

        .drop-zone:hover {
          border-color: #3b82f6;
          background: #f8faff;
        }

        .drop-zone.drag-active {
          border-color: #3b82f6;
          background: #eff6ff;
          border-style: solid;
        }

        .drop-zone.has-file {
          border-style: solid;
          border-color: #10b981;
          background: #f0fdf4;
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .drop-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .drop-text {
          color: #4b5563;
          margin: 0;
        }

        .browse-link {
          color: #3b82f6;
          text-decoration: underline;
        }

        .drop-hint {
          font-size: 0.85rem;
          color: #9ca3af;
          margin: 0;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .file-preview {
          max-width: 100px;
          max-height: 100px;
          border-radius: 8px;
          object-fit: cover;
        }

        .file-details {
          text-align: left;
        }

        .file-name {
          font-weight: 500;
          color: #111827;
          margin: 0 0 4px 0;
          word-break: break-all;
        }

        .file-size {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-top: 1rem;
        }

        .upload-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn-extract {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-extract:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-extract:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-clear {
          padding: 0.875rem 1.5rem;
          background: white;
          color: #4b5563;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-clear:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .extraction-result {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 12px;
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .result-header h4 {
          margin: 0;
          color: #166534;
          font-size: 1rem;
        }

        .confidence-badge {
          padding: 0.25rem 0.75rem;
          background: #166534;
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .extracted-fields {
          display: grid;
          gap: 0.5rem;
        }

        .field-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
        }

        .field-label {
          font-weight: 500;
          color: #374151;
          min-width: 120px;
        }

        .field-value {
          color: #111827;
        }

        .warnings {
          margin-top: 1rem;
          padding: 0.75rem;
          background: #fffbeb;
          border-radius: 8px;
        }

        .warning-text {
          margin: 0;
          color: #92400e;
          font-size: 0.9rem;
        }

        .result-actions {
          margin-top: 1rem;
        }
      `}</style>
        </div>
    );
}

// Helper to format camelCase field names
function formatFieldName(name: string): string {
    const formatted = name.replace(/([A-Z])/g, " $1").trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default DocumentUploader;
