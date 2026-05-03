'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useWishlistStore } from '@/store/wishlist-store';
import ProductCard from '@/components/ui/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const tc = useTranslations('common');
  const locale = useLocale();
  const { items: wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Fetch products by IDs
    Promise.all(
      wishlistIds.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .then((d) => d.product)
          .catch(() => null)
      )
    )
      .then((results) => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  if (!loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{tc('wishlist')}</h1>
        <p className="text-surface-500 mb-6">
          {locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
        </p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          {locale === 'ar' ? 'تسوق الآن' : 'Shop Now'} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">
        {tc('wishlist')} ({products.length})
      </h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square bg-surface-200 dark:bg-surface-700 rounded-t-2xl" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
