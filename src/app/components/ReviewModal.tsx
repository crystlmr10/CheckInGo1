import { useState } from "react";
import { Star, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewModal({ isOpen, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setRating(0);
    setHoveredRating(0);
    setName("");
    setReview("");
    setError(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase.from("reviews").insert({
      guest_name: name.trim(),
      rating,
      review: review.trim(),
    });

    setIsSubmitting(false);

    if (dbError) {
      setError("Failed to submit. Please try again.");
      return;
    }

    setIsSuccess(true);
    onSubmitted?.();
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              {isSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-500">Your review has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Rate Your Stay</h2>
                    <p className="text-gray-500 text-sm mt-1">Share your experience at CheckInGo</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tap to Rate</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= (hoveredRating || rating)
                                  ? "fill-orange-400 text-orange-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-orange-500 h-5">
                        {rating > 0 ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1] : ""}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Name</label>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Maria Santos"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Review</label>
                        <textarea
                          required
                          rows={4}
                          value={review}
                          onChange={e => setReview(e.target.value)}
                          placeholder="Tell us about your stay..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || rating === 0}
                      className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
