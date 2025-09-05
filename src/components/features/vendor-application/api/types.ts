import { ID, Timestamp } from '@/types';

// Vendor Application Types
export interface VendorApplication {
  id: ID;
  userId: ID;
  userEmail: string;
  userName: string;
  companyName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  companyLogoUrl?: string;
  businessCertificateUrl?: string;
  productCategory: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  rejectionReason?: string;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: ID;
  updatedAt: Timestamp;
}

export interface VendorApplicationWithDetails extends VendorApplication {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatar?: string;
  };
  reviewer?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  documents: ApplicationDocument[];
  notes: ApplicationNote[];
}

// Application Document Types
export interface ApplicationDocument {
  id: ID;
  applicationId: ID;
  type:
    | 'BUSINESS_LICENSE'
    | 'TAX_CERTIFICATE'
    | 'ID_DOCUMENT'
    | 'BANK_STATEMENT'
    | 'OTHER';
  name: string;
  url: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

// Application Note Types
export interface ApplicationNote {
  id: ID;
  applicationId: ID;
  authorId: ID;
  authorName: string;
  authorRole: string;
  content: string;
  isInternal: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Vendor Application API Response Types
export interface VendorApplicationsResponse {
  data: VendorApplicationWithDetails[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface VendorApplicationResponse {
  success: boolean;
  data: VendorApplicationWithDetails;
  error?: string;
}

export interface VendorApplicationCreateResponse {
  success: boolean;
  data: VendorApplication;
  message: string;
  error?: string;
}

export interface VendorApplicationUpdateResponse {
  success: boolean;
  data: VendorApplication;
  message: string;
  error?: string;
}

// Vendor Application API Request Types
export interface VendorApplicationsQueryParams {
  status?: string;
  userId?: ID;
  category?: string;
  dateRange?: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  limit?: number;
  page?: number;
  sortBy?: 'submittedAt' | 'status' | 'companyName' | 'reviewedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface VendorApplicationCreateRequest {
  companyName: string;
  businessRegistrationNumber: string;
  companyWebsite?: string;
  contactEmail: string;
  contactPhone: string;
  productCategory: string;
  description: string;
  documents: ApplicationDocumentUpload[];
}

export interface ApplicationDocumentUpload {
  type:
    | 'BUSINESS_LICENSE'
    | 'TAX_CERTIFICATE'
    | 'ID_DOCUMENT'
    | 'BANK_STATEMENT'
    | 'OTHER';
  file: File;
  name: string;
}

export interface VendorApplicationUpdateRequest {
  companyName?: string;
  businessRegistrationNumber?: string;
  companyWebsite?: string;
  contactEmail?: string;
  contactPhone?: string;
  productCategory?: string;
  description?: string;
}

// Vendor Application Review Types
export interface VendorApplicationReview {
  id: ID;
  applicationId: ID;
  reviewerId: ID;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'UNDER_REVIEW';
  comments: string;
  internalNotes?: string;
  requirements?: string[];
  nextReviewDate?: Timestamp;
  reviewedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VendorApplicationReviewRequest {
  applicationId: ID;
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'UNDER_REVIEW';
  comments: string;
  internalNotes?: string;
  requirements?: string[];
  nextReviewDate?: Timestamp;
}

// Vendor Application Statistics Types
export interface VendorApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  underReviewApplications: number;
  applicationsThisMonth: number;
  applicationsThisYear: number;
  averageProcessingTime: number;
  categoryDistribution: CategoryDistribution[];
  monthlyTrends: MonthlyTrend[];
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  applications: number;
  approvals: number;
  rejections: number;
}

// Vendor Application Workflow Types
export interface ApplicationWorkflow {
  id: ID;
  applicationId: ID;
  currentStep: string;
  steps: WorkflowStep[];
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: Timestamp;
  completedAt?: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  required: boolean;
  order: number;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  assignedTo?: ID;
  notes?: string;
}

// Vendor Application Notification Types
export interface ApplicationNotification {
  id: ID;
  applicationId: ID;
  userId: ID;
  type:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'DOCUMENT_REQUESTED';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

// Vendor Application API Request Types
export interface ApplicationWorkflowQueryParams {
  applicationId: ID;
  includeSteps?: boolean;
  includeAssignees?: boolean;
}

export interface ApplicationNotificationQueryParams {
  applicationId?: ID;
  userId?: ID;
  type?: string;
  isRead?: boolean;
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}
