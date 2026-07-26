// src/components/onboarding/steps/Step2Distance.tsx
import StepLayout from "../StepLayout";
import { CustomSlider } from "../CustomSlider";
import { ToggleSwitch } from "../ToggleSwitch";
import { MapPin } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface Step2Props {
  data: Pick<OnboardingData, 'distance' | 'strictDistance'>;
  onChange: (data: Step2Props['data']) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step2Distance = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step2Props) => {
  return (
    <StepLayout
      currentStep={2}
      totalSteps={7}
      title="How far would you go?"
      subtitle="Set your maximum distance for matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-10">
        {/* Visual Icon - Solid Teal Circle */}
        <div className="flex justify-center py-4">
          <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-200">
            <MapPin className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Distance Slider Section */}
        <div className="space-y-6">
          <label className="text-base font-semibold text-gray-900 block">
            Maximum distance
          </label>
          
          <CustomSlider
            value={data.distance}
            min={1}
            max={150}
            step={1}
            unit="km"
            onChange={(distance) => onChange({ ...data, distance })}
          />
        </div>

        {/* Strict Distance Toggle */}
        <div className="pt-2">
          <ToggleSwitch
            label="Only show people within this range"
            checked={data.strictDistance}
            onChange={(strictDistance) => onChange({ ...data, strictDistance })}
          />
        </div>

        <p className="text-xs text-gray-400 text-center pt-4">
          You can always adjust this later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step2Distance;