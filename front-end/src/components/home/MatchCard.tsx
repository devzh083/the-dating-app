import { motion } from "framer-motion";
import { Heart, X, MapPin } from "lucide-react";

interface Match {
  id: string;
  name: string;
  age: number;
  distance: string;
  bio: string;
  photos: string[];
  interests: string[];
}

interface MatchCardProps {
  match: Match;
  onLike: () => void;
  onPass: () => void;
  exitDirection: "left" | "right" | null;
}

export default function MatchCard({ match, onLike, onPass, exitDirection }: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: exitDirection ? 0 : 1,
        scale: exitDirection ? 0.9 : 1,
        x: exitDirection === "left" ? -300 : exitDirection === "right" ? 300 : 0,
        rotate: exitDirection === "left" ? -15 : exitDirection === "right" ? 15 : 0,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-72 bg-card rounded-2xl overflow-hidden shadow-xl border border-border/50"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={match.photos[0]}
          alt={match.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-bold">{match.name}</h3>
            <span className="text-lg opacity-90">{match.age}</span>
          </div>

          <div className="flex items-center gap-1 text-xs opacity-90 mb-2">
            <MapPin className="w-3 h-3" />
            <span>{match.distance}</span>
          </div>

          <p className="text-xs opacity-90 line-clamp-2 mb-2">{match.bio}</p>

          <div className="flex flex-wrap gap-1">
            {match.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-3 bg-background">
        <button
          onClick={onPass}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center transition-all hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={onLike}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-end text-primary-foreground flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-primary/30"
        >
          <Heart className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}
