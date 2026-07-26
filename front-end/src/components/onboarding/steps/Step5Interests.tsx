// src/components/onboarding/steps/Step5Interests.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step5Props {
  data: Pick<OnboardingData, "interests">;
  onChange: (data: Step5Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const interestCategories = [
  {
    title: "Movies & TV",
    emoji: "🎬",
    options: [
      "Action", "Comedy", "Drama", "Horror", 
      "Sci-Fi", "Documentaries", "Anime", "Reality TV", "Other"
    ],
  },
  {
    title: "Music",
    emoji: "🎵",
    options: [
      "Pop", "Hip-Hop", "Rock", "Electronic", 
      "R&B", "Country", "Jazz", "Classical", "Other"
    ],
  },
  {
    title: "Sports",
    emoji: "⚽",
    options: [
      "Football", "Basketball", "Tennis", "Swimming", 
      "Running", "Yoga", "Cycling", "Golf", "Other"
    ],
  },
  {
    title: "Food & Drink",
    emoji: "🍕",
    options: [
      "Cooking", "Fine Dining", "Street Food", "Coffee", 
      "Wine", "Cocktails", "Vegan", "BBQ", "Other"
    ],
  },
  {
    title: "Hobbies",
    emoji: "🎨",
    options: [
      "Photography", "Reading", "Gaming", "Art", 
      "Writing", "Gardening", "DIY", "Crafts", "Other"
    ],
  },
  {
    title: "Travel & Adventure",
    emoji: "✈️",
    options: [
      "Beach", "Mountains", "City Trips", "Backpacking", 
      "Road Trips", "Camping", "Cruises", "Staycations", "Other"
    ],
  },
] as const;

export const Step5Interests = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step5Props) => {
  
  const toggleInterest = (interest: string) => {
    const current = data.interests;
    if (current.includes(interest)) {
      // Remove interest
      onChange({ ...data, interests: current.filter((i) => i !== interest) });
    } else {
      // Add interest (No limit check)
      onChange({ ...data, interests: [...current, interest] });
    }
  };

  const selectedCount = data.interests.length;

  return (
    <StepLayout
      currentStep={5}
      totalSteps={7}
      title="What are you into?"
      subtitle="Pick your interests to help find better matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
    >
      <div className="space-y-6">
        {/* Sticky Counter Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm pb-4 pt-1 border-b border-gray-50 -mx-10 px-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-500">
              Select all that apply
            </span>
            <motion.div
              key={selectedCount}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5"
            >
              <span className="text-sm font-bold text-teal-600">
                {selectedCount}
              </span>
              <span className="text-sm font-medium text-gray-400">selected</span>
            </motion.div>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-8 pb-4">
          {interestCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.emoji}</span>
                <label className="text-base font-semibold text-gray-900">
                  {category.title}
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                {category.options.map((interest) => (
                  <ChipSelector
                    key={interest}
                    label={interest}
                    selected={data.interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
};

export default Step5Interests;