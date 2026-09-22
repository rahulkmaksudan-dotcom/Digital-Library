import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, BookOpen, RotateCcw } from 'lucide-react';
import { Book, Category } from '../../types';
import { bookService, categoryService } from '../../api';
import { BookCard } from '../../components/BookCard';
import { BookCardSkeleton } from '../../components/Skeleton';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';

export const BooksCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters state
  const query = searchParams.get('query') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const bookType = searchParams.get('bookType') || '';
  const availableOnly = searchParams.get('availableOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'id';
  const direction = searchParams.get('direction') || 'desc';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await bookService.searchBooks({
          query: query || undefined,
          categoryId: categoryId || undefined,
          bookType: bookType || undefined,
          availableOnly: availableOnly || undefined,
          sortBy,
          direction,
          page,
          size: pageSize,
        });

        setBooks(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        console.error('Error fetching catalog books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query, categoryId, bookType, availableOnly, sortBy, direction, page]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    // Reset to page 0 on filter update
    if (!newParams.page) {
      current.set('page', '0');
    }
    setSearchParams(current);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchInput.trim() || null });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Books Catalog & Literature
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search the complete holdings of Thakur Shree DPS College of Engineering Central Library.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, author, ISBN..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dps-500/20 focus:border-dps-500 transition shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-dps-600 hover:bg-dps-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-dps-600" />
            <span>Filter:</span>
          </span>

          {/* Category Filter */}
          <select
            value={categoryId || ''}
            onChange={(e) => updateFilters({ categoryId: e.target.value || null })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dps-500/20"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Book Type Filter */}
          <select
            value={bookType}
            onChange={(e) => updateFilters({ bookType: e.target.value || null })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-dps-500/20"
          >
            <option value="">All Media Types</option>
            <option value="PHYSICAL">Physical Only</option>
            <option value="DIGITAL">Digital Copy Only</option>
            <option value="BOTH">Physical & Digital</option>
          </select>

          {/* Availability Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => updateFilters({ availableOnly: e.target.checked ? 'true' : null })}
              className="rounded text-dps-600 focus:ring-dps-500"
            />
            <span>Available Copies Only</span>
          </label>

          {(query || categoryId || bookType || availableOnly) && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-rose-600 font-medium transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Sort by:</span>
          <select
            value={`${sortBy}-${direction}`}
            onChange={(e) => {
              const [s, d] = e.target.value.split('-');
              updateFilters({ sortBy: s, direction: d });
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="id-desc">Newest Additions</option>
            <option value="title-asc">Title (A - Z)</option>
            <option value="title-desc">Title (Z - A)</option>
            <option value="availableCopies-desc">Availability (High to Low)</option>
            <option value="publicationYear-desc">Publication Year</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {Array.from({ length: pageSize }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books found"
          description="We couldn't find any books matching your current search criteria. Try modifying your keywords or resetting filters."
          actionLabel="Clear Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(newPage) => updateFilters({ page: String(newPage) })}
          />
        </div>
      )}
    </div>
  );
};

