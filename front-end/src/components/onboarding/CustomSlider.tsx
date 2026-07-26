import { motion } from "framer-motion";

interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const CustomSlider = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
}: CustomSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-6">
      {/* Large Centered Value Display */}
      <div className="flex justify-center">
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold text-teal-500"
        >
          {value}
          <span className="text-2xl ml-1 font-semibold">{unit}</span>
        </motion.span>
      </div>

      <div className="flex items-center gap-4">
        {/* Min Label */}
        <span className="text-xs font-medium text-gray-400 w-12 text-right">
          {min} {unit}
        </span>

        {/* Slider Track */}
        <div className="relative flex-1 h-2">
          {/* Background Track */}
          <div className="absolute inset-0 rounded-full bg-gray-200" />

          {/* Active Fill Track */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-teal-500"
            style={{ width: `${percentage}%` }}
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Invisible Input for Accessibility/Interaction */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {/* Thumb (Knob) */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-[5px] border-teal-500 shadow-lg pointer-events-none z-20"
            style={{ left: `calc(${percentage}% - 14px)` }}
            initial={false}
            animate={{ left: `calc(${percentage}% - 14px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Max Label */}
        <span className="text-xs font-medium text-gray-400 w-12">
          {max} {unit}
        </span>
      </div>
    </div>
  );
};