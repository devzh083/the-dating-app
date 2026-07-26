// src/components/onboarding/steps/Step3Lifestyle.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";

interface Step3Props {
  data: Pick<OnboardingData, 'drinking' | 'smoking' | 'workout' | 'pets'>;
  onChange: (data: Step3Props['data']) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const lifestyleOptions = {
  drinking: [
    { label: "Never", emoji: "🚫" },
    { label: "Socially", emoji: "🍷" },
    { label: "Regularly", emoji: "🍻" },
  ],
  smoking: [
    { label: "Never", emoji: "🚭" },
    { label: "Sometimes", emoji: "💨" },
    { label: "Regularly", emoji: "🚬" },
  ],
  workout: [
    { label: "Never", emoji: "🛋️" },
    { label: "Sometimes", emoji: "🚶" },
    { label: "Often", emoji: "💪" },
    { label: "Daily", emoji: "✨" },
  ],
  pets: [
    { label: "Own pets", emoji: "🐾" },
    { label: "Love pets", emoji: "❤️" },
    { label: "Allergic", emoji: "🤧" },
    { label: "None", emoji: "🚫" },
  ],
} as const;

export const Step3Lifestyle = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step3Props) => {
  return (
    <StepLayout
      currentStep={3}
      totalSteps={7}
      title="Your lifestyle"
      subtitle="No judgment here — just finding your vibe"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-10">
        {/* Drinking */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            Drinking
          </label>
          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.drinking.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.drinking === label}
                onClick={() => onChange({ ...data, drinking: label })}
              />
            ))}
          </div>
        </div>

        {/* Smoking */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            Smoking
          </label>
          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.smoking.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.smoking === label}
                onClick={() => onChange({ ...data, smoking: label })}
              />
            ))}
          </div>
        </div>

        {/* Workout */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            Working out
          </label>
          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.workout.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.workout === label}
                onClick={() => onChange({ ...data, workout: label })}
              />
            ))}
          </div>
        </div>

        {/* Pets */}
        <div className="space-y-4">
          <label className="text-base font-semibold text-gray-900 block">
            Pets
          </label>
          <div className="flex flex-wrap gap-3">
            {lifestyleOptions.pets.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.pets === label}
                onClick={() => onChange({ ...data, pets: label })}
              />
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step3Lifestyle;