import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book as BookType } from '../types';
import { Bookmark, BookOpen, Layers, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { favoriteService } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface BookCardProps {
  book: BookType;
  initialFavorite?: boolean;
  onFavoriteToggle?: (bookId: number, isFav: boolean) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, initialFavorite = false, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loadingFav, setLoadingFav] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error, info } = useToast();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      info('Please sign in to add books to your wishlist.');
      return;
    }

    setLoadingFav(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(book.id);
        setIsFavorite(false);
        success(`Removed "${book.title}" from favorites`);
        onFavoriteToggle?.(book.id, false);
      } else {
        await favoriteService.addFavorite(book.id);
        setIsFavorite(true);
        success(`Added "${book.title}" to favorites`);
        onFavoriteToggle?.(book.id, true);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update favorites');
    } finally {
      setLoadingFav(false);
    }
  };

  const isAvailable = book.availableCopies > 0 && book.status === 'AVAILABLE';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Cover Image container */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
            <span className="text-xs font-semibold text-slate-500 line-clamp-2">{book.title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {book.categoryName && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 text-white rounded-lg backdrop-blur-md">
              {book.categoryName.split(' ')[0]}
            </span>
          )}
          <button
            onClick={handleFavoriteClick}
            disabled={loadingFav}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white shadow-sm'
            }`}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Availability Pill */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-500/90 text-white shadow-sm'
                : 'bg-rose-600/90 text-white shadow-sm'
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>{book.availableCopies} Available</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>Unavailable</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Book Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-500 mb-1 truncate">
            {book.authorName}
          </p>
          <Link to={`/books/${book.id}`} className="block group/link">
            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover/link:text-dps-600 transition">
              {book.title}
            </h3>
          </Link>
          {book.subtitle && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{book.subtitle}</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{book.shelfNumber || 'Desk'}</span>
          </div>

          <Link
            to={`/books/${book.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-dps-600 hover:text-dps-700 transition"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

