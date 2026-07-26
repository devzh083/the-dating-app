import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Heart, Send, PenLine, Crown, ArrowRight, Lock, RotateCw } from "lucide-react"; 

/* ---------------- COMPONENTS ---------------- */
import TopBar from "@/components/layout/TopBar";
import NearbyBanner from "@/components/home/NearbyBanner";
import PremiumBanner from "@/components/home/PremiumBanner";
import AnonymousSwipeDeck from "@/components/home/AnonymousSwipeDeck";
import ReviewCarousel from "@/components/home/ReviewCarousel";
import SecurityBanner from "@/components/home/SecurityBanner";
import ProfileCompletion from "@/components/home/ProfileCompletion";
import ExpertTipsBanner from "@/components/home/ExpertTipsBanner";
import MatchModal from "@/components/match/MatchModal";
import Footer from "@/components/layout/Footer"; 

/* ---------------- SERVICES & TYPES ---------------- */
import { profileService } from "@/services/profileService";
import { OnboardingData } from "@/components/onboarding/OnboardingFlow";
import { API_BASE_URL, WS_ORIGIN } from "@/lib/config";

interface ExtendedOnboardingData extends OnboardingData {
  isPremium: boolean;
}


interface MatchApiResponse {
  similarity: number;
  profile: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    bio?: string;
    conversation_starter?: string;
    interests: string[];
  };
}

export interface SwipeProfile {
  id: string;
  firstName: string;
  selfDescription: string;
  vibeTags: string[];
  conversationHook: string;
}

interface HomePageProps {
  onLogout?: () => void;
}

/* ---------------- UTILS ---------------- */
const getRandomInterests = (interests: string[], count = 4) => {
  const shuffled = [...interests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, interests.length));
};

// --- THEME CONSTANT ---
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";

/* ================= HOME PAGE ================= */

const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate = useNavigate();

  /* -------- STATE -------- */
  const [profiles, setProfiles] = useState<SwipeProfile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stores full user profile data
  const [userProfile, setUserProfile] = useState<ExtendedOnboardingData | null>(null);

  // Story Submission State
  const [storyText, setStoryText] = useState("");
  const [submittingStory, setSubmittingStory] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Match Modal State
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchProfile, setMatchProfile] = useState<SwipeProfile | null>(null);
  const [matchChatId, setMatchChatId] = useState<string | null>(null);

  // Constants
  const MAX_STORY_LENGTH = 500;

  /* -------- 1. FETCH USER PROFILE -------- */
  const fetchUserProfile = async () => {
  try {
    setLoadingProfile(true);

    const result = await profileService.getProfile();

    if (result.exists && result.data) {
      console.log("👤 USER PROFILE LOADED:", result.data);

      const normalizedProfile: ExtendedOnboardingData = {
        ...result.data,
        // ⛔ premium is NOT in OnboardingData, extract safely
        isPremium: Boolean((result as any)?.data?.premium),
      };

      setUserProfile(normalizedProfile);
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  } finally {
    setLoadingProfile(false);
  }
};


  useEffect(() => {
    fetchUserProfile();
  }, []);

  const gender = userProfile?.gender?.toLowerCase() || "";
  const isMale = ["male", "man", "m"].includes(gender);
  const isFemale = ["female", "woman", "f"].includes(gender);

  const isPremium = userProfile?.isPremium === true;

  const isPaywalled =
    !loadingProfile && userProfile !== null && isMale && !isPremium;


  
  /* -------- 2. FETCH MATCHES -------- */
   useEffect(() => {
    if (loadingProfile) return;

    if (isPaywalled) {
      setLoadingMatches(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No access token");

        const res = await fetch(`${API_BASE_URL}/matches/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch matches");

        const data: MatchApiResponse[] = await res.json();

        setProfiles(
          data.map((item) => ({
            id: item.profile.email || item.profile.username,
            firstName: item.profile.first_name,
            selfDescription:
              item.profile.bio ||
              item.profile.first_name ||
              "No description available",
            conversationHook:
              item.profile.conversation_starter ||
              "Tell me about yourself!",
            vibeTags: getRandomInterests(item.profile.interests),
          }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [loadingProfile, isPaywalled]);

  /* -------- 3. WEBSOCKET REALTIME -------- */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `${WS_ORIGIN}/ws/notifications/?token=${token}`
    );

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "MATCH_CREATED") {
        if (showMatchModal) return;

        const otherEmail = data.other;
        const chatId = String(data.chat_id);

        if (!otherEmail) return;

        // Open modal immediately
        setMatchChatId(chatId);
        setShowMatchModal(true);
        toast.success("It's a match! 🎉");

        // Fetch profile async
        try {
          const res = await fetch(
            `${API_BASE_URL}/profile/${encodeURIComponent(
              otherEmail
            )}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) return;

          const profile = await res.json();

          setMatchProfile({
            id: otherEmail,
            firstName: profile.first_name,
            selfDescription: profile.bio || "New Match!",
            conversationHook:
              profile.conversation_starter || "Say hello!",
            vibeTags: profile.interests || [],
          });
        } catch {}
      }
    };

    return () => ws.close();
  }, [showMatchModal]);

  /* -------- LIKE HANDLER -------- */
