import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Sparkles,
  Check,
  Zap,
  Eye,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Star,
  Flame,
  TrendingUp,
  Shield,
  Loader,
  AlertCircle,
  Ticket,
  X,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// --- THEME CONSTANTS ---
const PRIMARY_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B]";
const TEXT_GRADIENT = "bg-gradient-to-r from-[#0095E0] via-[#00B4D8] to-[#00C98B] bg-clip-text text-transparent";

// Icon mapping
const ICON_MAP: { [key: string]: any } = {
  zap: Zap,
  flame: Flame,
  'trending-up': TrendingUp,
  crown: Crown,
  star: Star,
  eye: Eye,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  shield: Shield,
};

interface PremiumPlan {
  plan_id: string;
  name: string;
  duration: string;
  price: number;
  original_price?: number;
  price_per_month: number;
  discount_text?: string;
  icon: string;
  gradient: string;
  popular: boolean;
  features: string[];
  active: boolean;
}

interface PromoDiscount {
  code: string;
  discountPercentage: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

// --- HELPER: Get Token ---
const getAuthToken = (): { token: string; type: 'Bearer' | 'Token' } | null => {
  const jwtKeys = ['access_token', 'accessToken', 'jwt', 'access'];
  const tokenKeys = ['token', 'authToken', 'auth_token', 'admin_token'];

  for (const key of jwtKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: 'Bearer' };
  }
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return { token, type: 'Token' };
  }
  return null;
};

