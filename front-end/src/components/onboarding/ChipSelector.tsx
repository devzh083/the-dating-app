import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChipSelectorProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ChipSelector = ({
  label,
  selected,
  onClick,
  icon,
  className,
}: ChipSelectorProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
        selected
          ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-100" // Selected: Teal Fill
          : "bg-white border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600", // Unselected
        className
      )}
    >
      {icon && <span className="text-lg leading-none">{icon}</span>}
      <span>{label}</span>
      
      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-out",
        selected ? "w-4 opacity-100" : "w-0 opacity-0"
      )}>
        <Check className="w-4 h-4 text-white stroke-[3]" />
      </div>
    </motion.button>
  );
};