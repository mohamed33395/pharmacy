'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const tc = useTranslations('common');
  const t = useTranslations('home');
  const locale = useLocale();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{tc('categories')}</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse p-6">
              <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-2xl mx-auto mb-3" />
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-surface-500">
          <p>{tc('noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/products?category=${cat._id}`}
              className="card-hover p-6 flex flex-col items-center text-center group"
            >
              {cat.image ? (
                <img src={cat.image} alt="" className="w-20 h-20 object-cover rounded-2xl mb-3" />
              ) : (
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-3 text-3xl">
                  {cat.icon || '💊'}
                </div>
              )}
              <h3 className="font-semibold mb-1">
                {locale === 'ar' ? cat.name.ar : cat.name.en}
              </h3>
              {cat.description && (
                <p className="text-xs text-surface-500 line-clamp-2">
                  {locale === 'ar' ? cat.description.ar : cat.description.en}
                </p>
              )}
              <span className="mt-2 text-primary-600 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {tc('viewAll')} <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
