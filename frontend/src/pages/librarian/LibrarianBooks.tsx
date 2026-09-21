import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  MapPin,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { bookService, categoryService, authorService } from '../../api';
import { Book, Category, Author } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const LibrarianBooks: React.FC = () => {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    categoryId: 0,
    authorId: 0,
    publisher: '',
    publicationYear: new Date().getFullYear(),
    edition: '1st',
    totalCopies: 5,
    shelfLocation: 'Rack A-1',
    description: '',
    coverImage: '',
    isDigital: false,
    fileUrl: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, selectedCategory]);

  const loadMetadata = async () => {
    try {
      const [catList, authList] = await Promise.all([
        categoryService.getAll(),
        authorService.getAll(),
      ]);
      setCategories(catList);
      setAuthors(authList);
      if (catList.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({ ...prev, categoryId: catList[0].id }));
      }
      if (authList.length > 0 && formData.authorId === 0) {
        setFormData((prev) => ({ ...prev, authorId: authList[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await bookService.searchBooks({
        query: searchQuery || undefined,
        categoryId: selectedCategory,
        page,
        size: 10,
        sortBy: 'id',
        direction: 'DESC',
      });
      setBooks(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchBooks();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedBook(null);
    setFormData({
      title: '',
      isbn: '',
      categoryId: categories[0]?.id || 1,
      authorId: authors[0]?.id || 1,
      publisher: 'DPS Engineering Press',
      publicationYear: new Date().getFullYear(),
      edition: '1st',
      totalCopies: 5,
      shelfLocation: 'Rack A-1',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop',
      isDigital: false,
      fileUrl: '',
      status: 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setIsEditing(true);
    setSelectedBook(book);
    setFormData({
      title: book.title,
      isbn: book.isbn,
      categoryId: book.category?.id || categories[0]?.id || 1,
      authorId: book.author?.id || authors[0]?.id || 1,
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || new Date().getFullYear(),
      edition: book.edition || '1st',
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || '',
      description: book.description || '',
      coverImage: book.coverImage || '',
      isDigital: book.isDigital || false,
      fileUrl: book.fileUrl || '',
      status: book.status || 'AVAILABLE',
    });
    setModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formData.title.trim();
    const isbn = formData.isbn.replace(/[-\s]/g, '');
    const publisher = formData.publisher.trim();
    const shelfNumber = formData.shelfLocation.trim();
    const author = authors.find((item) => item.id === formData.authorId);
    const category = categories.find((item) => item.id === formData.categoryId);
    const totalCopies = Number(formData.totalCopies);

    if (!title || !isbn || !shelfNumber || !author || !category) {
      showToast('Complete the title, ISBN, author, category, and shelf location.', 'error');
      return;
    }
    if (!/^\d{10,13}$/.test(isbn)) {
      showToast('ISBN must contain 10 or 13 digits.', 'error');
      return;
    }
    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      showToast('Total copies must be a whole number greater than zero.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title,
        isbn,
        authorId: author.id,
        authorName: author.name,
        categoryId: category.id,
        categoryName: category.name,
        publisher,
        publicationYear: Number(formData.publicationYear),
        edition: formData.edition,
        totalCopies,
        shelfNumber,
        description: formData.description,
        coverImage: formData.coverImage,
        digitalAvailable: formData.isDigital,
        digitalFile: formData.fileUrl,
        bookType: formData.isDigital ? 'BOTH' : 'PHYSICAL',
        status: formData.status,
      };

      if (isEditing && selectedBook) {
        await bookService.updateBook(selectedBook.id, payload);
        showToast('Book details updated successfully!', 'success');
      } else {
        await bookService.createBook(payload);
        showToast('New book added to library inventory!', 'success');
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    setSubmitting(true);
    try {
      await bookService.deleteBook(selectedBook.id);
      showToast('Book removed from library catalog', 'info');
      setDeleteModalOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete book', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Library Catalog & Inventory ({totalElements})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain textbooks, copies, physical shelf placements, and digital repository links.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dps-600 hover:bg-dps-700 text-white text-xs font-bold rounded-xl shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Textbook</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, author name, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="w-full md:w-64">
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 transition"
          >
            <option value="">All Engineering Departments</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading book catalog..." />
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No books match criteria"
            description="Try adjusting your keywords or category filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory(undefined);
              setPage(0);
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Shelf Rack</th>
                  <th className="py-3 px-4 text-center">Copies (Avail / Total)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded shadow-xs"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">
                            {book.title}
                          </p>
                          <p className="text-slate-500 mt-0.5">
                            {book.author?.name} • <span className="font-mono">{book.isbn}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                        {book.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{book.shelfLocation || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-1 rounded-lg ${
                          book.availableCopies > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          book.availableCopies > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {book.availableCopies > 0 ? 'AVAILABLE' : 'BORROWED OUT'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-1.5 text-slate-600 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Book"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Update Textbook Details' : 'Add New Book to College Library'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Author *
              </label>
              <select
                value={formData.authorId}
                onChange={(e) => setFormData({ ...formData, authorId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Engineering Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                ISBN-13 / ISBN-10 *
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shelf Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Rack C-4, Tier 2"
                required
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Physical Copies *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Synopsis / Course Modules Covered
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Book from Catalog"
        message={`Are you sure you want to remove "${selectedBook?.title}"? Any loan history associated with this book will be permanently archived.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        loading={submitting}
        onConfirm={handleDeleteBook}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedBook(null);
        }}
      />
    </div>
  );
};

