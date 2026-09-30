import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Trash2,
  MessageSquarePlus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { reviewsApi } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { Review } from '@/types';

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional (5/5)',
  4: 'Very Good (4/5)',
  3: 'Average (3/5)',
  2: 'Below Expectations (2/5)',
  1: 'Poor (1/5)',
};

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: reviewSummary, isLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: () => reviewsApi.getByProductId(productId),
  });

  const submitReviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.addOrUpdate(productId, {
        rating,
        title: title.trim(),
        comment: comment.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setTitle('');
      setComment('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to submit review.');
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const reviews = reviewSummary?.reviews || [];
  const totalReviews = reviewSummary?.totalReviews || reviews.length;
  const avgRating = reviewSummary?.averageRating || 5.0;
  const distribution = reviewSummary?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Filter & sort logic
  const filteredReviews = reviews
    .filter((r) => (filterRating === null ? true : r.rating === filterRating))
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a review headline.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Please write your review feedback.');
      return;
    }
    setFormError(null);
    submitReviewMutation.mutate();
  };

  const userExistingReview = user ? reviews.find((r) => r.userId === user.id) : null;

  const handleOpenForm = () => {
    if (userExistingReview) {
      setRating(userExistingReview.rating);
      setTitle(userExistingReview.title);
      setComment(userExistingReview.comment);
    }
    setIsFormOpen(true);
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Feedback</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Ratings & Reviews
          </h2>
        </div>

        <div>
          {isAuthenticated ? (
            <button
              onClick={() => (isFormOpen ? setIsFormOpen(false) : handleOpenForm())}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all flex items-center gap-2 shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>
                {isFormOpen
                  ? 'Cancel'
                  : userExistingReview
                  ? 'Edit Your Review'
                  : 'Write a Review'}
              </span>
            </button>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-2"
            >
              <span>Sign in to Review</span>
            </Link>
          )}
        </div>
      </div>

      {/* Review Form Drawer / Panel */}
      {isFormOpen && (
        <div className="mb-10 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-all shadow-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {userExistingReview ? 'Update your review' : `Reviewing ${productName}`}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Share your authentic testing, thermal performance, or daily driver experience.
          </p>

          {reviewSummary?.isVerifiedBuyer && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Buyer: Your review will feature a Verified Purchase badge!</span>
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating !== null ? hoverRating : rating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= activeRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">
                  {RATING_LABELS[hoverRating !== null ? hoverRating : rating]}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Exceptional build quality, runs completely silent"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                maxLength={150}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Detailed Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did you like or dislike? How does it compare to your expectations?"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                maxLength={2000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {submitReviewMutation.isPending ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ratings Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/70 dark:bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 mb-10">
        {/* Left: Big Score */}
        <div className="lg:col-span-4 text-center lg:text-left flex flex-col justify-center items-center lg:items-start lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:pr-8">
          <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
            {avgRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 text-amber-400 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(avgRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
          <div className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>98% of customers recommend this hardware</span>
          </div>
        </div>

        {/* Right: Breakdown Progress Bars */}
        <div className="lg:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((starLevel) => {
            const count = distribution[starLevel] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const isSelected = filterRating === starLevel;

            return (
              <button
                key={starLevel}
                onClick={() => setFilterRating(isSelected ? null : starLevel)}
                className={`w-full group flex items-center gap-3 p-1.5 rounded-xl transition-colors text-left ${
                  isSelected
                    ? 'bg-amber-100/60 dark:bg-amber-950/30'
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-1 w-14 flex-shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{starLevel}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 group-hover:bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="w-12 text-right text-xs font-semibold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  {count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterRating === null
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setFilterRating(filterRating === s ? null : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                filterRating === s
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{s}★</span>
              <span>({distribution[s] || 0})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="newest" className="dark:bg-slate-900">
              Most Recent
            </option>
            <option value="highest" className="dark:bg-slate-900">
              Highest Rating
            </option>
            <option value="lowest" className="dark:bg-slate-900">
              Lowest Rating
            </option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
          <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Star className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No reviews match this filter
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Be the first customer to write a review with this star rating!
          </p>
          {filterRating !== null && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isAuthor = user && user.id === review.userId;
            const canDelete = isAuthor || isAdmin;

            return (
              <div
                key={review.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {review.userAvatar || review.userName.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {review.userName}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Purchase</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars + Delete button */}
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this review?')) {
                            deleteReviewMutation.mutate(review.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                  {review.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
