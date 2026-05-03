'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'createdAt:desc', labelKey: 'newest' },
  { value: 'price:asc', labelKey: 'priceLow' },
  { value: 'price:desc', labelKey: 'priceHigh' },
  { value: 'soldCount:desc', labelKey: 'popular' },
  { value: 'averageRating:desc', labelKey: 'rating' },
];

export default function ProductsPage() {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const search = searchParams.get('search') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (search) params.set('search', search);

      const [sortField, sortOrder] = sortBy.split(':');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(console.error);
  }, []);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedBrand || minPrice || maxPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{search ? `"${search}"` : t('title')}</h1>
          <p className="text-surface-500 text-sm mt-1">
            {t('showing', { count: pagination.total })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              'btn-secondary text-sm !px-4 !py-2 flex items-center gap-2 lg:hidden',
              filtersOpen && 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" /> {t('filter')}
          </button>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="input-field text-sm !py-2 !pe-8 appearance-none cursor-pointer min-w-[180px]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
              ))}
            </select>
            <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={cn(
          'w-64 shrink-0 space-y-6',
          'hidden lg:block',
          filtersOpen && '!block fixed inset-0 z-50 bg-white dark:bg-surface-900 p-6 lg:relative lg:p-0 lg:bg-transparent overflow-auto'
        )}>
          {filtersOpen && (
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="font-bold text-lg">{t('filter')}</h2>
              <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
            </div>
          )}

          {/* Category filter */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">{t('category')}</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={!selectedCategory}
                  onChange={() => { setSelectedCategory(''); setPage(1); }}
                  className="accent-primary-600"
                />
                {locale === 'ar' ? 'الكل' : 'All'}
              </label>
              {categories.map((cat: any) => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat._id}
                    onChange={() => { setSelectedCategory(cat._id); setPage(1); }}
                    className="accent-primary-600"
                  />
                  {locale === 'ar' ? cat.name.ar : cat.name.en}
                </label>
              ))}
            </div>
          </div>

          {/* Price range filter */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">{t('priceRange')}</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="input-field text-sm !py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="input-field text-sm !py-2"
              />
            </div>
          </div>

          {/* Brand filter */}
          <div className="card p-4">
            <h3 className="font-semibold mb-3">{t('brand')}</h3>
            <input
              type="text"
              placeholder={locale === 'ar' ? 'اسم العلامة التجارية' : 'Brand name'}
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
              className="input-field text-sm !py-2"
            />
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
              <X className="w-4 h-4" /> {t('clearFilters')}
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-surface-200 dark:bg-surface-700 rounded-t-2xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                    <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-surface-500 text-lg">{tc('noResults')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-sm font-medium transition',
                        page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
