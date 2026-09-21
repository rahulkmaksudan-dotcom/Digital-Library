import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen } from 'lucide-react';
import { favoriteService } from '../../api';
import { Book } from '../../types';
import { BookCard } from '../../components/BookCard';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

export const StudentFavorites: React.FC = () => {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchFavorites();
  }, [page]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteService.getMyFavorites(page, 12);
      setFavorites(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load favorite books', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggled = (bookId: number, isFav: boolean) => {
    if (!isFav) {
      // Remove book from active list
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
      setTotalElements((prev) => Math.max(0, prev - 1));
      showToast('Removed from your wishlist', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-dps-600 fill-dps-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Saved Wishlist ({totalElements})
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Books you've bookmarked for future reference, assignments, and exam preparation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading your saved books..." />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="Your wishlist is empty"
            description="You haven't saved any books yet. Browse the catalog and click the bookmark icon on any book to save it here."
            actionText="Discover Textbooks"
            actionLink="/catalog"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                initialFavorite={true}
                onFavoriteToggle={(bookId, isFav) => handleFavoriteToggled(bookId, isFav)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

