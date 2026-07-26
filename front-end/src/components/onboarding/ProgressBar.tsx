// src/components/onboarding/ProgressBar.tsx
import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  isSaving?: boolean; // ✅ new optional prop
}

export const ProgressBar = ({ currentStep, totalSteps, isSaving }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="w-full h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#27c5be]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      {isSaving && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Saving...
        </span>
      )}
    </div>
  );
};

export default ProgressBar;