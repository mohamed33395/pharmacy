'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?featured=true&limit=8');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
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
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-surface-500">
        <p>No featured products available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
