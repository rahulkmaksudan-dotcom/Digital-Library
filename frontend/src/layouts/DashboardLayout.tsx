import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  requiredRole?: 'ADMIN' | 'LIBRARIAN' | 'STAFF' | 'STUDENT';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ requiredRole }) => {
  const { user, isAuthenticated, loading, isAdmin, isLibrarian, isStaff, isStudent } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-dps-200 border-t-dps-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role verification guard
  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  if (requiredRole === 'LIBRARIAN' && !isStaff) {
    return <Navigate to="/" replace />;
  }
  if (requiredRole === 'STAFF' && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sidebar trigger button bar */}
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-dps-600 transition"
            >
              <Menu className="w-4 h-4" />
              <span>Portal Navigation</span>
            </button>
            <span className="text-[11px] font-bold text-dps-600 bg-dps-50 px-2 py-0.5 rounded-md uppercase">
              {user.role}
            </span>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

