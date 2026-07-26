import { Heart } from "lucide-react"; // Icon for the active state
import StepLayout from "../StepLayout";
import { cn } from "@/lib/utils";

// ✅ Keep Strong Types
interface Step2Props {
  data: {
    relationshipType: string;
  };
  onChange: (data: Partial<Step2Props["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

const RELATIONSHIP_STATUSES = [
  "Single",
  "Committed",
  "Broken up recently",
  "Divorced",
  "Widowed",
];

export default function Step2Orientation({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step2Props) {
  const canProceed = !!data.relationshipType;

  return (
    <StepLayout
      currentStep={2}
      totalSteps={10}
      title="Relationship Status"
      subtitle="Be honest, it helps us find what you really need."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip} // ✅ Passed to Layout
      canProceed={canProceed}
      showBack={true} // Explicitly show back button
    >
      <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {RELATIONSHIP_STATUSES.map((status) => {
          const isActive = data.relationshipType === status;
          
          return (
            <button
              key={status}
              onClick={() => onChange({ relationshipType: status })}
              className={cn(
                "w-full p-5 rounded-2xl border-2 text-left font-bold text-base transition-all duration-200 flex items-center justify-between group relative overflow-hidden",
                "hover:shadow-md hover:-translate-y-0.5", // Hover lift
                "active:scale-[0.98]", // Click press
                isActive
                  ? "border-teal-500 bg-teal-50/60 text-teal-800 shadow-sm shadow-teal-500/10"
                  : "border-slate-100 bg-white text-slate-600 hover:border-teal-200 hover:bg-slate-50"
              )}
            >
              <span className="relative z-10">{status}</span>

              {/* Custom Radio Circle */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                  isActive
                    ? "border-teal-500 bg-teal-500 text-white scale-110"
                    : "border-slate-200 group-hover:border-teal-300"
                )}
              >
                {isActive && <Heart className="w-3 h-3 fill-current" />}
              </div>

              {/* Subtle background glow for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent z-0" />
              )}
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}