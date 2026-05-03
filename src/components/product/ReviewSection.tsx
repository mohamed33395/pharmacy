'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Star, User } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const t = useTranslations('products');
  const locale = useLocale();
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return toast.error('Please login to write a review');
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews([data.review, ...reviews]);
      setShowForm(false);
      setTitle('');
      setComment('');
      toast.success(locale === 'ar' ? 'تم إضافة التقييم' : 'Review submitted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Write review button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">{t('reviews')} ({reviews.length})</h3>
        {session && (
          <button onClick={() => setShowForm(!showForm)} className="btn-outline text-sm !px-4 !py-2">
            {t('writeReview')}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={cn('w-6 h-6', star <= rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300')}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder={locale === 'ar' ? 'عنوان التقييم' : 'Review title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-field"
          />
          <textarea
            placeholder={locale === 'ar' ? 'اكتب تقييمك...' : 'Write your review...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className="input-field resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? '...' : locale === 'ar' ? 'إرسال' : 'Submit'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4 mb-2" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-surface-500 py-8">
          {locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review._id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm shrink-0">
                  {review.user?.name ? getInitials(review.user.name) : <User className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.user?.name || 'User'}</span>
                    <span className="text-xs text-surface-400">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn('w-3.5 h-3.5', i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-300')}
                      />
                    ))}
                  </div>
                  <p className="font-medium text-sm mb-1">{review.title}</p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
