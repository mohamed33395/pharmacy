'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { User, MapPin, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!session) return;
    fetch('/api/users/profile')
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.user);
        setName(d.user?.name || '');
        setPhone(d.user?.phone || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Link href="/auth/login" className="btn-primary">{tc('login')}</Link>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const body: any = { name, phone };
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.user);
      setCurrentPassword('');
      setNewPassword('');
      toast.success(locale === 'ar' ? 'تم حفظ التغييرات' : 'Changes saved');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'personal', label: t('personalInfo'), icon: User },
    { key: 'password', label: t('changePassword'), icon: Lock },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition',
                  activeTab === tab.key
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="card p-8 animate-pulse space-y-4">
              <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
              <div className="h-10 bg-surface-200 dark:bg-surface-700 rounded" />
            </div>
          ) : activeTab === 'personal' ? (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-lg">{t('personalInfo')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{locale === 'ar' ? 'الاسم' : 'Name'}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input type="email" value={profile?.email || ''} disabled className="input-field opacity-60" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{locale === 'ar' ? 'الهاتف' : 'Phone'}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {tc('save')}
              </button>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-lg">{t('changePassword')}</h2>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('currentPassword')}</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('newPassword')}</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {tc('save')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
