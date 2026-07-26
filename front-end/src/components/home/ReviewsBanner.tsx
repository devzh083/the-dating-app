import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Verified User",
    rating: 5,
    text: "The anonymous approach removed all the pressure. When we finally revealed ourselves, we already knew we clicked!",
    time: "2 days ago",
  },
  {
    name: "Verified User",
    rating: 5,
    text: "No more superficial swiping. Here, I connected with someone based on who they really are.",
    time: "5 days ago",
  },
  {
    name: "Verified User",
    rating: 5,
    text: "Finally, a dating app where personality matters first. Found my person in 3 weeks!",
    time: "1 week ago",
  },
];

const ReviewsBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
          <Quote className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Anonymous Success Stories
          </h3>
          <p className="text-sm text-muted-foreground">
            Real connections, privacy protected
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex gap-4"
          >
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-muted-foreground/40" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-foreground">
                  {review.name}
                </span>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                {review.text}
              </p>

              <span className="text-xs text-muted-foreground">
                {review.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-background bg-muted"
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            Join 10K+ happy users
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-bold text-amber-600">4.9</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewsBanner;
