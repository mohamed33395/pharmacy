'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { items, removeItem, updateQuantity, getSubtotal, getShippingCost, getTax, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-surface-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('empty')}</h1>
        <p className="text-surface-500 mb-6">{t('emptyDesc')}</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          {t('continueShopping')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex gap-4">
              <div className="w-24 h-24 bg-surface-100 dark:bg-surface-700 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={item.thumbnail || '/placeholder.png'}
                  alt={locale === 'ar' ? item.nameAr : item.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`} className="font-medium hover:text-primary-600 transition line-clamp-1">
                  {locale === 'ar' ? item.nameAr : item.name}
                </Link>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-primary-600">{formatPrice(item.price, locale)}</span>
                  {item.compareAtPrice && (
                    <span className="text-xs text-surface-400 line-through">{formatPrice(item.compareAtPrice, locale)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-s-lg transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-[36px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-e-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(item.price * item.quantity, locale)}</span>
                    <button
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success(t('itemRemoved'));
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">{t('title')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">{t('subtotal')}</span>
                <span className="font-medium">{formatPrice(getSubtotal(), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">{t('shipping')}</span>
                <span className="font-medium">
                  {getShippingCost() === 0 ? (
                    <span className="text-accent-600">{tc('free')}</span>
                  ) : (
                    formatPrice(getShippingCost(), locale)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">{t('tax')}</span>
                <span className="font-medium">{formatPrice(getTax(), locale)}</span>
              </div>
              <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold">{t('total')}</span>
                  <span className="font-bold text-lg text-primary-600">{formatPrice(getTotal(), locale)}</span>
                </div>
              </div>
            </div>

            {getShippingCost() > 0 && (
              <p className="text-xs text-surface-500 mt-3 text-center">{t('freeShippingNote')}</p>
            )}

            <Link href="/checkout" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              {t('proceedCheckout')} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href="/products" className="btn-secondary w-full mt-2 text-center block">
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
