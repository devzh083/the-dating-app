import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, Sparkles, Target, MessageCircle, Heart, Star, Zap, Users, TrendingUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

const ICON_MAP: { [key: string]: any } = {
  'message-circle': MessageCircle,
  'target': Target,
  'sparkles': Sparkles,
  'lightbulb': Lightbulb,
  'heart': Heart,
  'star': Star,
  'zap': Zap,
  'users': Users,
  'trending-up': TrendingUp,
};

interface ExpertTip {
  id: number;
  name: string;
  role: string;
  image: string;
  tip: string;
  icon: string;
  icon_color: string;
  bg_color: string;
}

export default function ExpertTipsBanner() {
  const [experts, setExperts] = useState<ExpertTip[]>([]);
  const [allExperts, setAllExperts] = useState<ExpertTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTips, setShowAllTips] = useState(false);
  const [selectedTip, setSelectedTip] = useState<ExpertTip | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExpertTips();
  }, []);

  useEffect(() => {
    checkScrollButtons();
  }, [experts]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedTip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTip]);

  const fetchExpertTips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expert-tips/?limit=3`);
      if (response.ok) {
        const data = await response.json();
        setExperts(data);
      }
    } catch (error) {
      console.error('Error fetching expert tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllExpertTips = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expert-tips/`);
      if (response.ok) {
        const data = await response.json();
        setAllExperts(data);
        setShowAllTips(true);
      }
    } catch (error) {
      console.error('Error fetching all expert tips:', error);
    }
  };

  const handleViewAll = () => {
    if (showAllTips) {
      setShowAllTips(false);
    } else {
      fetchAllExpertTips();
    }
  };

  const handleTipClick = (tip: ExpertTip) => {
    setSelectedTip(tip);
  };

  const handleCloseModal = () => {
    setSelectedTip(null);
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expert tips...</div>;
  }

  if (experts.length === 0) {
    return null;
  }

  const displayedExperts = showAllTips ? allExperts : experts;

  const TipCard = ({ expert, onClick }: { expert: ExpertTip; onClick?: () => void }) => {
    const IconComponent = ICON_MAP[expert.icon] || Lightbulb;
    return (
      <div
        onClick={onClick}
        className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all flex-shrink-0 ${
          !showAllTips ? 'w-[280px] sm:w-[320px]' : ''
        } ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      >
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4"
          style={{ backgroundColor: expert.bg_color }}
        >
          <IconComponent
            className="w-5 h-5 sm:w-6 sm:h-6"
            style={{ color: expert.icon_color }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <img
            src={expert.image}
            alt={expert.name}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Expert';
            }}
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{expert.name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{expert.role}</p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-700 italic line-clamp-3">"{expert.tip}"</p>
      </div>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              Expert Tips
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Maximize match potential</p>
          </div>
          <button 
            onClick={handleViewAll}
            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 transition-colors text-sm sm:text-base self-start sm:self-auto"
          >
            {showAllTips ? 'View less ←' : 'View all →'}
          </button>
        </div>

        {showAllTips ? (
          // Grid view when showing all tips
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {displayedExperts.map((expert) => (
              <TipCard key={expert.id} expert={expert} onClick={() => handleTipClick(expert)} />
            ))}
          </div>
        ) : (
          // Scrollable horizontal view
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {displayedExperts.map((expert) => (
                <TipCard key={expert.id} expert={expert} onClick={() => handleTipClick(expert)} />
              ))}
            </div>

            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal for individual tip detail */}
      {selectedTip && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-purple-600 w-6 h-6" />
                Expert Tip
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {(() => {
                const IconComponent = ICON_MAP[selectedTip.icon] || Lightbulb;
                return (
                  <>
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                      style={{ backgroundColor: selectedTip.bg_color }}
                    >
                      <IconComponent
                        className="w-8 h-8"
                        style={{ color: selectedTip.icon_color }}
                      />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={selectedTip.image}
                        alt={selectedTip.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Expert';
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedTip.name}</h3>
                        <p className="text-base text-gray-500">{selectedTip.role}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                      <p className="text-lg text-gray-700 italic leading-relaxed">"{selectedTip.tip}"</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}