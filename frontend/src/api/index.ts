import { apiClient } from './client';
import {
  ApiResponse,
  PagedResponse,
  AuthResponse,
  UserProfile,
  Book,
  Category,
  Author,
  Loan,
  Fine,
  Reservation,
  BookRequest,
  DigitalResource,
  NotificationItem,
  AuditLogItem,
  LibrarySetting,
  DashboardStats,
  User,
} from '../types';

export const authService = {
  login: async (identifier: string, password: string):Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { identifier, password });
    return res.data.data;
  },

  register: async (data: {
    fullName: string;
    studentId: string;
    email: string;
    phone?: string;
    department: string;
    course?: string;
    semester?: number;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await apiClient.put<ApiResponse<UserProfile>>('/auth/profile', data);
    return res.data.data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await apiClient.post<ApiResponse<string>>('/auth/forgot-password', { email });
    return res.data.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
  },
};

export const bookService = {
  searchBooks: async (params?: {
    query?: string;
    categoryId?: number;
    authorId?: number;
    language?: string;
    bookType?: string;
    status?: string;
    digitalOnly?: boolean;
    availableOnly?: boolean;
    sortBy?: string;
    direction?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Book>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Book>>>('/books', { params });
    return res.data.data;
  },

  getBookById: async (id: number): Promise<Book> => {
    const res = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data.data;
  },

  getFeaturedBooks: async (): Promise<Book[]> => {
    const res = await apiClient.get<ApiResponse<Book[]>>('/books/featured');
    return res.data.data;
  },

  createBook: async (book: Partial<Book>): Promise<Book> => {
    const res = await apiClient.post<ApiResponse<Book>>('/books', book);
    return res.data.data;
  },

  updateBook: async (id: number, book: Partial<Book>): Promise<Book> => {
    const res = await apiClient.put<ApiResponse<Book>>(`/books/${id}`, book);
    return res.data.data;
  },

  deleteBook: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/books/${id}`);
  },
};

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
  getById: async (id: number): Promise<Category> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data;
  },
  create: async (category: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', category);
    return res.data.data;
  },
  update: async (id: number, category: Partial<Category>): Promise<Category> => {
    const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, category);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/categories/${id}`);
  },
};

export const authorService = {
  getAll: async (): Promise<Author[]> => {
    const res = await apiClient.get<ApiResponse<Author[]>>('/authors');
    return res.data.data;
  },
  getById: async (id: number): Promise<Author> => {
    const res = await apiClient.get<ApiResponse<Author>>(`/authors/${id}`);
    return res.data.data;
  },
  create: async (author: Partial<Author>): Promise<Author> => {
    const res = await apiClient.post<ApiResponse<Author>>('/authors', author);
    return res.data.data;
  },
  update: async (id: number, author: Partial<Author>): Promise<Author> => {
    const res = await apiClient.put<ApiResponse<Author>>(`/authors/${id}`, author);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/authors/${id}`);
  },
};

export const loanService = {
  searchLoans: async (params?: {
    status?: string;
    userId?: number;
    bookId?: number;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Loan>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>('/loans', { params });
    return res.data.data;
  },

  getMyLoans: async (page = 0, size = 10): Promise<PagedResponse<Loan>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>('/loans/my-loans', {
      params: { page, size },
    });
    return res.data.data;
  },

  getMyHistory: async (status?: string, page = 0, size = 10): Promise<PagedResponse<Loan>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Loan>>>('/loans/my-history', {
      params: { status, page, size },
    });
    return res.data.data;
  },

  getLoanById: async (id: number): Promise<Loan> => {
    const res = await apiClient.get<ApiResponse<Loan>>(`/loans/${id}`);
    return res.data.data;
  },

  issueBook: async (data: {
    userId: number;
    bookId: number;
    loanDays?: number;
    notes?: string;
  }): Promise<Loan> => {
    const res = await apiClient.post<ApiResponse<Loan>>('/loans', data);
    return res.data.data;
  },

  returnBook: async (id: number, data?: { notes?: string; paymentMethod?: string }): Promise<Loan> => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/loans/${id}/return`, data);
    return res.data.data;
  },
};

export const fineService = {
  searchFines: async (params?: {
    status?: string;
    userId?: number;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Fine>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Fine>>>('/fines', { params });
    return res.data.data;
  },

  getMyFines: async (page = 0, size = 10): Promise<PagedResponse<Fine>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Fine>>>('/fines/my-fines', {
      params: { page, size },
    });
    return res.data.data;
  },

  payFine: async (id: number, paymentMethod = 'CASH'): Promise<Fine> => {
    const res = await apiClient.post<ApiResponse<Fine>>(`/fines/${id}/pay`, { paymentMethod });
    return res.data.data;
  },

  waiveFine: async (id: number, reason = 'Administrative waiver'): Promise<Fine> => {
    const res = await apiClient.post<ApiResponse<Fine>>(`/fines/${id}/waive`, { reason });
    return res.data.data;
  },
};

