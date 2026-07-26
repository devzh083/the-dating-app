// src/components/onboarding/steps/Step9Social.tsx
import React, { useState } from "react";
import { Instagram } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import StepLayout from "../StepLayout";

interface Step9Props {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const Step9Social: React.FC<Step9Props> = ({ data, onChange, onNext, onBack, onSkip }) => {
  const [instagram, setInstagram] = useState(data.socialAccounts?.instagram || "");

  const handleNext = () => {
    onChange({
      socialAccounts: {
        instagram: instagram.trim(),
        // We ensure other fields are cleared or not set if they existed previously
        whatsapp: "",
        snapchat: "",
        twitter: "",
        linkedin: "",
      },
    });
    onNext();
  };

  return (
    <StepLayout
      currentStep={9}
      totalSteps={9}
      title="Connect Your Instagram"
      subtitle="Share your Instagram to make it easier to connect off the platform"
      onBack={onBack}
      onNext={handleNext}
      onSkip={onSkip}
      nextLabel="Continue"
    >
      <div className="space-y-6">
        {/* Social accounts form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          
          {/* Instagram Only */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="username"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

        </div>

        {/* Privacy note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Privacy note:</span> Your Instagram handle will only be visible to people you match with.
          </p>
        </div>

        {/* Optional info note */}
        <p className="text-center text-xs text-gray-400">
          This field is optional. Skip if you prefer not to share.
        </p>
      </div>
    </StepLayout>
  );
};

export default Step9Social;