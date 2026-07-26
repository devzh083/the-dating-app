import { Star, Quote, Shield, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";

interface Review {
  id: number;
  username: string;
  rating: number;
  text: string;
  created_at: string;
}

export const AnonymousReviewsBanner = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      // Fetch only approved reviews, limit to 2 for the banner
      const response = await fetch(`${API_BASE_URL}/reviews/approved/?limit=2`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data); // Handle both paginated and direct array responses
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm h-full">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null; // Don't show the section if there are no approved reviews
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
          <Quote className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            Success Stories
          </h3>
          <p className="text-sm text-gray-500">
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * index }}
            className="p-5 rounded-2xl bg-gray-50 border border-gray-100"
          >
            {/* User Info Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 text-sm">Verified User</span>
                  <Shield className="w-3 h-3 text-teal-500 fill-teal-500" />
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${
                      i < review.rating 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-2">"{review.text}"</p>
            <span className="text-xs text-gray-400 font-medium">
              {getTimeAgo(review.created_at)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default AnonymousReviewsBanner;