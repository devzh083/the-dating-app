import { Mars, Venus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenderButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function AnimatedGenderButton({
  label,
  isSelected,
  onClick,
}: GenderButtonProps) {
  // Determine icon based on label
  const Icon = label === "Man" ? Mars : Venus;
  
  // Specific colors for "Man" (Blue-ish) vs "Woman" (Pink-ish) or keep unified Teal?
  // Let's stick to your Unified Teal Brand for consistency, but with subtle differences if desired.
  // For now, we use the Brand Teal to match the "Bumble" clean aesthetic.

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative group flex flex-col items-center justify-center h-32 w-full rounded-3xl border-2 transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-1", // Hover lift effect
        "active:scale-95 active:shadow-sm active:translate-y-0", // Click press effect
        isSelected
          ? "border-teal-500 bg-teal-50/50 shadow-md shadow-teal-500/10"
          : "border-slate-100 bg-white hover:border-teal-200"
      )}
    >
      {/* Animated Background Blob (Subtle) */}
      <div 
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 bg-gradient-to-br from-teal-500/5 to-transparent",
          isSelected && "opacity-100"
        )} 
      />

      {/* Icon with Animation */}
      <div
        className={cn(
          "p-3 rounded-full mb-3 transition-all duration-300",
          isSelected
            ? "bg-teal-500 text-white scale-110 rotate-0"
            : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500 group-hover:scale-110"
        )}
      >
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-extrabold tracking-wide transition-colors duration-200",
          isSelected ? "text-teal-700" : "text-slate-600 group-hover:text-teal-600"
        )}
      >
        {label}
      </span>

      {/* Floating Checkmark for Selected State */}
      <div
        className={cn(
          "absolute top-3 right-3 transition-all duration-500 transform",
          isSelected
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-50 translate-y-2"
        )}
      >
        <CheckCircle2 className="w-5 h-5 text-teal-500 fill-teal-50" />
      </div>
    </button>
  );
}