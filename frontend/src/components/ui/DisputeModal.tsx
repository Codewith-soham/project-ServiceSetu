import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import paymentApi from '../../services/apiClient';

interface DisputeModalProps {
  isOpen: boolean;
  bookingId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  bookingId,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason || reason.trim().length < 20) {
      toast.error('Dispute reason must be at least 20 characters');
      return;
    }

    try {
      setIsLoading(true);
      await paymentApi.disputeBooking(bookingId, reason);
      toast.success('Dispute registered successfully');
      setReason('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to register dispute');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0F172A] p-8 shadow-2xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">File a Dispute</h2>
            <p className="text-sm text-gray-400 mt-2">
              Let us know why you're rejecting this service completion. Our admin team will review and take appropriate action.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Reason for Dispute
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you're disputing this service completion... (minimum 20 characters)"
                maxLength={500}
                rows={5}
                className="w-full bg-[#1E293B] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters (minimum 20 required)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 h-11 rounded-lg border border-gray-600 bg-transparent text-white font-bold hover:bg-gray-900/50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || reason.trim().length < 20}
                className="flex-1 h-11 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Dispute'
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-500">
              <strong>Note:</strong> False disputes may result in account restrictions. Only submit if there's a genuine issue with the service completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeModal;
