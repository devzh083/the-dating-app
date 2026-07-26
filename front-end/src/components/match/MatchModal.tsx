import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface MatchModalProps {
  profile: SwipeProfile;
  chatId: string;  // ✅ Added chatId prop
  onComplete: () => void;
  pendingMatchId?: string | null;
}

const MatchModal = ({ profile, chatId, onComplete }: MatchModalProps) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white rounded-3xl p-8 w-[360px] text-center shadow-2xl relative overflow-hidden max-h-[90vh] mx-4"
        >
          {/* Animated Heart Background */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1.4, rotate: 10 }}
          >
            <Heart className="w-48 h-48 text-pink-500 opacity-20 fill-pink-500" />
          </motion.div>

          {/* Profile Preview */}
          <div className="relative z-10 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <div className="text-white font-bold text-xl">
                {profile.firstName.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              It’s a Match! 🎉
            </h2>
            <p className="text-gray-600 text-sm md:text-base mb-2">
              You and <span className="font-semibold text-gray-900">{profile.firstName}</span> have liked each other
            </p>
            {profile.selfDescription && (
              <p className="text-gray-500 text-xs italic bg-gray-50 px-3 py-1 rounded-full mx-auto max-w-[280px]">
                "{profile.selfDescription}"
              </p>
            )}
          </div>

          {/* Quick Profile Info */}
          {profile.vibeTags.length > 0 && (
            <div className="relative z-10 mb-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
              <p className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-2">Vibes</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {profile.vibeTags.slice(0, 4).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/70 backdrop-blur-sm text-xs rounded-full border border-pink-200 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Start Chat Button */}
          <button
            onClick={onComplete}
            className="relative z-10 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transform transition-all duration-200 active:scale-[0.98]"
          >
            <span>Start Chat</span>
            <span className="ml-2 text-xs opacity-90">(Chat)</span>
          </button>

          {/* Optional Close Button */}
          <button
            onClick={onComplete}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors -m-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MatchModal;
