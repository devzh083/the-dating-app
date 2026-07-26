import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Shield,
  Sparkles,
  Coffee,
  Lock,
  Unlock,
  CheckCircle2,
  Music,
  Camera,
  Eye, 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Footer from "@/components/layout/Footer"; // Ensure this path is correct

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const TEXT_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B] bg-clip-text text-transparent";

// --- DATA: PROFILE POOLS ---
const MALE_PROFILES = [
  { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop", name: "Arjun, 27", vibe: ["Travel", "Photo"] },
  { img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop", name: "Dev, 29", vibe: ["Tech", "Gym"] },
  { img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop", name: "Kabir, 26", vibe: ["Music", "Art"] },
];

const FEMALE_PROFILES = [
  { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop", name: "Maya, 25", vibe: ["Coffee", "Books"] },
  { img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop", name: "Zara, 24", vibe: ["Dance", "Fashion"] },
  { img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop", name: "Riya, 28", vibe: ["Foodie", "Travel"] },
];

// --- INTERACTIVE COMPONENT: THE MATCH REVEAL ---
const TheMatchReveal = () => {
  const [status, setStatus] = useState<"idle" | "shuffling" | "matched">("idle");
  const [maleIndex, setMaleIndex] = useState(0);
  const [femaleIndex, setFemaleIndex] = useState(0);

  // Handle Shuffling Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === "shuffling") {
      // Fast shuffle loop
      interval = setInterval(() => {
        setMaleIndex((prev) => (prev + 1) % MALE_PROFILES.length);
        setFemaleIndex((prev) => (prev + 1) % FEMALE_PROFILES.length);
      }, 250); // Slower shuffle as requested

      // Stop shuffling after 3.5 seconds
      setTimeout(() => {
        clearInterval(interval);
        setStatus("matched");
      }, 3500);
    }

    return () => clearInterval(interval);
  }, [status]);

  const handleMatch = () => {
    if (status === "idle") setStatus("shuffling");
  };

  const currentMale = MALE_PROFILES[maleIndex];
  const currentFemale = FEMALE_PROFILES[femaleIndex];

  return (
    <div className="relative w-full max-w-2xl h-[500px] flex items-center justify-center select-none">
      
      {/* Hearts Explosion (On Match) */}
      <AnimatePresence>
        {status === "matched" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none z-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, x: (Math.random() - 0.5) * 700, y: (Math.random() - 0.5) * 600 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Heart className="w-8 h-8 text-[#00C98B] fill-[#00C98B]" />
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEFT CARD (MAN) --- */}
      <motion.div
        // Idle: float loop | Shuffling: shake | Matched: move left
        animate={
          status === "idle" ? { y: [0, -10, 0], rotate: -6, x: -40 } :
          status === "shuffling" ? { x: [0, -5, 5, 0], rotate: 0, scale: 1.05 } : 
          { x: -140, rotate: -5, scale: 1.1, y: 0 }
        }
        transition={
          status === "idle" ? { repeat: Infinity, duration: 4, ease: "easeInOut" } :
          status === "shuffling" ? { repeat: Infinity, duration: 0.2 } :
          { type: "spring", stiffness: 100, damping: 15 }
        }
        className="absolute w-60 h-80 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden bg-white z-10 origin-bottom"
      >
        {/* Content Layer */}
        <div className="relative w-full h-full">
          {/* Real Photo (Visible during shuffle & match) */}
          <img src={currentMale.img} className="w-full h-full object-cover transition-opacity duration-200" alt="Male" />
          
          {/* Overlay info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
             <span className="text-white font-bold text-lg">{currentMale.name}</span>
          </div>

          {/* Anonymous Cover (Fades out on click) */}
          <AnimatePresence>
            {status === "idle" && (
              <motion.div 
                exit={{ opacity: 0 }}
                className={`absolute inset-0 ${PRIMARY_GRADIENT} flex flex-col items-center justify-center text-white p-4 text-center z-20`}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-lg">Anonymous</div>
                <div className="flex gap-2 mt-2 text-[10px] font-medium opacity-90">
                  <span className="bg-white/20 px-2 py-1 rounded-full">Travel</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">Photo</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- RIGHT CARD (WOMAN) --- */}
      <motion.div
        animate={
          status === "idle" ? { y: [0, 10, 0], rotate: 6, x: 40 } : // Float opposite
          status === "shuffling" ? { x: [0, 5, -5, 0], rotate: 0, scale: 1.05 } : 
          { x: 140, rotate: 5, scale: 1.1, y: 0 }
        }
        transition={
          status === "idle" ? { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 } :
          status === "shuffling" ? { repeat: Infinity, duration: 0.2 } :
          { type: "spring", stiffness: 100, damping: 15 }
        }
        className="absolute w-60 h-80 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden bg-white z-0 origin-bottom"
      >
        <div className="relative w-full h-full">
          <img src={currentFemale.img} className="w-full h-full object-cover transition-opacity duration-200" alt="Female" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
             <span className="text-white font-bold text-lg">{currentFemale.name}</span>
          </div>

          <AnimatePresence>
            {status === "idle" && (
              <motion.div 
                exit={{ opacity: 0 }}
                className={`absolute inset-0 ${PRIMARY_GRADIENT} flex flex-col items-center justify-center text-white p-4 text-center z-20`}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-lg">Anonymous</div>
                <div className="flex gap-2 mt-2 text-[10px] font-medium opacity-90">
                  <span className="bg-white/20 px-2 py-1 rounded-full">Music</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">Coffee</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- CENTER BUTTON / BADGE --- */}
      <div className="absolute z-30">
        {status === "idle" ? (
          <motion.button
            onClick={handleMatch}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center cursor-pointer group relative"
          >
            <div className="absolute inset-0 rounded-full border-4 border-[#0095E0]/20 animate-ping" />
            <div className={`w-16 h-16 rounded-full ${PRIMARY_GRADIENT} flex items-center justify-center text-white`}>
              <Lock className="w-8 h-8 group-hover:hidden" />
              <Unlock className="w-8 h-8 hidden group-hover:block" />
            </div>
            <div className="absolute -bottom-10 bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm whitespace-nowrap">
              Reveal Match
            </div>
          </motion.button>
        ) : status === "shuffling" ? (
           <div className="bg-white px-6 py-3 rounded-full shadow-xl font-bold text-gray-400 animate-pulse">
             Finding Match...
           </div>
        ) : (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#00C98B]"
          >
            <Heart className="w-6 h-6 text-[#00C98B] fill-[#00C98B]" />
            <span className="font-bold text-[#00C98B] text-lg">It's a Match!</span>
          </motion.div>
        )}
      </div>

    </div>
  );
};

// --- MAIN LANDING PAGE ---

const steps = [
  {
    icon: Lock,
    title: "1. The Vibe Check",
    description: "Profiles are anonymous. No photos, no names. Just interests, bios, and conversation starters.",
  },
  {
    icon: Heart,
    title: "2. The Mutual Match",
    description: "Like their vibe? If they like you back, it's a match! Only then do photos and details unlock.",
  },
  {
    icon: Coffee,
    title: "3. The Perfect Date",
    description: "Skip the awkward planning. We suggest top-rated cafés for your first meet-up based on location.",
  },
];

const safetyFeatures = [
  { icon: CheckCircle2, title: "Verified Humans Only", desc: "No bots. No catfishing. Selfie-verification ensures every profile is real.", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Eye, title: "Privacy by Design", desc: "Your photos are encrypted. You control exactly when and to whom you reveal them.", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: Shield, title: "Proactive Moderation", desc: "Our AI and human team work 24/7 to detect and remove bad actors instantly.", color: "text-amber-500", bg: "bg-amber-50" }
];

const Landing = () => {
  const navigate = useNavigate();
  const goToAuth = () => navigate("/login");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#0095E0] selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' } as ScrollToOptions)}
          >
            <div className={`w-10 h-10 rounded-xl ${PRIMARY_GRADIENT} flex items-center justify-center shadow-lg shadow-blue-200`}>
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">The Dating App</span>
          </motion.div>

          {/* ✅ Removed "For Cafés" Link */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-[#0095E0] transition-colors">How it Works</a>
            <a href="#safety" className="hover:text-[#0095E0] transition-colors">Safety</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goToAuth} className="hidden sm:inline-flex text-gray-600 hover:text-[#0095E0]">
              Sign in
            </Button>
            <Button onClick={goToAuth} className={`${PRIMARY_GRADIENT} text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all`}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0095E0]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00C98B]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* inset-inline-start: Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Dating Reimagined</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
              Connect by Vibe.<br />
              Reveal by <span className={TEXT_GRADIENT}>Choice.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Tired of superficial swiping? We keep profiles anonymous until you match. 
              Once you connect, we unlock the details and help you plan the perfect date.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={goToAuth} size="lg" className={`${PRIMARY_GRADIENT} text-white px-8 h-14 rounded-full text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-0`}>
                Find Your Match
              </Button>
              <Button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth'})} variant="outline" size="lg" className="h-14 rounded-full px-8 text-base font-bold border-2 hover:bg-gray-50">
                How it works
              </Button>
            </div>
          </motion.div>

          {/* inset-inline-end: The Interactive Match Reveal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center lg:justify-end"
          >
            <TheMatchReveal />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dating, De-influenced.</h2>
            <p className="text-xl text-gray-500">How we bring focus back to what matters.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${PRIMARY_GRADIENT} flex items-center justify-center mb-6 shadow-md`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY SECTION */}
      <section id="safety" className="py-24 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#0095E0] font-bold text-xs uppercase tracking-widest mb-6"
            >
              <Shield className="w-4 h-4" />
              <span>Uncompromised Safety</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Dating without the <span className="text-[#0095E0]">worry.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built safety into every step of the journey, so you can focus on finding your connection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {safetyFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group cursor-default"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
          
           {/* Trust Indicators */}
           <div className="mt-20 border-t border-gray-100 pt-12 text-center">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Protected by Industry Standards</p>
             <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 font-black text-xl"><Shield className="w-6 h-6"/> SSL SECURE</div>
                <div className="flex items-center gap-2 font-black text-xl"><Lock className="w-6 h-6"/> AES-256</div>
                <div className="flex items-center gap-2 font-black text-xl"><CheckCircle2 className="w-6 h-6"/> GDPR READY</div>
             </div>
          </div>

        </div>
      </section>

      {/* ✅ FOOTER COMPONENT REPLACED HERE */}
      <Footer />

    </div>
  );
};

export default Landing;