import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CheckboxField = ({
  label,
  checked,
  onChange,
  className,
}: CheckboxFieldProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-3 w-full py-2 text-left group",
        className
      )}
    >
      <div
        className={cn(
          "w-6 h-6 flex items-center justify-center transition-all duration-200 border-2 rounded-full", // rounded-full makes it a circle
          checked
            ? "bg-teal-500 border-teal-500"
            : "border-gray-300 bg-white group-hover:border-teal-400"
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        </motion.div>
      </div>
      <span className={cn(
        "text-sm transition-colors",
        checked ? "text-gray-900 font-medium" : "text-gray-600"
      )}>
        {label}
      </span>
    </button>
  );
};