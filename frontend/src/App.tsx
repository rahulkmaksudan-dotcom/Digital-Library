import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { BooksCatalog } from './pages/public/BooksCatalog';
import { BookDetails } from './pages/public/BookDetails';
import { DigitalResourcesPage } from './pages/public/DigitalResourcesPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { AuthorsPage } from './pages/public/AuthorsPage';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';
import { ForgotPassword } from './pages/public/ForgotPassword';
import { ResetPassword } from './pages/public/ResetPassword';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentLoans } from './pages/student/StudentLoans';
import { StudentReservations } from './pages/student/StudentReservations';
import { StudentFavorites } from './pages/student/StudentFavorites';
import { StudentRequests } from './pages/student/StudentRequests';
import { StudentFines } from './pages/student/StudentFines';
import { StudentNotifications } from './pages/student/StudentNotifications';
import { StudentProfile } from './pages/student/StudentProfile';

// Librarian Portal Pages
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { LibrarianBooks } from './pages/librarian/LibrarianBooks';
import { LibrarianIssue } from './pages/librarian/LibrarianIssue';
import { LibrarianReturn } from './pages/librarian/LibrarianReturn';
import { LibrarianReservations } from './pages/librarian/LibrarianReservations';
import { LibrarianFines } from './pages/librarian/LibrarianFines';
import { LibrarianStudents } from './pages/librarian/LibrarianStudents';
import { LibrarianRequests } from './pages/librarian/LibrarianRequests';
import { LibrarianApprovals } from './pages/librarian/LibrarianApprovals';
import { LibrarianReports } from './pages/librarian/LibrarianReports';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminAuthors } from './pages/admin/AdminAuthors';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminExports } from './pages/admin/AdminExports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Website Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<BooksCatalog />} />
                <Route path="/books" element={<Navigate to="/catalog" replace />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route path="/resources" element={<DigitalResourcesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/authors" element={<AuthorsPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Student Portal Routes */}
              <Route path="/student" element={<DashboardLayout requiredRole="STUDENT" />}>
                <Route index element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="my-books" element={<StudentLoans initialTab="active" />} />
                <Route path="borrowing-history" element={<StudentLoans initialTab="history" />} />
                <Route path="reservations" element={<StudentReservations />} />
                <Route path="favorites" element={<StudentFavorites />} />
                <Route path="requests" element={<StudentRequests />} />
                <Route path="fines" element={<StudentFines />} />
                <Route path="downloads" element={<DigitalResourcesPage />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="profile" element={<StudentProfile />} />
              </Route>

              {/* Librarian Portal Routes */}
              <Route path="/librarian" element={<DashboardLayout requiredRole="LIBRARIAN" />}>
                <Route index element={<Navigate to="/librarian/dashboard" replace />} />
                <Route path="dashboard" element={<LibrarianDashboard />} />
                <Route path="books" element={<LibrarianBooks />} />
                <Route path="issue" element={<LibrarianIssue />} />
                <Route path="return" element={<LibrarianReturn />} />
                <Route path="reservations" element={<LibrarianReservations />} />
                <Route path="fines" element={<LibrarianFines />} />
                <Route path="students" element={<LibrarianStudents />} />
                <Route path="requests" element={<LibrarianRequests />} />
                <Route path="resource-approvals" element={<LibrarianApprovals />} />
                <Route path="reports" element={<LibrarianReports />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route path="/admin" element={<DashboardLayout requiredRole="ADMIN" />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="books" element={<LibrarianBooks />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="authors" element={<AdminAuthors />} />
                <Route path="loans" element={<LibrarianIssue />} />
                <Route path="returns" element={<LibrarianReturn />} />
                <Route path="fines" element={<LibrarianFines />} />
                <Route path="reservations" element={<LibrarianReservations />} />
                <Route path="digital-resources" element={<LibrarianApprovals />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="exports" element={<AdminExports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;

