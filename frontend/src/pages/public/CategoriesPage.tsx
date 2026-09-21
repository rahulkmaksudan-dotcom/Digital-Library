import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, BookOpen } from 'lucide-react';
import { Category } from '../../types';
import { categoryService } from '../../api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-dps-50 px-2.5 py-1 rounded-md">
          Academic Disciplines
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Subject Categories & Departments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore specialized engineering divisions, basic sciences, and management literature.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/books?categoryId=${cat.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-dps-50 text-dps-600 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {cat.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-dps-600 transition leading-snug">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">
                  {cat.description || 'Core engineering subject area offering textbooks and academic materials.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-dps-600">
                <span>View catalog books</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

