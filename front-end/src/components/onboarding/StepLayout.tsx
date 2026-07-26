// src/components/onboarding/StepLayout.tsx
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { cn } from "@/lib/utils";

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  nextLabel?: string;
  canProceed?: boolean;
  showBack?: boolean;
}

export default function StepLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onSkip,
  onNext,
  nextLabel = "Next",
  canProceed = true,
  showBack = true,
}: StepLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#f5fbff] flex items-center justify-center pt-20">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 rounded-t-2xl">
          <div className="px-10 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              {showBack ? (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              ) : <div />}

              <button
                onClick={onSkip}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Skip
              </button>
            </div>

            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

            <div className="mt-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-10 pb-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 px-10 py-4 rounded-b-2xl bg-white">
          <motion.button
            whileHover={{ scale: canProceed ? 1.02 : 1 }}
            whileTap={{ scale: canProceed ? 0.98 : 1 }}
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "mx-auto block w-[230px] py-3 text-base font-semibold rounded-full transition-all",
              canProceed
                ? "bg-gradient-to-r from-[#00a7ff] via-[#00c2ff] to-[#00cf84] text-white shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {nextLabel}
          </motion.button>
        </footer>
      </div>
    </div>
  );
}