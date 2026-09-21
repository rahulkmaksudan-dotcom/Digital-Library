// ==============================================================================
// TYPESCRIPT DATA DEFINITIONS
// Digital Library Management System
// Institution: Thakur Shree DPS College of Engineering and Management
// ==============================================================================

export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'FACULTY' | 'STUDENT' | 'ROLE_ADMIN' | 'ROLE_LIBRARIAN' | 'ROLE_FACULTY' | 'ROLE_STUDENT';

export interface User {
  id: number;
  studentId?: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  course?: string;
  semester?: number;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  studentId?: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  course?: string;
  semester?: number;
}

export interface UserProfile {
  id: number;
  studentId?: string;
  email: string;
  fullName: string;
  phone?: string;
  department?: string;
  course?: string;
  semester?: number;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
  nationality?: string;
  photoUrl?: string;
  website?: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  subtitle?: string;
  authorId?: number;
  authorName?: string;
  author?: Author;
  categoryId?: number;
  categoryName?: string;
  category?: Category;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  language?: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  shelfNumber?: string;
  shelfLocation?: string;
  bookType?: 'PHYSICAL' | 'DIGITAL' | 'BOTH';
  digitalAvailable?: boolean;
  digitalFile?: string;
  isDigital?: boolean;
  fileUrl?: string;
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'ARCHIVED' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Loan {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  studentId?: string;
  user?: User;
  bookId?: number;
  bookTitle?: string;
  bookIsbn?: string;
  bookCover?: string;
  book?: Book;
  authorName?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST' | 'ISSUED' | string;
  fineAmount?: number;
  daysOverdue?: number;
  issuedByName?: string;
  returnedToName?: string;
  notes?: string;
  createdAt?: string;
}

export interface Fine {
  id: number;
  loanId?: number;
  loan?: Loan;
  userId?: number;
  user?: User;
  userName?: string;
  studentId?: string;
  bookTitle?: string;
  amount: number;
  daysOverdue?: number;
  overdueDays?: number;
  status: 'PENDING' | 'PAID' | 'WAIVED' | string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
}

export interface Reservation {
  id: number;
  bookId?: number;
  bookTitle?: string;
  bookIsbn?: string;
  bookCover?: string;
  book?: Book;
  userId?: number;
  user?: User;
  userName?: string;
  studentId?: string;
  reservationDate: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'READY_FOR_PICKUP' | string;
  notifiedAt?: string;
}

export interface BookRequest {
  id: number;
  userId?: number;
  user?: User;
  userName?: string;
  studentId?: string;
  title: string;
  author?: string;
  isbn?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PURCHASED' | 'ORDERED' | string;
  adminComment?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ResourceType = 'NOTES' | 'SYLLABUS' | 'QUESTION_PAPER' | 'LAB_MANUAL' | 'STUDY_MATERIAL' | 'EBOOK' | string;

export interface DigitalResource {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  subject?: string;
  semester?: number;
  department?: string;
  academicYear?: string;
  resourceType: ResourceType;
  uploadedById?: number;
  uploadedByName?: string;
  uploader?: User;
  approvedById?: number;
  approvedByName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  downloadsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DUE_REMINDER' | 'OVERDUE' | 'FINE' | 'RESERVATION' | 'SYSTEM' | string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  userEmail?: string;
  user?: User;
  action: string;
  entity?: string;
  entityName?: string;
  entityId?: string;
  description?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface LibrarySetting {
  id?: number;
  settingKey?: string;
  settingValue?: string;
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  digitalResourcesCount: number;
  totalStudents: number;
  totalFaculty: number;
  totalLibrarians: number;
  totalUsers?: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  activeReservations: number;
  pendingReservations?: number;
  pendingRequests: number;
  totalFinesPending: number;
  pendingFinesAmount?: number;
  totalFinesCollected: number;
  myActiveLoans?: number;
  myDueSoon?: number;
  myOverdue?: number;
  myPendingFines?: number;
  myReservations?: number;
  myFavorites?: number;
  categoryDistribution?: { name: string; count: number }[];
  monthlyLoans?: { month: string; loans: number }[];
  popularBooks?: { id: number; title: string; loans: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

