import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Book as BookType,
} from '../../types';
import { bookService, favoriteService, reservationService, loanService } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Bookmark,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  ArrowLeft,
  Layers,
  MapPin,
  Calendar,
  Building,
  Globe,
  Hash,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [borrowing, setBorrowing] = useState(false);

  const { user, isAuthenticated, isStudent, isStaff } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      try {
        const data = await bookService.getBookById(Number(id));
        setBook(data);

        if (isAuthenticated && user) {
          const favStatus = await favoriteService.checkFavorite(Number(id)).catch(() => false);
          setIsFavorite(favStatus);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, isAuthenticated, user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !book) {
      info('Please sign in to add books to your favorites.');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(book.id);
        setIsFavorite(false);
        success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(book.id);
        setIsFavorite(true);
        success('Added to favorites');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update favorites');
    }
  };

  const handleReserveBook = async () => {
    if (!isAuthenticated || !book) {
      info('Please sign in to place a reservation.');
      navigate('/login');
      return;
    }

    setReserving(true);
    try {
      await reservationService.createReservation(book.id);
      success(`Reservation placed for "${book.title}". You will be notified once a copy is available.`);
    } catch (err: any) {
      error(err.message || 'Failed to reserve book');
    } finally {
      setReserving(false);
    }
  };

  const handleSelfIssue = async () => {
    if (!isAuthenticated || !user || !book) return;

    setBorrowing(true);
    try {
      await loanService.issueBook({
        userId: user.id,
        bookId: book.id,
        notes: 'Issued via student portal checkout',
      });
      success(`"${book.title}" borrowed successfully! Return within 10 days.`);
      setBorrowModalOpen(false);
      // Reload book details to reflect updated copy count
      const updated = await bookService.getBookById(book.id);
      setBook(updated);
    } catch (err: any) {
      error(err.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading book details..." />;
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested book does not exist or has been removed.</p>
        <Link to="/books" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-dps-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0 && book.status === 'AVAILABLE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link to="/books" className="hover:text-dps-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Books Catalog</span>
        </Link>
        <span>/</span>
        <span className="text-slate-400">{book.categoryName || 'General'}</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{book.title}</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Cover & Quick Actions */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-slate-300 border border-slate-200">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
                  <BookOpen className="w-16 h-16 text-slate-300 mb-3" />
                  <span className="text-xs font-bold text-slate-600">{book.title}</span>
                </div>
              )}

              {/* Media badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-navy-950/85 text-white rounded-lg backdrop-blur-md">
                  {book.bookType}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons on Mobile & Desktop */}
            <div className="w-full max-w-[280px] mt-6 space-y-2.5">
              {isAvailable ? (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setBorrowModalOpen(true);
                    }
                  }}
                  className="w-full py-3 bg-dps-600 hover:bg-dps-700 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-md shadow-dps-600/30 transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Borrow Book (10 Days)</span>
                </button>
              ) : (
                <button
                  onClick={handleReserveBook}
                  disabled={reserving}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-md shadow-amber-500/30 transition flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{reserving ? 'Reserving...' : 'Place Reservation Hold'}</span>
                </button>
              )}

              {book.digitalAvailable && book.digitalFile && (
                <a
                  href={book.digitalFile}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Download className="w-4 h-4 text-dps-600" />
                  <span>Read / Download Digital Copy</span>
                </a>
              )}

              <button
                onClick={handleToggleFavorite}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Complete Metadata */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              {/* Category & Availability Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 bg-dps-50 text-dps-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {book.categoryName || 'Engineering Sciences'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{book.availableCopies} of {book.totalCopies} Copies Available</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>All Copies Currently Checked Out</span>
                    </>
                  )}
                </span>
              </div>

              {/* Title & Author */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-sm font-medium text-slate-500 mt-1">{book.subtitle}</p>
              )}

              <p className="text-sm text-slate-700 mt-2">
                By <span className="font-bold text-slate-900">{book.authorName}</span>
              </p>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Synopsis / Abstract
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {book.description ||
                    'Standard engineering textbook cataloged for undergraduate and postgraduate study at Thakur Shree DPS College of Engineering and Management.'}
                </p>
              </div>

              {/* Shelf & Technical Specifications Grid */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Library Catalog Specifications
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Hash className="w-3.5 h-3.5" />
                      <span>ISBN</span>
                    </div>
                    <p className="font-mono font-bold text-slate-800">{book.isbn}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Shelf / Call No.</span>
                    </div>
                    <p className="font-mono font-bold text-slate-800">{book.shelfNumber || 'Open Shelf'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Location</span>
                    </div>
                    <p className="font-semibold text-slate-800">{book.location || 'Central Library'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>Publisher</span>
                    </div>
                    <p className="font-semibold text-slate-800">{book.publisher || 'Academic Press'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Publication Year</span>
                    </div>
                    <p className="font-semibold text-slate-800">{book.publicationYear || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Language</span>
                    </div>
                    <p className="font-semibold text-slate-800">{book.language || 'English'}</p>
                  </div>
                </div>
              </div>

              {/* Policy note */}
              <div className="mt-6 bg-dps-50/60 p-4 rounded-2xl border border-dps-100 flex items-start gap-3">
                <Clock className="w-4 h-4 text-dps-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-dps-900 leading-relaxed">
                  <span className="font-bold">Standard 10-Day Borrowing Policy:</span> Books must be returned or renewed within 10 days of issuance. Late fees are applied daily on overdue titles as configured by the Library Committee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Confirmation Modal */}
      <ConfirmDialog
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        onConfirm={handleSelfIssue}
        title="Confirm Book Borrowing"
        message={`Are you sure you want to borrow "${book.title}"? The book will be issued to your account for 10 days starting today.`}
        confirmLabel="Confirm Loan"
        loading={borrowing}
      />
    </div>
  );
};

