import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Search,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Layers,
  MapPin,
  Hash,
  AlertTriangle,
  FileText,
  Check,
  X
} from 'lucide-react';
import { loanService, userService, bookService } from '../../api';
import { User as UserType, Book, Loan } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const LibrarianIssue: React.FC = () => {
  const { showToast } = useToast();

  // Navigation tab: 'pending' | 'active_loans' | 'manual_issue'
  const [activeTab, setActiveTab] = useState<'pending' | 'active_loans' | 'manual_issue'>('pending');

  // --- Tab 1: Pending Borrow Requests State ---
  const [pendingRequests, setPendingRequests] = useState<Loan[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [grantingId, setGrantingId] = useState<number | null>(null);

  // --- Tab 2: Active Loans State ---
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [returningId, setReturningId] = useState<number | null>(null);

  // --- Revoke Modal State (Used for both pending and active loans) ---
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedLoanForRevoke, setSelectedLoanForRevoke] = useState<Loan | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // --- Tab 3: Manual Direct Issue State ---
  const [studentQuery, setStudentQuery] = useState('');
  const [students, setStudents] = useState<UserType[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);
  const [searchingStudents, setSearchingStudents] = useState(false);

  const [bookQuery, setBookQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchingBooks, setSearchingBooks] = useState(false);

  const [loanDays, setLoanDays] = useState(10);
  const [notes, setNotes] = useState('Standard 10-day semester loan');
  const [issuing, setIssuing] = useState(false);
  const [issuedLoan, setIssuedLoan] = useState<Loan | null>(null);

  // Load pending borrow requests
  const fetchPendingRequests = async () => {
    setLoadingPending(true);
    try {
      const res = await loanService.getPendingRequests(0, 50);
      setPendingRequests(res.content || []);
    } catch (err: any) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  // Load active loans
  const fetchActiveLoans = async () => {
    setLoadingActive(true);
    try {
      const res = await loanService.searchLoans({
        status: 'ACTIVE',
        query: activeSearchQuery || undefined,
        page: activePage,
        size: 10,
      });
      setActiveLoans(res.content || []);
      setActiveTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching active loans:', err);
    } finally {
      setLoadingActive(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingRequests();
    } else if (activeTab === 'active_loans') {
      fetchActiveLoans();
    }
  }, [activeTab, activePage]);

  // Grant loan permission
  const handleGrantLoan = async (loan: Loan) => {
    setGrantingId(loan.id);
    try {
      await loanService.grantLoan(loan.id);
      showToast(`Loan permission granted for "${loan.bookTitle || loan.book?.title}". Book issued!`, 'success');
      await fetchPendingRequests();
      if (activeTab === 'active_loans') {
        await fetchActiveLoans();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to grant loan permission', 'error');
    } finally {
      setGrantingId(null);
    }
  };

  // Open revoke modal
  const openRevokeModal = (loan: Loan) => {
    setSelectedLoanForRevoke(loan);
    setRevokeReason(
      loan.status === 'PENDING'
        ? 'Book copy reserved for high-demand curriculum / Request declined'
        : 'Loan revoked by library administration'
    );
    setRevokeModalOpen(true);
  };

  // Confirm revocation
  const handleConfirmRevoke = async () => {
    if (!selectedLoanForRevoke) return;
    setRevoking(true);
    try {
      await loanService.revokeLoan(selectedLoanForRevoke.id, revokeReason);
      showToast(
        selectedLoanForRevoke.status === 'PENDING'
          ? 'Borrow request was revoked.'
          : 'Active loan was revoked and copy returned to shelf.',
        'success'
      );
      setRevokeModalOpen(false);
      setSelectedLoanForRevoke(null);
      if (activeTab === 'pending') {
        await fetchPendingRequests();
      } else {
        await fetchActiveLoans();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to revoke loan', 'error');
    } finally {
      setRevoking(false);
    }
  };

  // Direct return active book
  const handleReturnLoan = async (loanId: number) => {
    setReturningId(loanId);
    try {
      await loanService.returnBook(loanId);
      showToast('Book marked as returned successfully!', 'success');
      await fetchActiveLoans();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to return book', 'error');
    } finally {
      setReturningId(null);
    }
  };

  // Search students for manual issue
  const handleSearchStudents = async () => {
    if (!studentQuery.trim()) return;
    setSearchingStudents(true);
    try {
      const res = await userService.searchUsers({ query: studentQuery, size: 5 });
      setStudents(res.content);
      if (res.content.length === 0) {
        showToast('No student found matching query', 'info');
      }
    } catch (err: any) {
      showToast('Error searching students', 'error');
    } finally {
      setSearchingStudents(false);
    }
  };

  // Search books for manual issue
  const handleSearchBooks = async () => {
    if (!bookQuery.trim()) return;
    setSearchingBooks(true);
    try {
      const res = await bookService.searchBooks({ query: bookQuery, size: 5 });
      setBooks(res.content);
      if (res.content.length === 0) {
        showToast('No book found matching query', 'info');
      }
    } catch (err: any) {
      showToast('Error searching books', 'error');
    } finally {
      setSearchingBooks(false);
    }
  };

  // Submit manual issue
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please select a student borrower first', 'error');
      return;
    }
    if (!selectedBook) {
      showToast('Please select a book to issue', 'error');
      return;
    }
    if (selectedBook.availableCopies <= 0) {
      showToast('This book has zero available physical copies! Check reservations.', 'error');
      return;
    }

    setIssuing(true);
    try {
      const loan = await loanService.issueBook({
        userId: selectedStudent.id,
        bookId: selectedBook.id,
        loanDays,
        notes,
      });
      setIssuedLoan(loan);
      showToast(`Book "${selectedBook.title}" issued to ${selectedStudent.fullName}!`, 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to issue book', 'error');
    } finally {
      setIssuing(false);
    }
  };

  const handleResetForm = () => {
    setSelectedStudent(null);
    setSelectedBook(null);
    setStudentQuery('');
    setBookQuery('');
    setStudents([]);
    setBooks([]);
    setIssuedLoan(null);
    setLoanDays(10);
    setNotes('Standard 10-day semester loan');
  };

  const manualDueDate = new Date();
  manualDueDate.setDate(manualDueDate.getDate() + loanDays);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Circulation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Circulation & Loan Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review patron borrow requests, manage active loans, grant permissions, or issue books directly.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-white text-dps-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active_loans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'active_loans'
                ? 'bg-white text-dps-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-dps-600" />
            <span>Active Loans (Revoke)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual_issue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'manual_issue'
                ? 'bg-white text-dps-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
            <span>Manual Direct Issue</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENDING BORROW REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Borrow Request Authorization:</span> Students and patrons request to borrow books online. As Administrator, Librarian, or Faculty, you can verify book availability and student credentials to <strong>Grant Permission (Issue Book)</strong> or <strong>Revoke/Reject Request</strong>.
            </div>
          </div>

          {loadingPending ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 flex justify-center">
              <LoadingSpinner size="lg" text="Loading pending borrow requests..." />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                There are currently no pending borrow requests awaiting permission. When students request books, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 p-5 shadow-card transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Left: Book & Student Details */}
                  <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
                    {/* Book Cover */}
                    <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 flex items-center justify-center">
                      {req.bookCover ? (
                        <img
                          src={req.bookCover}
                          alt={req.bookTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-8 h-8 text-slate-300" />
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-200">
                          Pending Approval
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Request ID #{req.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {req.bookTitle}
                      </h3>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span>
                          Author: <strong className="text-slate-800">{req.authorName || 'N/A'}</strong>
                        </span>
                        <span className="font-mono">
                          ISBN: <strong className="text-slate-800">{req.bookIsbn || 'N/A'}</strong>
                        </span>
                        {req.categoryName && (
                          <span>
                            Dept/Cat: <strong className="text-slate-800">{req.categoryName}</strong>
                          </span>
                        )}
                        {req.shelfNumber && (
                          <span>
                            Shelf: <strong className="text-slate-800">{req.shelfNumber}</strong>
                          </span>
                        )}
                      </div>

                      {/* Stock availability indicator */}
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            (req.availableCopies ?? 1) > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {(req.availableCopies ?? 1) > 0 ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{req.availableCopies} Copies in Stock</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Out of Physical Stock</span>
                            </>
                          )}
                        </span>
                        {req.notes && (
                          <span className="text-[11px] text-slate-500 italic truncate max-w-sm">
                            "{req.notes}"
                          </span>
                        )}
                      </div>

                      {/* Student Borrower Info Box */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <User className="w-3.5 h-3.5 text-dps-600" />
                          <span>{req.userName}</span>
                        </div>
                        {req.studentId && (
                          <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            Roll: {req.studentId}
                          </span>
                        )}
                        {req.userDepartment && (
                          <span className="text-slate-600">
                            Dept: <strong>{req.userDepartment}</strong>
                          </span>
                        )}
                        {req.userEmail && (
                          <span className="text-slate-500 text-[11px]">
                            {req.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Grant & Revoke Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-44 flex-shrink-0">
                    <button
                      onClick={() => handleGrantLoan(req)}
                      disabled={grantingId === req.id || (req.availableCopies !== undefined && req.availableCopies <= 0)}
                      className="flex-1 lg:flex-none py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold tracking-wide shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{grantingId === req.id ? 'Granting...' : 'Grant Loan (Issue)'}</span>
                    </button>

                    <button
                      onClick={() => openRevokeModal(req)}
                      className="flex-1 lg:flex-none py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Revoke / Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE LOANS (REVOKE / RETURN) */}
      {/* ========================================================================= */}
      {activeTab === 'active_loans' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter active loans by student name, roll number, book title, or ISBN..."
                value={activeSearchQuery}
                onChange={(e) => setActiveSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActivePage(0);
                    fetchActiveLoans();
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 shadow-xs"
              />
            </div>
            <button
              onClick={() => {
                setActivePage(0);
                fetchActiveLoans();
              }}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Search
            </button>
          </div>

          {loadingActive ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 flex justify-center">
              <LoadingSpinner size="lg" text="Loading active circulations..." />
            </div>
          ) : activeLoans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-card">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Active Loans Found</h3>
              <p className="text-xs text-slate-500 mt-1">There are no books currently checked out matching the filter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Book Details</th>
                      <th className="py-3.5 px-5">Borrower Student</th>
                      <th className="py-3.5 px-5">Issue Date</th>
                      <th className="py-3.5 px-5">Due Date (10 Days)</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Circulation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeLoans.map((loan) => {
                      const isOverdue = new Date(loan.dueDate).getTime() < new Date().getTime();
                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {loan.bookCover || loan.book?.coverImage ? (
                                <img
                                  src={loan.bookCover || loan.book?.coverImage}
                                  alt={loan.bookTitle || loan.book?.title}
                                  className="w-9 h-12 object-cover rounded shadow-xs"
                                />
                              ) : (
                                <div className="w-9 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1 max-w-[220px]">
                                  {loan.bookTitle || loan.book?.title}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  ISBN: {loan.bookIsbn || loan.book?.isbn || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-800">
                              {loan.userName || loan.user?.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Roll: {loan.studentId || loan.user?.studentId || 'N/A'}
                            </p>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                            {new Date(loan.issueDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-800 font-semibold'}>
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            {isOverdue ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" /> Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Active Loan
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleReturnLoan(loan.id)}
                                disabled={returningId === loan.id}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{returningId === loan.id ? 'Returning...' : 'Return'}</span>
                              </button>

                              <button
                                onClick={() => openRevokeModal(loan)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {activeTotalPages > 1 && (
                <div className="p-4 border-t border-slate-100">
                  <Pagination
                    currentPage={activePage}
                    totalPages={activeTotalPages}
                    onPageChange={(p) => setActivePage(p)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANUAL DIRECT ISSUE */}
      {/* ========================================================================= */}
      {activeTab === 'manual_issue' && (
        <div>
          {issuedLoan ? (
            /* Issue Success Receipt */
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-card text-center max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Circulation Verified & Logged
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Book Issued Successfully!
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Transaction ID: #{issuedLoan.id}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Student Borrower</span>
                  <span className="font-bold text-slate-900">
                    {issuedLoan.userName || issuedLoan.user?.fullName} ({issuedLoan.studentId || issuedLoan.user?.studentId})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Textbook Issued</span>
                  <span className="font-bold text-slate-900 line-clamp-1 text-right max-w-xs">
                    {issuedLoan.bookTitle || issuedLoan.book?.title}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Issue Date</span>
                  <span className="font-medium text-slate-800">
                    {new Date(issuedLoan.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Scheduled Due Date (10 Days)</span>
                  <span className="font-black text-rose-600 text-sm">
                    {new Date(issuedLoan.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Late Fee Policy</span>
                  <span className="font-semibold text-slate-700">₹2.00 / day overdue</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleResetForm}
                  className="px-6 py-2.5 bg-dps-600 hover:bg-dps-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Issue Another Book
                </button>
              </div>
            </div>
          ) : (
            /* Issue Form Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Selection */}
              <div className="space-y-6">
                {/* Step 1: Select Student */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-dps-100 text-dps-700 font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Select Borrower Student</h3>
                  </div>

                  {selectedStudent ? (
                    <div className="p-3 bg-dps-50/70 border border-dps-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-dps-600 text-white font-bold text-xs flex items-center justify-center">
                          {selectedStudent.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{selectedStudent.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {selectedStudent.studentId} • {selectedStudent.department}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs font-bold text-dps-600 hover:text-dps-700 underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Student Roll No (e.g. DPS-2024-001) or Name..."
                          value={studentQuery}
                          onChange={(e) => setStudentQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
                        />
                        <button
                          type="button"
                          onClick={handleSearchStudents}
                          disabled={searchingStudents}
                          className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition disabled:opacity-50"
                        >
                          Search
                        </button>
                      </div>

                      {students.length > 0 && (
                        <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden mt-2">
                          {students.map((stu) => (
                            <div
                              key={stu.id}
                              onClick={() => setSelectedStudent(stu)}
                              className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition"
                            >
                              <div>
                                <p className="font-bold text-slate-800">{stu.fullName}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {stu.studentId} • {stu.department}
                                </p>
                              </div>
                              <span className="text-[11px] text-dps-600 font-bold">Select</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Step 2: Select Book */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-dps-100 text-dps-700 font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Select Textbook to Issue</h3>
                  </div>

                  {selectedBook ? (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedBook.coverImage ? (
                          <img
                            src={selectedBook.coverImage}
                            alt={selectedBook.title}
                            className="w-8 h-11 object-cover rounded shadow-xs"
                          />
                        ) : (
                          <div className="w-8 h-11 bg-white rounded flex items-center justify-center text-slate-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">
                            {selectedBook.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ISBN: {selectedBook.isbn} • Shelf: {selectedBook.shelfLocation || selectedBook.shelfNumber || 'General'}
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">
                            Available Copies: {selectedBook.availableCopies} of{' '}
                            {selectedBook.totalCopies}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedBook(null)}
                        className="text-xs font-bold text-dps-600 hover:text-dps-700 underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Search title or ISBN (e.g. 978-0131103627)..."
                          value={bookQuery}
                          onChange={(e) => setBookQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchBooks()}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
                        />
                        <button
                          type="button"
                          onClick={handleSearchBooks}
                          disabled={searchingBooks}
                          className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition disabled:opacity-50"
                        >
                          Search
                        </button>
                      </div>

                      {books.length > 0 && (
                        <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden mt-2">
                          {books.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBook(b)}
                              className={`p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition ${
                                b.availableCopies <= 0 ? 'opacity-60 bg-slate-50/50' : ''
                              }`}
                            >
                              <div>
                                <p className="font-bold text-slate-800 line-clamp-1">{b.title}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  ISBN: {b.isbn} • {b.availableCopies} available
                                </p>
                              </div>
                              <span
                                className={`text-[11px] font-bold ${
                                  b.availableCopies > 0 ? 'text-dps-600' : 'text-rose-500'
                                }`}
                              >
                                {b.availableCopies > 0 ? 'Select' : 'Out of Stock'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Loan Parameters & Confirmation */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card flex flex-col justify-between">
                <form onSubmit={handleIssueBook} className="space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-dps-100 text-dps-700 font-bold text-xs flex items-center justify-center">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Lending Term & Notes</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Loan Duration (Standard: 10 Days)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={loanDays}
                        onChange={(e) => setLoanDays(Number(e.target.value))}
                        className="w-24 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-hidden focus:ring-2 focus:ring-dps-500"
                      />
                      <span className="text-xs text-slate-500">days from today</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Circulation Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Regular semester loan issued by desk librarian"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
                    />
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Transaction Preview
                    </h4>
                    <div className="flex justify-between text-slate-600">
                      <span>Borrower:</span>
                      <span className="font-bold text-slate-900">
                        {selectedStudent ? selectedStudent.fullName : 'None selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Book:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[200px]">
                        {selectedBook ? selectedBook.title : 'None selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Due Date:</span>
                      <span className="font-bold text-rose-600">
                        {manualDueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={issuing || !selectedStudent || !selectedBook}
                      className="w-full py-3 bg-dps-600 hover:bg-dps-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{issuing ? 'Processing Circulation...' : 'Confirm & Issue Book (10 Days)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* REVOKE LOAN / REQUEST MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        title={
          selectedLoanForRevoke?.status === 'PENDING'
            ? 'Revoke / Reject Borrow Request'
            : 'Revoke Active Book Loan'
        }
        subtitle="This action will cancel the authorization and update library inventory records."
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900">
              <p className="font-bold">
                {selectedLoanForRevoke?.status === 'PENDING'
                  ? 'Are you sure you want to decline this request?'
                  : 'Are you sure you want to revoke this active loan?'}
              </p>
              <p className="mt-1">
                Book: <strong>{selectedLoanForRevoke?.bookTitle || selectedLoanForRevoke?.book?.title}</strong>
                <br />
                Borrower: <strong>{selectedLoanForRevoke?.userName || selectedLoanForRevoke?.user?.fullName}</strong>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Revocation (Sent to student notification)
            </label>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Reserved for library reference shelf / Duplicate request / Academic hold"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRevokeModalOpen(false)}
              disabled={revoking}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRevoke}
              disabled={revoking}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>{revoking ? 'Revoking...' : 'Confirm Revoke'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LibrarianIssue;
