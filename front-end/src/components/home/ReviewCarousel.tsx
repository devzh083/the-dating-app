import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader, X, Calendar } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';

interface Review {
  id: number;
  rating: number;
  text: string;
  created_at: string;
}

const ReviewCard = ({ 
  review, 
  onClick 
}: { 
  review: Review;
  onClick: () => void;
}) => {
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div 
      onClick={onClick}
      className="flex-shrink-0 w-[280px] md:w-80 p-5 md:p-6 mx-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-teal-200 transition-all duration-200 active:scale-95"
    >
      <div className="flex items-center mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm">
          ❤️
        </div>
        <div className="ml-3">
          <h4 className="font-bold text-gray-900 text-xs md:text-sm">Verified User</h4>
          <span className="text-[9px] uppercase tracking-wider text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
            Success Story
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-xs md:text-sm leading-relaxed italic line-clamp-3">
        "{review.text}"
      </p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex text-yellow-400 text-xs gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating ? 'fill-yellow-400' : 'fill-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {getTimeAgo(review.created_at)}
        </span>
      </div>
      <p className="text-[10px] text-teal-600 font-medium mt-2 text-center">Click to read full story</p>
    </div>
  );
};

const ReviewModal = ({ 
  review, 
  onClose 
}: { 
  review: Review;
  onClose: () => void;
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
              ❤️
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Success Story</h2>
              <p className="text-sm text-white/80">Verified User</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Rating */}
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < review.rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Story Text */}
          <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-2xl p-6 md:p-8 relative">
            <Quote className="absolute top-4 right-4 w-12 h-12 text-teal-200/50" />
            <p className="text-gray-700 text-base md:text-lg leading-relaxed relative z-10 italic">
              "{review.text}"
            </p>
          </div>

          {/* Date Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Shared on {formatDate(review.created_at)}</span>
          </div>

          {/* Footer Message */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-center">
            <p className="text-sm text-teal-800 font-medium">
              💚 Thank you for sharing your story with our community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reviews/approved/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      // Handle both paginated and direct array responses
      const reviewsData = data.results || data;
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Don't show the section if there are no reviews
  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-white to-gray-50 rounded-[2rem] p-6 md:p-8 border border-gray-100">
        <div className="text-center">
          <Loader className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading success stories...</p>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return null; // Don't show the section if there's an error or no reviews
  }

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <>
      <div className="w-full bg-gradient-to-b from-white to-gray-50 rounded-[2rem] p-6 md:p-8 border border-gray-100 overflow-hidden relative group">
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Quote className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Success Stories</h2>
          </div>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            Real stories from our community • Click to read more
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden mask-linear-fade">
          <div className="absolute top-0 bottom-0 left-0 w-8 md:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-8 md:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

          <div className="flex animate-scroll w-max">
            {duplicatedReviews.map((review, index) => (
              <ReviewCard 
                key={`${review.id}-${index}`} 
                review={review}
                onClick={() => setSelectedReview(review)}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
          .group:hover .animate-scroll {
            animation-play-state: paused;
          }
        `}</style>
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <ReviewModal 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
        />
      )}
    </>
  );
}