export const reservationService = {
  searchReservations: async (params?: {
    status?: string;
    userId?: number;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<Reservation>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Reservation>>>('/reservations', { params });
    return res.data.data;
  },

  getMyReservations: async (page = 0, size = 10): Promise<PagedResponse<Reservation>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Reservation>>>('/reservations/my-reservations', {
      params: { page, size },
    });
    return res.data.data;
  },

  createReservation: async (bookId: number): Promise<Reservation> => {
    const res = await apiClient.post<ApiResponse<Reservation>>(`/reservations/${bookId}`);
    return res.data.data;
  },

  cancelReservation: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/reservations/${id}`);
  },
};

export const favoriteService = {
  getMyFavorites: async (page = 0, size = 12): Promise<PagedResponse<Book>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<Book>>>('/favorites', {
      params: { page, size },
    });
    return res.data.data;
  },

  addFavorite: async (bookId: number): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/favorites/${bookId}`);
  },

  removeFavorite: async (bookId: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/favorites/${bookId}`);
  },

  checkFavorite: async (bookId: number): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/check/${bookId}`);
    return res.data.data.isFavorite;
  },
};

export const bookRequestService = {
  searchRequests: async (params?: {
    status?: string;
    userId?: number;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<BookRequest>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<BookRequest>>>('/book-requests', { params });
    return res.data.data;
  },

  getMyRequests: async (page = 0, size = 10): Promise<PagedResponse<BookRequest>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<BookRequest>>>('/book-requests/my-requests', {
      params: { page, size },
    });
    return res.data.data;
  },

  createRequest: async (data: {
    title: string;
    author?: string;
    isbn?: string;
    reason?: string;
  }): Promise<BookRequest> => {
    const res = await apiClient.post<ApiResponse<BookRequest>>('/book-requests', data);
    return res.data.data;
  },

  updateStatus: async (id: number, status: string, adminComment?: string): Promise<BookRequest> => {
    const res = await apiClient.patch<ApiResponse<BookRequest>>(`/book-requests/${id}/status`, {
      status,
      adminComment,
    });
    return res.data.data;
  },
};

export const resourceService = {
  getPublicResources: async (params?: {
    department?: string;
    semester?: number;
    subject?: string;
    resourceType?: string;
    category?: string;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<DigitalResource>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DigitalResource>>>('/resources/public', { params });
    return res.data.data;
  },

  getRecentApprovedResources: async (): Promise<DigitalResource[]> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DigitalResource>>>('/resources/public', {
      params: { size: 4, page: 0 }
    });
    return res.data.data.content;
  },

  getAllResources: async (params?: {
    status?: string;
    department?: string;
    semester?: number;
    subject?: string;
    resourceType?: string;
    category?: string;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<DigitalResource>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<DigitalResource>>>('/resources', { params });
    return res.data.data;
  },

  getResourceById: async (id: number): Promise<DigitalResource> => {
    const res = await apiClient.get<ApiResponse<DigitalResource>>(`/resources/${id}`);
    return res.data.data;
  },

  uploadResource: async (formData: FormData): Promise<DigitalResource> => {
    const res = await apiClient.post<ApiResponse<DigitalResource>>('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  updateStatus: async (id: number, status: string): Promise<DigitalResource> => {
    const res = await apiClient.patch<ApiResponse<DigitalResource>>(`/resources/${id}/status`, { status });
    return res.data.data;
  },

  getDepartments: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiResponse<string[]>>('/resources/departments');
    return res.data.data;
  },

  getSubjects: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiResponse<string[]>>('/resources/subjects');
    return res.data.data;
  },

  getDownloadUrl: (fileName: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    return `${base}/resources/download/${fileName}`;
  },
};

export const notificationService = {
  getNotifications: async (page = 0, size = 10): Promise<PagedResponse<NotificationItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<NotificationItem>>>('/notifications', {
      params: { page, size },
    });
    return res.data.data;
  },

  getRecent: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/notifications/recent');
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.data.count;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
  },
};

export const analyticsService = {
  getPublicOverview: async (): Promise<Record<string, number>> => {
    const res = await apiClient.get<ApiResponse<Record<string, number>>>('/analytics/overview');
    return res.data.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
    return res.data.data;
  },

  getStudentStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/analytics/student');
    return res.data.data;
  },
};

export const userService = {
  searchUsers: async (params?: {
    role?: string;
    department?: string;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<User>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<User>>>('/users', { params });
    return res.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  createUser: async (user: Partial<User> & { password?: string }): Promise<User> => {
    const res = await apiClient.post<ApiResponse<User>>('/users', user);
    return res.data.data;
  },

  updateUser: async (id: number, user: Partial<User> & { password?: string }): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>(`/users/${id}`, user);
    return res.data.data;
  },

  toggleActive: async (id: number): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/users/${id}/toggle-active`);
  },
};

export const settingService = {
  getPublicSettings: async (): Promise<Record<string, string>> => {
    const res = await apiClient.get<ApiResponse<Record<string, string>>>('/settings/public');
    return res.data.data;
  },

  getAllSettings: async (): Promise<LibrarySetting[]> => {
    const res = await apiClient.get<ApiResponse<LibrarySetting[]>>('/settings');
    return res.data.data;
  },

  updateSetting: async (key: string, value: string, description?: string): Promise<LibrarySetting> => {
    const res = await apiClient.put<ApiResponse<LibrarySetting>>(`/settings/${key}`, { value, description });
    return res.data.data;
  },
};

export const auditLogService = {
  getAuditLogs: async (params?: {
    action?: string;
    entity?: string;
    query?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<AuditLogItem>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<AuditLogItem>>>('/audit-logs', { params });
    return res.data.data;
  },
};

export const reportService = {
  getExportUrl: (type: 'books' | 'users' | 'loans' | 'fines'): string => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    return `${base}/reports/export/${type}`;
  },
};

