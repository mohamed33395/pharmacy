'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, cn } from '@/lib/utils';
import { CreditCard, Wallet, Banknote, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tc = useTranslations('common');
  const tCart = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getSubtotal, getShippingCost, getTax, getTotal, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'cod'>('cod');
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Saudi Arabia',
  });

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{tc('login')}</h1>
        <p className="text-surface-500 mb-6">
          {locale === 'ar' ? 'يرجى تسجيل الدخول لإتمام الطلب' : 'Please login to complete your order'}
        </p>
        <Link href="/auth/login" className="btn-primary inline-block">{tc('login')}</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{tCart('empty')}</h1>
        <Link href="/products" className="btn-primary inline-block">{tCart('continueShopping')}</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return toast.error(locale === 'ar' ? 'يرجى ملء جميع حقول العنوان' : 'Please fill in all address fields');
    }

    setProcessing(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: address,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (paymentMethod === 'stripe') {
        // Create Stripe payment intent
        const stripeRes = await fetch('/api/payments/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: getTotal(), orderId: data.order._id }),
        });
        const stripeData = await stripeRes.json();
        if (!stripeRes.ok) throw new Error(stripeData.error);
        // In production, redirect to Stripe checkout
        toast.success(locale === 'ar' ? 'تم إنشاء الطلب - سيتم توجيهك للدفع' : 'Order created - redirecting to payment');
      }

      clearCart();
      toast.success(locale === 'ar' ? 'تم تأكيد الطلب بنجاح!' : 'Order placed successfully!');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const paymentOptions = [
    { value: 'cod' as const, label: t('cod'), icon: Banknote, desc: locale === 'ar' ? 'ادفع عند الاستلام' : 'Pay when you receive' },
    { value: 'stripe' as const, label: t('stripe'), icon: CreditCard, desc: 'Visa, Mastercard, mada' },
    { value: 'paypal' as const, label: t('paypal'), icon: Wallet, desc: 'PayPal' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">{t('shippingInfo')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1 block">{t('street')}</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('city')}</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('state')}</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('zipCode')}</label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('country')}</label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-4">{t('paymentMethod')}</h2>
            <div className="space-y-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition',
                    paymentMethod === opt.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="accent-primary-600"
                  />
                  <opt.icon className="w-5 h-5 text-surface-600" />
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-surface-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-4">{t('orderSummary')}</h2>

            {/* Items preview */}
            <div className="space-y-3 mb-4 max-h-60 overflow-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-lg overflow-hidden shrink-0">
                    <Image src={item.thumbnail || '/placeholder.png'} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{locale === 'ar' ? item.nameAr : item.name}</p>
                    <p className="text-xs text-surface-500">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity, locale)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">{tCart('subtotal')}</span>
                <span>{formatPrice(getSubtotal(), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">{tCart('shipping')}</span>
                <span>{getShippingCost() === 0 ? <span className="text-accent-600">{tc('free')}</span> : formatPrice(getShippingCost(), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">{tCart('tax')}</span>
                <span>{formatPrice(getTax(), locale)}</span>
              </div>
              <div className="border-t border-surface-200 dark:border-surface-700 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold">{tCart('total')}</span>
                  <span className="font-bold text-lg text-primary-600">{formatPrice(getTotal(), locale)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t('processing')}</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> {t('placeOrder')}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
