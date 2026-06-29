import React, { useEffect, useState } from 'react';
import { Send, Star, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { reviewApi } from '../../services/apiClient';

type ReviewModalProps = {
  isOpen: boolean;
  providerId: string;
  bookingId: string;
  providerName: string;
  onClose: () => void;
  onSuccess: () => void;
};

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  providerId,
  bookingId,
  providerName,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment('');
      setSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!providerId || !bookingId) {
      setError('Invalid booking details for review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await reviewApi.addReview(providerId, bookingId, rating, comment.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold">Rate Provider</h3>
            <p className="text-[#9CA3AF] text-sm mt-1">Share your experience with {providerName || 'this provider'}.</p>
          </div>
          <button
            type="button"
            className="text-[#9CA3AF] hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close review modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submitReview} className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Your Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={28}
                    className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-[#4B5563]'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Review (optional)</p>
            <textarea
              className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              rows={4}
              maxLength={500}
              placeholder="Tell others about your experience"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
              <Send size={16} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReviewModal;
