import { MessageCircle, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymousProfile {
  id: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
  firstName?: string; 
}

interface AnonymousProfileCardProps {
  profile?: AnonymousProfile;
}

/* ---------- ANIMATED AVATAR ---------- */
const avatarVariants = [
  "from-violet-500 to-fuchsia-600",
  "from-cyan-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-rose-500 to-pink-600",
];

const AnimatedAvatar = ({ index }: { index: number }) => {
  const safeIndex = (typeof index === 'number' && !isNaN(index)) ? index : 0;
  const gradient = avatarVariants[safeIndex % avatarVariants.length] || avatarVariants[0];

  return (
    <div className="relative group">
      <div className={cn(
        "absolute inset-0 rounded-[2.5rem] bg-gradient-to-br blur-2xl opacity-40 animate-pulse", 
        gradient
      )} />
      
      {/* Mobile: Smaller size (w-28) | Desktop: Original size (w-36) */}
      <div className={cn(
        "relative h-28 w-28 md:h-36 md:w-36 rounded-[2.5rem] bg-gradient-to-br shadow-2xl flex items-center justify-center transform transition-transform duration-700 group-hover:scale-105",
        gradient
      )}>
        <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] backdrop-blur-[1px]" />
        <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white/90 drop-shadow-md" />

        <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 bg-white px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg border border-gray-100">
           <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
           </span>
           <span className="text-[10px] md:text-xs font-bold text-gray-700">Online</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- MAIN CARD ---------- */
const AnonymousProfileCard = ({ profile }: AnonymousProfileCardProps) => {
  if (!profile) return null;

  const { 
    id = "0", 
    selfDescription = "No description available.", 
    vibeTags = [], 
    conversationHook = "...",
    firstName = "Anonymous" 
  } = profile;

  const colorIndex = id.length;

  return (
    // Outer Container: Flex Col on Mobile, Block on Desktop
    <div className="relative w-full h-full bg-white rounded-[2.5rem] md:rounded-[40px] shadow-xl shadow-gray-200/50 border border-white overflow-hidden p-6 md:p-8 select-none flex flex-col md:block">
      
      {/* Grid Layout: Stacked on Mobile, 12-col Grid on Desktop */}
      <div className="h-full flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Identity */}
        <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-50 pb-4 md:pb-0 md:pr-4 md:col-span-4 shrink-0">
          <div className="mb-4 md:mb-6">
            <AnimatedAvatar index={colorIndex} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {firstName}
            </h3>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 md:mt-2">
              Based on vibes
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Content */}
        <div className="flex flex-col h-full md:col-span-8 min-h-0 justify-between">
          
          <div className="flex-1 flex flex-col justify-center overflow-y-auto scrollbar-hide space-y-4">
            {/* Bio */}
            <div className="relative pl-4 md:pl-6">
              <Quote className="absolute -top-1 md:-top-2 left-0 w-4 h-4 md:w-6 md:h-6 text-gray-200 transform -scale-x-100" />
              <p className="text-gray-700 text-sm md:text-lg font-medium leading-relaxed italic pr-2">
                {selfDescription}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pl-1">
              {vibeTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 text-[10px] md:text-xs font-bold uppercase tracking-wide whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Starter - Compact on mobile, standard on desktop */}
          <div className="mt-4 md:mt-auto bg-gradient-to-r from-teal-50/80 to-emerald-50/80 rounded-2xl p-4 md:p-5 border border-teal-100 flex items-center gap-3 md:gap-4 shrink-0">
            <div className="p-1.5 md:p-2 bg-white rounded-full shadow-sm shrink-0 text-teal-600">
               <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[9px] md:text-[10px] font-extrabold text-teal-600 uppercase tracking-wider mb-0.5 md:mb-1">
                Conversation Starter
              </span>
              <p className="text-teal-900 text-xs md:text-sm font-bold leading-snug truncate">
                "{conversationHook}"
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnonymousProfileCard;