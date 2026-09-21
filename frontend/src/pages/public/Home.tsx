import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FileText,
  Users,
  Award,
  ArrowRight,
  BookmarkCheck,
  Download,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Book, DigitalResource } from '../../types';
import { bookService, resourceService, analyticsService } from '../../api';
import { BookCard } from '../../components/BookCard';
import { BookCardSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';

export const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [recentResources, setRecentResources] = useState<DigitalResource[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({
    totalBooks: 35,
    totalCopies: 280,
    digitalResources: 11,
    registeredStudents: 10,
    totalLoansIssued: 5,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [booksData, resourcesData, statsData] = await Promise.all([
          bookService.getFeaturedBooks(),
          resourceService.getRecentApprovedResources(),
          analyticsService.getPublicOverview().catch(() => ({})),
        ]);

        setFeaturedBooks(booksData);
        setRecentResources(resourcesData);
        if (statsData && Object.keys(statsData).length > 0) {
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative gradient-hero text-white py-20 lg:py-28 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-dps-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-wide text-dps-300 backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-dps-400" />
              <span>Thakur Shree DPS College of Engineering and Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Your Digital Library, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dps-300 via-blue-200 to-sky-300">
                Anywhere, Anytime
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Access books, academic resources, notes, question papers and digital learning materials through one centralized library platform.
            </p>

            {/* Quick Search Bar in Hero */}
            <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl shadow-navy-950/40 border border-white/20">
                <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by book title, author name, ISBN, or subject..."
                  className="w-full px-3 py-2.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-dps-600 hover:bg-dps-700 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-dps-600/30 transition flex items-center gap-2 flex-shrink-0"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/books"
                className="px-6 py-3 rounded-xl bg-white text-navy-950 font-bold text-xs tracking-wide uppercase hover:bg-slate-100 transition shadow-lg"
              >
                Explore Library
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide uppercase backdrop-blur-md border border-white/20 transition"
                >
                  Login to Portal
                </Link>
              ) : (
                <Link
                  to="/student/dashboard"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide uppercase backdrop-blur-md border border-white/20 transition"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATISTICS COUNTER */}
      <section className="bg-white border-b border-slate-200/80 -mt-8 relative z-20 max-w-6xl mx-auto rounded-2xl shadow-card p-6 sm:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-2">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stats.totalBooks || 35}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Total Titles Cataloged
            </p>
          </div>
          <div className="p-2">
            <p className="text-3xl sm:text-4xl font-black text-dps-600 tracking-tight">
              {stats.digitalResources || 11}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Digital Resources & Notes
            </p>
          </div>
          <div className="p-2">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {stats.registeredStudents || 10}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Registered Students
            </p>
          </div>
          <div className="p-2">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              {stats.totalLoansIssued || 5}+
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Books Circulated
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BOOKS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-dps-50 px-2.5 py-1 rounded-md">
              Library Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
              Featured Textbooks & References
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Core academic literature recommended by university curriculum and departmental heads.
            </p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-dps-600 hover:text-dps-700 transition"
          >
            <span>Browse all textbooks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {featuredBooks.slice(0, 6).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 4. ACADEMIC DIGITAL RESOURCES GRID */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              Departmental Repositories
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
              Academic Resources & Study Materials
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Verified lecture notes, official branch syllabi, previous semester question papers, and laboratory experiment manuals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/digital-resources?tab=NOTES"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-dps-600 transition">
                Lecture Notes
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Handwritten and typed notes prepared by DPS engineering faculty across all semesters.
              </p>
              <span className="text-xs font-semibold text-dps-600 mt-4 inline-flex items-center gap-1">
                View Notes →
              </span>
            </Link>

            <Link
              to="/digital-resources?tab=SYLLABUS"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                University Syllabus
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Detailed credit distribution, course outcomes, and textbook recommendations.
              </p>
              <span className="text-xs font-semibold text-emerald-600 mt-4 inline-flex items-center gap-1">
                View Syllabi →
              </span>
            </Link>

            <Link
              to="/digital-resources?tab=QUESTION_PAPER"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                Question Papers
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Archived mid-semester and end-semester university exam papers with marking schemes.
              </p>
              <span className="text-xs font-semibold text-amber-600 mt-4 inline-flex items-center gap-1">
                Past Papers →
              </span>
            </Link>

            <Link
              to="/digital-resources?tab=LAB_MANUAL"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                Lab Manuals
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Practical manuals for computing laboratories, digital electronics, and CAD/CAM workstations.
              </p>
              <span className="text-xs font-semibold text-purple-600 mt-4 inline-flex items-center gap-1">
                Lab Guides →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-dps-50 px-3 py-1 rounded-full">
            Borrowing Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2">
            How The Library System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simple, transparent, automated library circulation engineered for campus members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-dps-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Search & Discover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse real-time copy availability, shelf numbers, or download approved PDF learning materials.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-dps-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Issue or Reserve</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Borrow with a standard 10-day period. If a book has 0 copies, place a reservation to reserve the next copy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-dps-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Smart Reminders</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated in-app reminders alert you 3 days, 1 day, and on due date to prevent overdue fines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-dps-600 text-white font-bold flex items-center justify-center mx-auto mb-4 shadow-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1">Easy Return</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deposit book at circulation desk. Inventory counts update immediately and waiting reservations are notified.
            </p>
          </div>
        </div>
      </section>

      {/* 6. INSTITUTION & TEAM HIGHLIGHT */}
      <section className="bg-gradient-to-br from-navy-950 to-dps-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-dps-300 mb-4 border border-white/15">
              <GraduationCap className="w-4 h-4 text-dps-400" />
              <span>Host Institution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Thakur Shree DPS College of Engineering and Management
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              Dedicated to academic excellence in technical education, fostering innovation across Computer Engineering, Information Technology, Artificial Intelligence & Machine Learning, Electronics, Mechanical, and Civil disciplines.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-2xl font-bold text-dps-300">24/7</p>
                <p className="text-xs text-slate-400 mt-1">Digital Resource Access</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-2xl font-bold text-emerald-300">10 Days</p>
                <p className="text-xs text-slate-400 mt-1">Standard Loan Period</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-dps-600 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Project Engineering Team</h3>
                <p className="text-xs text-dps-300">Digital Library Management System</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Designed, architected, and engineered by final-year students of the Computer Engineering Department:
            </p>

            <div className="space-y-3">
              <div className="bg-white/10 p-3.5 rounded-2xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dps-500 text-white font-bold text-xs flex items-center justify-center">
                    AY
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Ashish Yadav</p>
                    <p className="text-[11px] text-slate-400">Computer Engineering</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-dps-300 bg-dps-950/60 px-2 py-0.5 rounded-md">DPS2023CS001</span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dps-500 text-white font-bold text-xs flex items-center justify-center">
                    RY
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Rahul Yadav</p>
                    <p className="text-[11px] text-slate-400">Computer Engineering</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-dps-300 bg-dps-950/60 px-2 py-0.5 rounded-md">DPS2023CS002</span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dps-500 text-white font-bold text-xs flex items-center justify-center">
                    PY
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Priyanshu Yadav</p>
                    <p className="text-[11px] text-slate-400">Computer Engineering</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-dps-300 bg-dps-950/60 px-2 py-0.5 rounded-md">DPS2023CS003</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

