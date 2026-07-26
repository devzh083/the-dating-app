// src/components/onboarding/steps/Step4Communication.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step4Props {
  data: Pick<OnboardingData, 'communicationStyle' | 'responsePace'>;
  onChange: (data: Step4Props['data']) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const communicationOptions = [
  { label: "Texting a lot", emoji: "💬" },
  { label: "Occasional texter", emoji: "📱" },
  { label: "Phone calls", emoji: "📞" },
  { label: "Video calls", emoji: "🎥" },
  { label: "In-person preferred", emoji: "☕" },
];

const paceOptions = [
  { label: "Fast responder", emoji: "⚡", description: "I usually reply right away" },
  { label: "Chill", emoji: "😌", description: "I take my time, no pressure" },
  { label: "Slow responder", emoji: "🐢", description: "I'm bad at checking my phone" },
];

export const Step4Communication = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step4Props) => {
  const toggleStyle = (style: string) => {
    const current = data.communicationStyle;
    if (current.includes(style)) {
      onChange({
        ...data,
        communicationStyle: current.filter((s) => s !== style),
      });
    } else {
      onChange({ ...data, communicationStyle: [...current, style] });
    }
  };

  return (
    <StepLayout
      currentStep={4}
      totalSteps={7}
      title="How do you vibe best?"
      subtitle="Let's find your communication match"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-10">
        {/* Communication Style Section */}
        <div className="space-y-4">
          <div>
            <label className="text-base font-semibold text-gray-900 block">
              Preferred ways to connect
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Select all that work for you
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {communicationOptions.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.communicationStyle.includes(label)}
                onClick={() => toggleStyle(label)}
              />
            ))}
          </div>
        </div>

        {/* Response Pace Section (Radio Cards) */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            Your response pace
          </label>
          <div className="space-y-3">
            {paceOptions.map(({ label, emoji, description }) => {
              const isSelected = data.responsePace === label;
              return (
                <button
                  key={label}
                  onClick={() => onChange({ ...data, responsePace: label })}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left outline-none group",
                    isSelected
                      ? "border-teal-500 bg-teal-50" // Active State
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50" // Inactive State
                  )}
                >
                  {/* Emoji Container */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors shrink-0",
                    isSelected ? "bg-white shadow-sm" : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
                  )}>
                    {emoji}
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1">
                    <p className={cn(
                      "font-semibold transition-colors",
                      isSelected ? "text-teal-900" : "text-gray-900"
                    )}>
                      {label}
                    </p>
                    <p className={cn(
                      "text-sm transition-colors",
                      isSelected ? "text-teal-700/80" : "text-gray-500"
                    )}>
                      {description}
                    </p>
                  </div>

                  {/* Radio Indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected ? "border-teal-500" : "border-gray-300 group-hover:border-gray-400"
                  )}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step4Communication;