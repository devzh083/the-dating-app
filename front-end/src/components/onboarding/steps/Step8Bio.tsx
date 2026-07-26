// src/components/onboarding/steps/Step8Bio.tsx
import React, { useState, useEffect } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { MessageCircle, PenLine, Sparkles, Quote, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step8Props {
  data: Pick<OnboardingData, "bio" | "conversationStarter">;
  onChange: (data: Step8Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const STARTERS = [
  "What song perfectly describes your current chapter in life?",
  "What's the most spontaneous thing you've ever done?",
  "If you could have dinner with any fictional character, who would it be?",
  "What's a hill you're willing to die on?",
  "Best concert you've ever been to?",
  "Two truths and a lie...",
];

export const Step8Bio = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step8Props) => {
  const bioCharacterLimit = 150;
  
  // Local state to manage if user is typing a custom starter
  const [isCustom, setIsCustom] = useState(false);

  // Check if the current starter is one of the presets
  const isPreset = STARTERS.includes(data.conversationStarter);

  // Handle custom text input
  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true);
    onChange({ ...data, conversationStarter: e.target.value });
  };

  // Handle preset selection
  const handlePresetSelect = (starter: string) => {
    setIsCustom(false);
    onChange({ ...data, conversationStarter: starter });
  };

  return (
    <StepLayout
      currentStep={8}
      totalSteps={8}
      title="Express Yourself"
      subtitle="Let your personality shine through words"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.bio.trim().length > 0 && data.conversationStarter.trim().length > 0}
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Section 1: Bio / Caption */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <PenLine className="w-4 h-4 text-teal-600" />
            </div>
            <h3>Your Bio</h3>
          </div>
          
          <div className="relative">
            <textarea
              value={data.bio}
              onChange={(e) => {
                if (e.target.value.length <= bioCharacterLimit) {
                  onChange({ ...data, bio: e.target.value });
                }
              }}
              placeholder="Tell us a bit about yourself... (e.g., 'Adventure seeker, coffee lover, always looking for the next best hiking spot.')"
              className="w-full min-h-[120px] p-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none shadow-sm"
            />
            <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400">
              {data.bio.length}/{bioCharacterLimit}
            </div>
          </div>
        </div>

        {/* Section 2: Conversation Starter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-teal-600" />
            </div>
            <h3>Choose a Conversation Starter</h3>
          </div>

          {/* CUSTOM INPUT FIELD */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Edit3 className={cn(
                    "h-5 w-5 transition-colors",
                    !isPreset && data.conversationStarter ? "text-teal-500" : "text-gray-400"
                )} />
            </div>
            <input
                type="text"
                value={isPreset ? "" : data.conversationStarter} // Show empty if a preset is selected to avoid confusion, or keep value
                onChange={handleCustomInput}
                placeholder="Write your own starter..."
                className={cn(
                    "w-full pl-11 pr-4 py-4 rounded-xl border-2 transition-all outline-none font-medium",
                    !isPreset && data.conversationStarter.length > 0
                        ? "border-teal-500 bg-white ring-4 ring-teal-500/10"
                        : "border-gray-100 bg-gray-50 focus:bg-white focus:border-teal-500"
                )}
            />
             {/* Label for "Custom" state */}
            {!isPreset && data.conversationStarter.length > 0 && (
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                    Custom
                 </span>
            )}
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or choose one</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* PRESET LIST */}
          <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {STARTERS.map((starter, index) => {
              const isSelected = data.conversationStarter === starter;
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handlePresetSelect(starter)}
                  className={cn(
                    "relative p-4 rounded-xl text-left border-2 transition-all duration-200 group",
                    isSelected
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-teal-200 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Quote className={cn(
                      "w-5 h-5 shrink-0 mt-0.5 transition-colors", 
                      isSelected ? "text-teal-600 fill-teal-600" : "text-gray-300 group-hover:text-teal-400"
                    )} />
                    <span className={cn(
                      "text-sm font-medium leading-snug transition-colors pr-6",
                      isSelected ? "text-teal-900" : "text-gray-600"
                    )}>
                      {starter}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      layoutId="check"
                      className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-teal-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-2">
            <Sparkles className="w-3 h-3" />
            <span>This will appear on your profile card</span>
          </div>
        </div>

      </div>
    </StepLayout>
  );
};

export default Step8Bio;