import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const ToggleSwitch = ({
  label,
  checked,
  onChange,
  className,
}: ToggleSwitchProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between w-full py-4 px-5 rounded-2xl border-2 transition-all duration-200 bg-white group",
        checked
          ? "border-teal-500/30 bg-teal-50/50" // Subtle active background
          : "border-gray-100 hover:border-gray-200",
        className
      )}
    >
      <span className={cn(
        "text-sm font-medium transition-colors",
        checked ? "text-teal-900" : "text-gray-600"
      )}>
        {label}
      </span>
      
      {/* Switch Track */}
      <div
        className={cn(
          "w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out",
          checked ? "bg-teal-500" : "bg-gray-200 group-hover:bg-gray-300"
        )}
      >
        {/* Switch Thumb */}
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
};