const handleLike = async (toEmail: string) => {
  // Optimistic UI update
  const likedProfile = profiles.find((p) => p.id === toEmail);
  setProfiles((prev) => prev.filter((p) => p.id !== toEmail));

  try {
    const token = localStorage.getItem("access_token");
    const fromEmail = localStorage.getItem("user_email");

    if (!token || !fromEmail) {
      toast.error("Authentication required");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/like/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_email: fromEmail, // ✅ explicitly sent
        to_email: toEmail,     // ✅ required by backend
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Like request failed");
    }

    // -------------------------
    // MATCH CREATED
    // -------------------------
    if (data.status === "matched") {
      if (!showMatchModal) {
        setMatchChatId(String(data.chat_id));
        setShowMatchModal(true);

        if (likedProfile) {
          setMatchProfile(likedProfile);
        }

        toast.success("It's a match! 🎉");
      }
      return;
    }

    // -------------------------
    // LIKE SENT (NO MATCH)
    // -------------------------
    if (data.status === "liked") {
      toast.success("Like sent ❤️");
      return;
    }

    toast.error("Unexpected server response");
  } catch (err: any) {
    console.error("Like error:", err);
    toast.error(err.message || "Failed to like profile");
  }
};

  const handleDislike = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
  };

  const handleMatchComplete = () => {
    setShowMatchModal(false);
    setMatchProfile(null);
    setMatchChatId(null);
    navigate("/chats");
  };

  const handleSubmitStory = async () => {
    if (!storyText.trim()) return toast.error("Please write your story first!");
    if (storyText.trim().length < 50) return toast.error("Please write at least 50 characters");

    setSubmittingStory(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return toast.error("Please sign in");

      const res = await fetch(`${API_BASE_URL}/reviews/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: storyText.trim(), rating: 5 }),
      });

      if (!res.ok) throw new Error("Submission failed");

      toast.success("Story submitted for approval! Thank you ❤️", { duration: 4000 });
      setStoryText("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 5000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit story.");
    } finally {
      setSubmittingStory(false);
    }
  };

  /* -------- LOGIC: ACCESS CONTROL -------- */
  
  // const gender = userProfile?.gender?.toLowerCase() || "";
  // const isMale = ["male", "man", "m"].includes(gender);
  // const isFemale = ["female", "woman", "f"].includes(gender);

  // // 🔐 ONLY trust normalized value
  // const isPremium = userProfile?.isPremium === true;

  // // ⛔ DO NOT show paywall until profile is fully ready
  // const isPaywalled =
  //   !loadingProfile &&
  //   userProfile !== null &&
  //   isMale &&
  //   !isPremium;

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 md:pt-20 overflow-x-hidden">
      <TopBar userName={userProfile?.firstName || "User"} onLogout={onLogout} />

      {/* Match Modal Overlay */}
      {showMatchModal && matchProfile && matchChatId && (
        <MatchModal profile={matchProfile} chatId={matchChatId} onComplete={handleMatchComplete} />
      )}

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        {/* 1. Hero Section */}
        <div className="text-center mb-10 md:mb-16 px-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 leading-tight">
            Find Your Vibe, <br className="hidden xs:block md:hidden" />
            <span className="text-teal-500 inline-flex items-center gap-2 flex-wrap justify-center">
              {userProfile?.firstName || "User"}
              <Heart className="w-8 h-8 md:w-12 md:h-12 fill-current text-teal-500" />
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect based on personality first. Authentic connections start here.
          </p>
        </div>

        {/* 2. Swipe Deck OR Paywall */}
        <div className="mb-12 md:mb-20 max-w-md md:max-w-4xl mx-auto w-full">
          <div className="relative">
            <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-teal-200/20 to-purple-200/20 blur-3xl rounded-full pointer-events-none -z-10" />
            
            {/* --- LOADING STATE --- */}
            {loadingProfile ? (
                <div className="flex flex-col items-center justify-center h-[400px] w-full bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl p-4">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-teal-500 mb-4"></div>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Loading profile...</p>
                </div>
            ) : isPaywalled ? (
                // --- 🔒 PAYWALL BANNER (FOR FREE MALE USERS) ---
                <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl p-8 text-center relative overflow-hidden group animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-0"></div>
                    
                    {/* ✅ REFRESH BUTTON (For Testing & State Sync) */}
                    <button 
                        onClick={fetchUserProfile}
                        className="absolute top-4 right-4 z-20 p-2 text-gray-500 hover:text-teal-600 bg-white/80 rounded-full shadow-sm hover:shadow-md transition-all"
                        title="Refresh Profile Status"
                    >
                        <RotateCw className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 ring-4 ring-white">
                            <Crown className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
                        </div>
                        
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                            Unlock Matches
                        </h2>
                        
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                Premium Access
                            </span>
                        </div>

                        <p className="text-gray-500 mb-8 max-w-xs text-sm md:text-base leading-relaxed">
                            Upgrade to Premium to see who is nearby, get unlimited likes, and start chatting instantly.
                        </p>

                        <button
                            onClick={() => navigate('/premium')}
                            className={`
                                px-8 py-4 md:px-10 md:py-5 rounded-2xl text-white text-lg md:text-xl font-bold shadow-2xl 
                                hover:scale-105 active:scale-95 transition-all flex items-center gap-3
                                ${PRIMARY_GRADIENT}
                            `}
                        >
                            <span>Get Premium</span>
                            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        <p className="mt-6 text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Secure Payment via Razorpay
                        </p>
                    </div>
                </div>
            ) : (
                // --- 🔓 SWIPE DECK (FOR FEMALE or PREMIUM MALE) ---
                loadingMatches ? (
                    <div className="flex flex-col items-center justify-center h-[400px] w-full bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl p-4">
                        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-teal-500 mb-4"></div>
                        <p className="text-sm md:text-base text-gray-500 font-medium">Finding potential matches...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 px-4 text-red-500 bg-white rounded-[32px] md:rounded-[40px] shadow-sm border border-red-50 text-sm md:text-base">
                        {error}
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] w-full text-center p-8 bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-xl">
                        <Heart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">No more matches</h3>
                        <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-[200px] md:max-w-none mx-auto">
                            Check back later for more people nearby!
                        </p>
                    </div>
                ) : (
                    <AnonymousSwipeDeck
                        profiles={profiles}
                        onLike={handleLike}
                        onDislike={handleDislike}
                    />
                )
            )}
          </div>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-8 mb-12 md:mb-16 max-w-4xl mx-auto px-2 md:px-0">
          {[
            { label: "Active Users", value: "10K+" },
            { label: "Matches Made", value: "50K+" },
            { label: "Success Rate", value: "92%" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-lg sm:text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-500 mb-1 md:mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* 4. Profile Completion Alert */}
        <div className="max-w-3xl mx-auto mb-16 md:mb-20 px-2 md:px-0">
          <ProfileCompletion />
        </div>

        {/* 5. Info Banners Grid (Hide Premium Ad for Females) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto mb-16 px-2 md:px-0">
          <div className="h-full min-h-[180px]">
            <NearbyBanner />
          </div>
          {/* Only show "Get Premium" banner if NOT female */}
          {!isFemale && (
              <div className="h-full min-h-[180px] flex items-center justify-center bg-gradient-to-br from-orange-500 to-rose-500 rounded-[24px] p-1 shadow-xl">
                <div className="w-full h-full bg-white/10 backdrop-blur-sm rounded-[20px] p-1 text-white flex flex-col justify-center">
                    <PremiumBanner /> 
                </div>
              </div>
          )}
        </div>

        {/* 6. Expert Tips Section */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20 px-2 md:px-0">
          <ExpertTipsBanner />
        </div>

        {/* 7. Success Stories */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <ReviewCarousel />
        </div>

        {/* 8. Write Your Story */}
        <div className="max-w-3xl mx-auto mb-16 sm:mb-24 px-4 md:px-0">
          <div className="bg-gradient-to-br from-white to-teal-50/50 rounded-[24px] md:rounded-[32px] p-6 md:p-10 shadow-lg border border-teal-100 relative overflow-hidden">
            <PenLine className="absolute top-4 right-4 md:top-6 md:right-6 w-16 h-16 md:w-24 md:h-24 text-teal-100/50 -rotate-12 pointer-events-none opacity-50 md:opacity-100" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                </div>
                <h2 className="text-lg md:text-3xl font-black text-gray-900 leading-tight">Found your person?</h2>
              </div>
              
              <p className="text-gray-600 mb-6 text-xs md:text-base max-w-lg leading-relaxed">
                Share your success story with us! Once approved by our team, your story will be featured here to inspire others.
              </p>

              {justSubmitted && (
                <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-green-600 fill-current" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">Story submitted successfully! ✨</p>
                    <p className="text-xs text-green-700">Our team will review your story and feature it soon. Thank you for sharing!</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                <textarea
                    className="w-full p-3 md:p-4 rounded-lg md:rounded-xl outline-none min-h-[100px] md:min-h-[120px] bg-transparent resize-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                    placeholder="Tell us how you met... (e.g., 'We matched on The Dating App and our first date was magical!')"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    maxLength={MAX_STORY_LENGTH}
                    disabled={submittingStory}
                />
                
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                  <span className={`text-xs font-medium ${storyText.length > MAX_STORY_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                    {storyText.length}/{MAX_STORY_LENGTH}
                    {storyText.length < 50 && storyText.length > 0 && <span className="ml-2 text-red-500">(min. 50)</span>}
                  </span>
                  
                  <button
                      onClick={handleSubmitStory}
                      disabled={submittingStory || !storyText.trim() || storyText.trim().length < 50}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-500 text-white rounded-lg font-bold text-sm hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-teal-200"
                  >
                      {submittingStory ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>Submit Story <Send className="w-4 h-4" /></>
                      )}
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] md:text-xs text-gray-400 mt-3 text-center">
                By submitting, you agree to let us share your story on our platform. Stories are reviewed before being published.
              </p>
            </div>
          </div>
        </div>

        {/* 9. Security Section */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16 px-2 md:px-0">
          <SecurityBanner />
        </div>

        {/* 10. Footer Section */}
        <Footer />

      </main>
    </div>
  );
};

export default HomePage;