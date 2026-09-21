import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowRight, BookOpen, Globe } from 'lucide-react';
import { Author } from '../../types';
import { authorService } from '../../api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AuthorsPage: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authorService.getAll()
      .then(setAuthors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-dps-50 px-2.5 py-1 rounded-md">
          Authors Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Eminent Authors & Researchers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Distinguished computer scientists, mathematicians, and engineering textbook authors in our catalog.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading authors directory..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((auth) => (
            <Link
              key={auth.id}
              to={`/books?authorId=${auth.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-dps-600 group-hover:text-white transition">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-dps-600 transition">
                      {auth.name}
                    </h3>
                    {auth.nationality && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{auth.nationality}</span>
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                  {auth.biography || 'Distinguished academic author and researcher.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-dps-600">
                <span>View authored titles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

