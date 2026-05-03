'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { formatPrice, cn } from '@/lib/utils';
import { ChevronLeft, Package, CheckCircle2, Truck, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('orders');
  const tc = useTranslations('common');
  const tCart = useTranslations('cart');
  const locale = useLocale();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/3 mb-8" />
        <div className="h-40 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-surface-500 mb-4">Order not found</p>
        <Link href="/orders" className="btn-primary">{tc('back')}</Link>
      </div>
    );
  }

  const currentStep = steps.indexOf(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-primary-600 mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> {tc('back')}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('orderNumber')}{order.orderNumber}</h1>
          <p className="text-sm text-surface-500">{format(new Date(order.createdAt), 'MMMM d, yyyy - HH:mm')}</p>
        </div>
      </div>

      {/* Order Tracking */}
      {order.status !== 'cancelled' && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold mb-6">{t('tracking')}</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 start-0 end-0 h-0.5 bg-surface-200 dark:bg-surface-700" />
            <div
              className="absolute top-4 start-0 h-0.5 bg-primary-600 transition-all"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition',
                  i <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                )}>
                  {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  'text-xs mt-2 font-medium',
                  i <= currentStep ? 'text-primary-600' : 'text-surface-400'
                )}>
                  {t(step)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-bold mb-4">{locale === 'ar' ? 'المنتجات' : 'Items'}</h2>
            <div className="space-y-4">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={item.thumbnail || '/placeholder.png'}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-surface-500">x{item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">{formatPrice(item.price * item.quantity, locale)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary + Address */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold mb-4">{locale === 'ar' ? 'ملخص' : 'Summary'}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">{tCart('subtotal')}</span><span>{formatPrice(order.subtotal, locale)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">{tCart('shipping')}</span><span>{order.shippingCost === 0 ? <span className="text-accent-600">{tc('free')}</span> : formatPrice(order.shippingCost, locale)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">{tCart('tax')}</span><span>{formatPrice(order.tax, locale)}</span></div>
              <div className="border-t pt-2"><div className="flex justify-between"><span className="font-bold">{tCart('total')}</span><span className="font-bold text-primary-600">{formatPrice(order.total, locale)}</span></div></div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> {locale === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}</h2>
            <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
