import React from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

type OnboardingPageProps = {
  onComplete?: () => void;
  onLogout?: () => void;
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete, onLogout }) => {
  const navigate = useNavigate();

  const handleFinish = () => {
    // 1. Update App state immediately
    onComplete?.();

    // 2. Navigate to home
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <OnboardingFlow onComplete={handleFinish} onLogout={onLogout} />
    </div>
  );
};

export default OnboardingPage;