// --- COMPONENT: Promo Code Input ---
interface PromoCodeInputProps {
  selectedPlan: string;
  onPromoApplied: (discount: PromoDiscount) => void;
  onPromoRemoved: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({ selectedPlan, onPromoApplied, onPromoRemoved }) => {
  const [promoCode, setPromoCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoDiscount | null>(null);
  const [error, setError] = useState('');

  const validatePromo = async () => {
    if (!promoCode.trim()) { setError('Please enter a promo code'); return; }
    if (!selectedPlan) { setError('Please select a plan first'); return; }

    setValidating(true);
    setError('');

    try {
      const authData = getAuthToken();
      if (!authData) {
        setError('Please log in to use promo codes.');
        setValidating(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/promo/validate/`, {
        method: 'POST',
        headers: {
          'Authorization': `${authData.type} ${authData.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode.toUpperCase().trim(), plan_id: selectedPlan }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const originalPrice = parseFloat(data.promo_code.plan.original_price);
        const finalPrice = parseFloat(data.promo_code.plan.final_price);
        const discount: PromoDiscount = {
          code: data.promo_code.code,
          discountPercentage: data.promo_code.discount_percentage,
          originalPrice: originalPrice,
          discountAmount: originalPrice - finalPrice,
          finalPrice: finalPrice,
        };
        setAppliedPromo(discount);
        onPromoApplied(discount);
        setPromoCode('');
      } else {
        setError(data.message || 'Invalid promo code');
      }
    } catch (err) {
      console.error('Promo error:', err);
      setError('Failed to validate promo code.');
    } finally {
      setValidating(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError('');
    onPromoRemoved();
  };

  return (
    <div className="w-full">
      {appliedPromo ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
            </div>
            <div>
              <p className="text-emerald-900 font-bold text-sm">
                Code <span className="font-mono">{appliedPromo.code}</span> Applied!
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                You save ₹{appliedPromo.discountAmount.toFixed(0)} ({appliedPromo.discountPercentage}%)
              </p>
            </div>
          </div>
          <button onClick={removePromo} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 p-2 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
            <div className="pl-3 text-gray-400">
                <Ticket className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setError('');
              }}
              placeholder="Enter Promo Code"
              className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 uppercase"
            />
            <button
              onClick={validatePromo}
              disabled={validating || !promoCode.trim()}
              className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              {validating ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply'}
            </button>
        </div>
      )}
      {error && (
          <div className="mt-2 flex items-center gap-1.5 text-red-500 text-xs font-medium pl-1 animate-in fade-in">
              <AlertCircle className="w-3 h-3" />
              {error}
          </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
const PremiumPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PremiumPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<PromoDiscount | null>(null);

  useEffect(() => {
    fetchPremiumData();
  }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = `${API_BASE_URL}/admin`;
      
      const [plansRes, featuresRes] = await Promise.all([
        fetch(`${baseUrl}/premium/plans/`),
        fetch(`${baseUrl}/premium/features/`)
      ]);

      if (!plansRes.ok || !featuresRes.ok) throw new Error("Failed to fetch data");

      const plansData = await plansRes.json();
      const cleanPlans = Array.isArray(plansData) ? plansData : (plansData.results || []);
      
      setPlans(cleanPlans);
      
      const popular = cleanPlans.find((p: PremiumPlan) => p.popular);
      if (popular) setSelectedPlan(popular.plan_id);
      else if (cleanPlans.length > 0) setSelectedPlan(cleanPlans[0].plan_id);

    } catch (error: any) {
      console.error('Error:', error);
      setError("Unable to load plans.");
    } finally {
      setLoading(false);
    }
  };

  // const handlePurchase = async (planId: string) => {
  //   if (promoDiscount) {
  //       // Vikas's Promo Logic
  //       const authData = getAuthToken();
  //       if (!authData) return alert('Please log in first.');
        
  //       try {
  //           const response = await fetch('http://127.0.0.1:8000/api/promo/redeem/', {
  //               method: 'POST',
  //               headers: {
  //                   'Authorization': `${authData.type} ${authData.token}`,
  //                   'Content-Type': 'application/json',
  //               },
  //               body: JSON.stringify({ code: promoDiscount.code, plan_id: planId }),
  //           });
  //           const data = await response.json();
  //           if (response.ok) {
  //               alert(`Success! Plan activated using ${promoDiscount.code}`);
  //               return;
  //           }
  //       } catch (e) { console.error(e); }
  //   }
  //   alert(`Proceeding to payment for plan ${planId}`);
  // };

  const handlePurchase = async (planId: string) => {
  try {
    const authData = getAuthToken();
    if (!authData) {
      alert("Please log in first.");
      return;
    }

    // 1️⃣ Create Razorpay Order
    const orderRes = await fetch(
      `${API_BASE_URL}/create-order/`,
      {
        method: "POST",
        headers: {
          Authorization: `${authData.type} ${authData.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: planId,
          promo_code: promoDiscount?.code || null,
        }),
      }
    );

    if (!orderRes.ok) throw new Error("Order creation failed");

    const order = await orderRes.json();

    // 2️⃣ Open Razorpay Checkout
    const rzp = new window.Razorpay({
      key: order.razorpay_key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "The Dating App",
      description: order.plan_name,
      handler: async (response: any) => {
        const verifyRes = await fetch(
          `${API_BASE_URL}/verify-payment/`,
          {
            method: "POST",
            headers: {
              Authorization: `${authData.type} ${authData.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...response,
              plan_id: planId,
            }),
          }
        );

        if (!verifyRes.ok) {
          alert("Payment verification failed");
          return;
        }

        alert("🎉 Premium activated!");
        navigate("/premium-success");
      },
      theme: { color: "#00B4D8" },
    });

    rzp.open();
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Try again.");
  }
};


  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-sm font-medium text-gray-400">Loading plans...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load plans</h2>
        <p className="text-slate-500 mb-6 max-w-xs mx-auto text-sm">{error}</p>
        <button onClick={fetchPremiumData} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
            Try Again
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-20">
      
      {/* --- Header --- */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-900">Premium</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-12">
        
        {/* --- Hero --- */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-full mb-6">
                <Crown className="w-4 h-4 text-teal-600" strokeWidth={2.5} />
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Premium Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Upgrade your <br className="md:hidden" /><span className={TEXT_GRADIENT}>Love Life</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                Unlock exclusive features, see who likes you, and get 10x more matches with our premium plans.
            </p>
        </div>

        {/* --- Plans Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-12">
            {plans.map((plan) => {
                const isSelected = selectedPlan === plan.plan_id;
                const displayPrice = (promoDiscount && isSelected) ? promoDiscount.finalPrice : plan.price;
                const Icon = ICON_MAP[plan.icon] || Star;

                return (
                    <motion.div
                        key={plan.plan_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedPlan(plan.plan_id)}
                        className={`
                            relative bg-white rounded-[32px] p-8 cursor-pointer transition-all duration-300 flex flex-col
                            ${isSelected 
                                ? 'shadow-[0_20px_40px_-12px_rgba(13,148,136,0.15)] ring-2 ring-teal-500 z-10 scale-[1.02]' 
                                : 'shadow-sm border border-gray-100 hover:border-teal-100 hover:shadow-md'
                            }
                        `}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-yellow-200 fill-current" />
                                Most Popular
                            </div>
                        )}
                        
                        {/* Header Part */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl ${plan.gradient || 'bg-slate-100'} flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">{plan.name}</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{plan.duration}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-4xl font-black text-slate-900">
                                    ₹{Math.floor(displayPrice)}
                                </span>
                                {(plan.original_price || (promoDiscount && isSelected)) && (
                                    <span className="text-lg text-slate-400 line-through font-medium decoration-2">
                                        ₹{Math.floor(plan.price)}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-slate-500 font-medium">
                                    ₹{Math.floor(plan.price_per_month)}/month
                                </p>
                                {plan.discount_text && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                        {plan.discount_text}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="h-px bg-slate-100 mb-6" />

                        {/* Features List */}
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-300"}`}>
                                        <Check className="w-3 h-3" strokeWidth={3.5} />
                                    </div>
                                    <span className="leading-snug">{f}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Selection Indicator Button */}
                        <Button 
                            className={`
                                w-full py-6 rounded-xl font-bold text-base transition-all shadow-none
                                ${isSelected 
                                    ? `${PRIMARY_GRADIENT} text-white shadow-lg shadow-teal-500/20 hover:opacity-90` 
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }
                            `}
                        >
                            {isSelected ? 'Selected Plan' : 'Choose Plan'}
                        </Button>
                    </motion.div>
                );
            })}
        </div>

        {/* --- Footer Area --- */}
        <div className="max-w-md mx-auto space-y-6">
            <PromoCodeInput 
                selectedPlan={selectedPlan}
                onPromoApplied={setPromoDiscount}
                onPromoRemoved={() => setPromoDiscount(null)}
            />

            <motion.button 
                onClick={() => handlePurchase(selectedPlan)}
                disabled={!selectedPlan}
                whileTap={{ scale: 0.98 }}
                className={`
                    w-full py-4 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all
                    ${selectedPlan 
                        ? 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }
                `}
            >
                <Crown className={`w-5 h-5 ${selectedPlan ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                {promoDiscount && promoDiscount.finalPrice === 0 
                    ? 'Activate Free Plan' 
                    : 'Continue to Payment'
                }
            </motion.button>

            <p className="text-center text-xs text-slate-400 font-medium px-8 leading-relaxed">
                By continuing, you agree to our Terms of Service. 
                Recurring billing, cancel anytime.
            </p>
        </div>

      </div>
    </div>
  );
};

export default PremiumPage;