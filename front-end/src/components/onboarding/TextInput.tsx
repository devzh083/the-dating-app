import { cn } from "@/lib/utils";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  label,
  icon,
}: TextInputProps) {
  const isActive = value.trim().length > 0;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
          "bg-white",
          isActive
            ? "border-[#00bcd4] bg-[#eaf9fc]"
            : "border-gray-300",
          "focus-within:border-[#00bcd4] focus-within:bg-[#eaf9fc]"
        )}
      >
        {icon}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
