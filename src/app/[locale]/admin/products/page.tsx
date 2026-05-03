'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { formatPrice, cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || { pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(locale === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('products')}</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> {t('addProduct')}
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          placeholder={tc('search')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field !ps-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Product</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Price</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Stock</th>
                <th className="text-start px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                <th className="text-end px-4 py-3 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                    <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 animate-pulse ms-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-surface-500">{tc('noResults')}</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-100 dark:bg-surface-700 rounded-lg overflow-hidden shrink-0">
                          <Image src={product.thumbnail || '/placeholder.png'} alt="" width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{locale === 'ar' ? product.name.ar : product.name.en}</p>
                          <p className="text-xs text-surface-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-sm">{formatPrice(product.price, locale)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge text-xs', product.stock <= product.lowStockThreshold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge text-xs', product.isActive ? 'bg-green-100 text-green-600' : 'bg-surface-200 text-surface-500')}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product._id}`} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition',
                page === i + 1 ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
