import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import { useNavigate, useLocation } from "react-router-dom";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Lifestyle from "./steps/Step3Lifestyle";
import Step4Communication from "./steps/Step4Communication";
import Step5Interests from "./steps/Step5Interests";
import Step6Location from "./steps/Step6Location";
import Step7Photos from "./steps/Step7Photos";
import Step8Bio from "./steps/Step8Bio";
import Step9Social from "./steps/Step9Social";
import Step10Review from "./steps/Step10Review";
import { profileService } from "../../services/profileService";

export type OnboardingData = {
  email?: string; // ✅ ADD

  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  relationshipType: string;
  interestedIn: string[];
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  photos: string[];
  bio: string;
  conversationStarter: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
  premium?: boolean;
};

const initialData: OnboardingData = {
  email: localStorage.getItem("userEmail") || "",

  firstName: "",
  dateOfBirth: null,
  gender: "",
  showGender: false,
  relationshipType: "",
  interestedIn: [],
  distance: 25,
  strictDistance: false,
  drinking: "",
  smoking: "",
  workout: "",
  pets: "",
  communicationStyle: [],
  responsePace: "",
  interests: [],
  location: "",
  useCurrentLocation: false,
  photos: [],
  bio: "",
  conversationStarter: "",
  socialAccounts: {
    instagram: "",
    whatsapp: "",
    snapchat: "",
    twitter: "",
    linkedin: "",
  },
};


const TOTAL_STEPS = 10;

export default function OnboardingFlow({ 
  onComplete, 
  onLogout 
}: { 
  onComplete?: () => void; 
  onLogout?: () => void; 
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        if (parsed.dateOfBirth) {
          parsed.dateOfBirth = new Date(parsed.dateOfBirth);
        }

        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    loadExistingProfile();
    const state = location.state as { startStep?: number } | null;
    if (state?.startStep) {
      setStep(state.startStep);
    }
  }, []);

  const loadExistingProfile = async () => {
    try {
      setIsLoading(true);
      const result = await profileService.getProfile();

      if (result?.exists && result?.data) {
        console.log("✅ Existing profile loaded:", result.data);
        setData({ ...initialData, ...result.data });
      }
    } catch (err) {
      console.error("⚠️ Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const setStepData = (patch: Partial<OnboardingData>) => {
  setData((prev) => ({
    ...prev,
    ...patch,
    email: prev.email, // 🔒 lock email
  }));
};

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkip = () => {
    goNext();
  };

  const saveProfileAndFinish = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await profileService.saveProfile(data);
      localStorage.removeItem("onboardingData");
      
      // ✅ ALWAYS Redirect to Home. Home Page handles the Paywall logic.
      if (onComplete) {
        onComplete();
      } else {
        navigate("/home", { replace: true });
      }

    } catch (err) {
      console.error("❌ Profile save failed:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1BasicInfo data={data} onChange={setStepData} onNext={goNext} onSkip={handleSkip} />;
      case 2: return <Step2Orientation data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 3: return <Step3Lifestyle data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 4: return <Step4Communication data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 5: return <Step5Interests data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 6: return <Step6Location data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 7: return <Step7Photos data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 8: return <Step8Bio data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      case 9: return <Step9Social data={data} onChange={setStepData} onNext={goNext} onBack={goBack} onSkip={handleSkip} />;
      default: return <Step10Review data={data} onNext={saveProfileAndFinish} onBack={goBack} onSkip={handleSkip} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar userName={data.firstName || "User"} onLogout={onLogout} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}