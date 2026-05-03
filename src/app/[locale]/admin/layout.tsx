'use client';

import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart,
  Users, BarChart3, ArrowLeft
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isAdmin = (session?.user as any)?.role === 'admin';

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">{locale === 'ar' ? 'غير مصرح' : 'Unauthorized'}</h1>
        <p className="text-surface-500 mb-6">{locale === 'ar' ? 'ليس لديك صلاحية الوصول لهذه الصفحة' : 'You do not have access to this page'}</p>
        <Link href="/" className="btn-primary">{tc('home')}</Link>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/users', label: t('users'), icon: Users },
  ];

  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-surface-900 border-e border-surface-200 dark:border-surface-700 shrink-0 hidden lg:block">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> {locale === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
          </Link>
          <h2 className="font-bold text-lg mb-4">{t('dashboard')}</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 start-0 end-0 z-40 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition',
                isActive ? 'text-primary-600' : 'text-surface-400'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
