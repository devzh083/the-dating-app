// src/components/onboarding/steps/Step10Review.tsx
import React from "react";
import { motion } from "framer-motion";
import { differenceInYears } from "date-fns";
import StepLayout from "../StepLayout";
import { MapPin, Sparkles, MessageCircle, Quote } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";

interface Step10Props {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// Helper to map values back to emojis for the review card
const getEmoji = (category: string, value: string) => {
  const map: Record<string, Record<string, string>> = {
    drinking: { "Never": "🚫", "Socially": "🍷", "Regularly": "🍻" },
    smoking: { "Never": "🚭", "Sometimes": "💨", "Regularly": "🚬" },
    workout: { "Never": "🛋️", "Sometimes": "🚶", "Often": "💪", "Daily": "✨" },
    pets: { "Own pets": "🐾", "Love pets": "❤️", "Allergic": "🤧", "None": "🚫" }
  };
  return map[category]?.[value] || "✨";
};

const Step10Review: React.FC<Step10Props> = ({ data, onNext, onBack, onSkip }) => {
  const age = data.dateOfBirth ? differenceInYears(new Date(), data.dateOfBirth) : null;
  const safeFirst = data.firstName || "User";
  const firstInitial = (safeFirst.charAt(0) || "U").toUpperCase();
  const mainPhoto = data.photos && data.photos.length > 0 ? data.photos[0] : null;

  // Compile Lifestyle Tags with Emojis
  const lifestyleTags = [
    { label: data.drinking, emoji: getEmoji('drinking', data.drinking), visible: !!data.drinking },
    { label: data.smoking, emoji: getEmoji('smoking', data.smoking), visible: !!data.smoking },
    { label: data.workout, emoji: getEmoji('workout', data.workout), visible: !!data.workout },
    { label: data.pets, emoji: getEmoji('pets', data.pets), visible: !!data.pets },
  ].filter(item => item.visible);

  return (
    <StepLayout
      currentStep={10}
      totalSteps={10}
      title="Looking good! ✨"
      subtitle="Here's your profile preview"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      nextLabel="Finish & Start Matching"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden"
        >
          {/* Header Section: Avatar + Name */}
          <div className="flex items-start gap-5 mb-6">
            {/* Avatar - Image or Initial */}
            <div className="shrink-0">
              {mainPhoto ? (
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img src={mainPhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-200">
                  {firstInitial}
                </div>
              )}
            </div>
            
            {/* Name Block */}
            <div className="pt-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {safeFirst}, {age}
              </h2>
              {data.showGender && data.gender && (
                <p className="text-gray-500 font-medium">{data.gender}</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {data.bio && (
            <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 relative">
               <Quote className="absolute top-2 left-2 w-4 h-4 text-gray-300 transform scale-x-[-1]" />
               <p className="text-gray-700 text-sm italic leading-relaxed text-center px-4">
                  {data.bio}
               </p>
               <Quote className="absolute bottom-2 right-2 w-4 h-4 text-gray-300" />
            </div>
          )}

          {/* Conversation Starter Section */}
          {data.conversationStarter && (
            <div className="mb-8">
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <h3 className="flex items-center gap-2 text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Conversation Starter
                </h3>
                <p className="text-teal-900 text-sm font-semibold leading-snug">
                  "{data.conversationStarter}"
                </p>
              </div>
            </div>
          )}

          {/* Details List */}
          <div className="space-y-3 mb-6 px-1">
            {/* Location */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
              <span>
                {data.useCurrentLocation ? "Using current location" : data.location || "Location not set"} 
                <span className="text-gray-300 mx-2">|</span> 
                {data.distance} km away max
              </span>
            </div>

            {/* Interested In */}
            {data.interestedIn.length > 0 && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Looking for: <span className="font-medium text-gray-900">{data.interestedIn.join(", ")}</span></span>
              </div>
            )}
          </div>

          {/* Lifestyle Section */}
          {lifestyleTags.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-50">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {lifestyleTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-100"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests Section */}
          {data.interests.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {data.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-full bg-teal-50/50 border border-teal-100 text-teal-700 text-xs font-bold"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400">
          You can always update your profile later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step10Review;