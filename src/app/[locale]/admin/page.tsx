'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t('totalRevenue'),
      value: formatPrice(analytics?.stats?.totalRevenue || 0, locale),
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    },
    {
      title: t('totalOrders'),
      value: analytics?.stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    },
    {
      title: t('totalProducts'),
      value: analytics?.stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    },
    {
      title: t('totalUsers'),
      value: analytics?.stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-500">{stat.title}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> {t('recentOrders')}
          </h2>
          {analytics?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentOrders.map((order: any) => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-surface-500">
                      {order.user?.name} • {format(new Date(order.createdAt), 'MMM d')}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-sm text-primary-600">{formatPrice(order.total, locale)}</p>
                    <span className={`badge text-[10px] ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-4">No orders yet</p>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> {t('topProducts')}
          </h2>
          {analytics?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {analytics.topProducts.map((product: any, i: number) => (
                <div key={product._id} className="flex items-center gap-3 py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                  <span className="w-6 h-6 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {locale === 'ar' ? product.name?.ar : product.name?.en}
                    </p>
                    <p className="text-xs text-surface-500">{product.soldCount} sold</p>
                  </div>
                  <span className="font-bold text-sm">{formatPrice(product.price, locale)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-surface-500 text-sm text-center py-4">No products yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
