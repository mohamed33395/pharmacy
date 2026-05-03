'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { formatPrice, cn } from '@/lib/utils';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', icon: Clock },
  confirmed: { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', icon: CheckCircle2 },
  processing: { color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', icon: Package },
  shipped: { color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', icon: Truck },
  delivered: { color: 'text-green-600 bg-green-50 dark:bg-green-900/20', icon: CheckCircle2 },
  cancelled: { color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: XCircle },
};

export default function OrdersPage() {
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-surface-500 mb-4">{locale === 'ar' ? 'يرجى تسجيل الدخول' : 'Please login'}</p>
        <Link href="/auth/login" className="btn-primary">{tc('login')}</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">{t('title')}</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-3" />
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('empty')}</h1>
        <p className="text-surface-500 mb-6">{t('emptyDesc')}</p>
        <Link href="/products" className="btn-primary">{locale === 'ar' ? 'تسوق الآن' : 'Shop Now'}</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>
      <div className="space-y-4">
        {orders.map((order: any) => {
          const config = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = config.icon;

          return (
            <Link key={order._id} href={`/orders/${order._id}`} className="card p-5 flex items-center gap-4 hover:shadow-md transition group">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.color)}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{t('orderNumber')}{order.orderNumber}</span>
                  <span className={cn('badge text-xs', config.color)}>{t(order.status)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span>{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                  <span>{order.items.length} {locale === 'ar' ? 'منتجات' : 'items'}</span>
                </div>
              </div>
              <span className="font-bold text-primary-600">{formatPrice(order.total, locale)}</span>
              <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-primary-600 transition" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
