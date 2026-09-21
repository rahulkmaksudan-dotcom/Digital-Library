import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  History,
  CalendarCheck,
  Bookmark,
  Send,
  Bell,
  Coins,
  FileDown,
  GraduationCap,
  User,
  Users,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  BarChart3,
  Sliders,
  ShieldAlert,
  ArrowRightLeft,
  RotateCcw,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, isAdmin, isLibrarian, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  // Student Links
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/my-books', label: 'My Borrowed Books', icon: BookOpen },
    { to: '/student/borrowing-history', label: 'Borrowing History', icon: History },
    { to: '/student/reservations', label: 'My Reservations', icon: CalendarCheck },
    { to: '/student/favorites', label: 'My Wishlist / Favorites', icon: Bookmark },
    { to: '/student/requests', label: 'Request a Book', icon: Send },
    { to: '/student/fines', label: 'My Fines & Dues', icon: Coins },
    { to: '/student/downloads', label: 'Digital Library & Notes', icon: FileDown },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  // Librarian Links
  const librarianLinks = [
    { to: '/librarian/dashboard', label: 'Librarian Dashboard', icon: LayoutDashboard },
    { to: '/librarian/books', label: 'Catalog / Book Management', icon: BookOpen },
    { to: '/librarian/issue', label: 'Issue Book (Circulation)', icon: ArrowRightLeft },
    { to: '/librarian/return', label: 'Return Book Desk', icon: RotateCcw },
    { to: '/librarian/reservations', label: 'Reservations Queue', icon: CalendarCheck },
    { to: '/librarian/fines', label: 'Overdue Fines Collection', icon: Coins },
    { to: '/librarian/students', label: 'Student Directory', icon: Users },
    { to: '/librarian/requests', label: 'Student Book Requests', icon: Send },
    { to: '/librarian/resource-approvals', label: 'Approve Digital Resources', icon: FileCheck2 },
    { to: '/librarian/reports', label: 'Circulation Reports', icon: FileSpreadsheet },
  ];

  // Admin Links
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory & Roles', icon: Users },
    { to: '/admin/books', label: 'Books Catalog Inventory', icon: BookOpen },
    { to: '/admin/categories', label: 'Categories & Departments', icon: Layers },
    { to: '/admin/authors', label: 'Authors Directory', icon: Users },
    { to: '/admin/loans', label: 'Loan Circulation', icon: ArrowRightLeft },
    { to: '/admin/returns', label: 'Returns & Overdue', icon: RotateCcw },
    { to: '/admin/fines', label: 'Fines & Payments', icon: Coins },
    { to: '/admin/reservations', label: 'Reservations Management', icon: CalendarCheck },
    { to: '/admin/digital-resources', label: 'Academic Resources Master', icon: FolderOpen },
    { to: '/admin/analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { to: '/admin/exports', label: 'CSV Reports & Exports', icon: FileSpreadsheet },
    { to: '/admin/settings', label: 'Library System Settings', icon: Sliders },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
  ];

  const links = isAdmin ? adminLinks : isLibrarian ? librarianLinks : studentLinks;
  const portalTitle = isAdmin ? 'Admin Portal' : isLibrarian ? 'Librarian Desk' : 'Student Portal';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-dps-50 border border-dps-200 flex items-center justify-center text-dps-700 font-bold">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
            {portalTitle}
          </h2>
          <p className="text-[11px] font-semibold text-dps-600 mt-1 uppercase tracking-wider">
            {user?.role}
          </p>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-dps-600 text-white font-semibold shadow-sm shadow-dps-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Sign Out Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-4rem)] sticky top-16 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85%] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

