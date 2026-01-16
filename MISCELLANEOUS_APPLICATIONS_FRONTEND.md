# Miscellaneous Applications - Frontend Implementation

## Overview
Complete admin frontend implementation for managing miscellaneous service applications with full CRUD operations, file viewing/downloading, search, filter, and sort capabilities.

## Components Created

### 1. MiscellaneousApplicationFilters.tsx
- Advanced filtering with collapsible UI
- Search by ID, name, email, phone, passport
- Filter by status, service, date range
- Sort by multiple columns (submitted_at, updated_at, full_name, status, service_title)
- Sort order (ASC/DESC)

### 2. MiscellaneousApplicationRow.tsx
- Table row component displaying application summary
- Shows: Application ID, Applicant name/nationality, Contact info, Service, Status, Submitted date, File count
- Action buttons for View and Edit

### 3. MiscellaneousApplicationsTable.tsx
- Main table component
- Displays all applications with pagination
- Integrates with filters and row components

### 4. MiscellaneousApplicationDetailsModal.tsx
- Full application details view
- All form fields displayed in organized sections:
  - Personal Information
  - Family Information
  - Contact Information
  - Professional Information
  - Passport Information
  - Mission Registration
  - Admin Notes
- File listing with download functionality
- Timestamps display
- Edit button to switch to edit mode

### 5. EditMiscellaneousApplicationModal.tsx
- Complete form for editing application data
- All fields editable including:
  - Status dropdown
  - All personal, family, contact, professional, passport fields
  - Mission registration checkbox and fields
  - Admin notes textarea
- Form validation
- Save/Cancel actions

### 6. MiscellaneousApplicationsManagement.tsx
- Main container component
- Manages state for:
  - Applications list
  - Pagination
  - Filters
  - Modals
- Handles API calls
- Coordinates between child components

## API Integration

### API Client Methods Added (php-api-client.ts)
- `getMiscellaneousApplications(params)` - List with filters
- `getMiscellaneousApplicationDetails(applicationId)` - Get full details + files
- `updateMiscellaneousApplication(applicationId, payload)` - Update application
- `getMiscellaneousApplicationFile(applicationId, fileId)` - Get file metadata
- `downloadMiscellaneousApplicationFile(applicationId, fileId)` - Download file
- `getMiscellaneousApplicationStats()` - Get statistics

## Types Added (admin.ts)

### MiscellaneousApplication
Complete interface matching backend response with all fields:
- Basic info (id, application_id, user_id, service_id)
- Personal details (full_name, nationality, date_of_birth, etc.)
- Family info (father, mother, spouse)
- Contact info (email, phone, addresses)
- Professional info (profession, employer, visa status)
- Passport details
- Registration info
- Status and admin notes
- Timestamps
- Related data (service_title, user info, file_count)

### ApplicationFile
File metadata interface:
- file_id, application_id
- file_name, original_name, file_path
- file_type, file_size, mime_type
- document_type
- uploaded_by, uploaded_at

### Response Types
- `AdminMiscellaneousApplicationsResponse`
- `AdminMiscellaneousApplicationDetailsResponse`
- `AdminMiscellaneousApplicationStats`

## Integration

### AdminDashboard.tsx
- Added import for `MiscellaneousApplicationsManagement`
- Added new tab section for "miscellaneous-applications"
- Integrated into main dashboard flow

### AdminSidebar.tsx
- Added "Miscellaneous Applications" tab to navigation
- Uses FileText icon

### StatusBadge.tsx
- Added "under_review" status color

## Features

### Search & Filter
- Real-time search across multiple fields
- Status filter (submitted, under_review, approved, rejected, completed)
- Service filter (only Miscellaneous services)
- Date range filter (from/to)
- Advanced filters collapsible UI

### Sort
- Sort by: submitted_at, updated_at, full_name, status, service_title
- Sort order: ASC or DESC

### View & Edit
- View full application details in modal
- Edit all fields including status
- Admin notes support
- File viewing and downloading

### File Management
- List all uploaded files
- Display file metadata (name, type, size, document type)
- Download files with proper handling
- Loading states for downloads

### Pagination
- Server-side pagination
- Page navigation
- Total count display

## Usage

1. Navigate to Admin Dashboard
2. Click "Miscellaneous Applications" in sidebar
3. Use filters to search/filter applications
4. Click eye icon to view details
5. Click edit icon to edit application
6. Download files from details modal
7. Update status and add admin notes

## File Structure

```
src/components/admin/applications/miscellaneous/
├── MiscellaneousApplicationFilters.tsx
├── MiscellaneousApplicationRow.tsx
├── MiscellaneousApplicationsTable.tsx
├── MiscellaneousApplicationDetailsModal.tsx
├── EditMiscellaneousApplicationModal.tsx
└── MiscellaneousApplicationsManagement.tsx
```

## Dependencies

- Uses existing common components:
  - `StatusBadge` - Status display
  - `Pagination` - Pagination controls
- Uses `phpAPI` client for all API calls
- Uses Lucide React icons
- Tailwind CSS for styling

## Notes

- All API calls include proper error handling
- Loading states for async operations
- Form validation on edit
- Responsive design
- Follows existing admin panel patterns
- Type-safe with TypeScript

