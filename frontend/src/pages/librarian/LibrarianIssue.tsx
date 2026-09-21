import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Search,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { loanService, userService, bookService } from '../../api';
import { User as UserType, Book, Loan } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const LibrarianIssue: React.FC = () => {
  const { showToast } = useToast();

  // Student search state
  const [studentQuery, setStudentQuery] = useState('');
  const [students, setStudents] = useState<UserType[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserType | null>(null);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Book search state
  const [bookQuery, setBookQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchingBooks, setSearchingBooks] = useState(false);

  // Loan parameters
  const [loanDays, setLoanDays] = useState(10);
  const [notes, setNotes] = useState('Standard 10-day semester loan');
  const [issuing, setIssuing] = useState(false);
  const [issuedLoan, setIssuedLoan] = useState<Loan | null>(null);

  // Search students
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

  // Search books
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

  // Issue circulation
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

  // Calculated Due Date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDays);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Circulation Desk: Issue Book
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue a textbook to an active college student or faculty member with a 10-day lending window.
        </p>
      </div>

      {issuedLoan ? (
        /* Issue Success Receipt */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-md text-center max-w-2xl mx-auto space-y-6">
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
                {issuedLoan.user?.fullName} ({issuedLoan.user?.studentId})
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Textbook Issued</span>
              <span className="font-bold text-slate-900 line-clamp-1 text-right max-w-xs">
                {issuedLoan.book?.title}
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
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
                        ISBN: {selectedBook.isbn} • Shelf: {selectedBook.shelfLocation}
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
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
                  placeholder="e.g. Exam preparation copy, pristine condition"
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
                    {dueDate.toLocaleDateString()}
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
  );
};

