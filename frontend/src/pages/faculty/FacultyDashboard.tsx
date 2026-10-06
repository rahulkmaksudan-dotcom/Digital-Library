import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';
import { bookService } from '../../api';
import { Book } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedBooks = async () => {
      try {
        const books = await bookService.getFeaturedBooks();
        setFeaturedBooks(books.slice(0, 4));
      } catch (error) {
        console.error('Failed to load faculty overview', error);
      } finally {
        setLoading(false);
      }
    };

    void loadFeaturedBooks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Library Controls</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome, {user?.fullName || 'Faculty member'}. You can manage the digital catalog, review student requests, and approve issue permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/faculty/books" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-dps-200 transition">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="w-6 h-6 text-dps-600" />
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Catalog Management</h2>
          <p className="text-xs text-slate-500 mt-1">Add, remove, or update books in the digital library inventory.</p>
        </Link>

        <Link to="/faculty/issue" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-dps-200 transition">
          <div className="flex items-center justify-between mb-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Issue Permission</h2>
          <p className="text-xs text-slate-500 mt-1">Approve specific book issuance requests for students in your department.</p>
        </Link>

        <Link to="/faculty/requests" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-dps-200 transition">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Student Requests</h2>
          <p className="text-xs text-slate-500 mt-1">Review outstanding textbook demand and update status approvals.</p>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Department Highlights</h2>
          <Link to="/faculty/books" className="text-xs font-semibold text-dps-600 hover:text-dps-700">Open catalog</Link>
        </div>

        {loading ? (
          <LoadingSpinner size="md" text="Loading catalog highlights..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredBooks.map((book) => (
              <Link key={book.id} to={`/books/${book.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-dps-200 hover:bg-dps-50/30 transition">
                <img src={book.coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200'} alt={book.title} className="w-14 h-20 rounded-lg object-cover border border-slate-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{book.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{book.authorName || 'Faculty Recommended'}</p>
                  <p className="text-[11px] text-dps-600 mt-1">{book.categoryName || 'Department Collection'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
