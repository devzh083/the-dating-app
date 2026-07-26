// src/components/onboarding/PillButton.tsx
import { cn } from "@/lib/utils";

interface PillButtonProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

export const PillButton = ({
  label,
  selected = false,
  onClick,
}: PillButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full text-sm font-medium transition-all",
        "border focus:outline-none",
        selected
          ? "bg-[#00bcd4] border-[#00bcd4] text-white shadow-sm"
          : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
      )}
    >
      {label}
    </button>
  );
};

export default PillButton;
