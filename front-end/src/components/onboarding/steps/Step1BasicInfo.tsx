import { User, Calendar, Sparkles } from "lucide-react";

// ✅ FIXED IMPORTS: pointing to the parent 'onboarding' folder
import StepLayout from "../StepLayout"; 
import { TextInput } from "../TextInput"; 
import { DatePicker } from "../DatePicker"; 
import { AnimatedGenderButton } from "../AnimatedGenderButton"; 

interface Step1Props {
  data: {
    firstName: string;
    dateOfBirth: Date | null;
    gender: string;
  };
  onChange: (data: Partial<Step1Props["data"]>) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export default function Step1BasicInfo({
  data,
  onChange,
  onNext,
  onSkip,
}: Step1Props) {
  // Check if form is valid
  const canProceed =
    data.firstName.trim() !== "" && !!data.dateOfBirth && data.gender !== "";

  return (
    <StepLayout
      currentStep={1}
      totalSteps={10}
      title="Let's start with the basics"
      subtitle="We need a few details to set up your profile"
      onNext={onNext}
      onSkip={onSkip}
      canProceed={canProceed}
      showBack={false}
    >
      <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. First Name */}
        <div className="space-y-2">
           <TextInput
            value={data.firstName}
            onChange={(firstName) => onChange({ firstName })}
            placeholder="Enter your first name"
            label="First Name"
            icon={<User className="w-5 h-5 text-teal-500" />}
          />
        </div>

        {/* 2. Date of Birth */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-teal-500" />
            Date of birth
          </label>
          
          <div className="relative">
            <DatePicker
              value={data.dateOfBirth ?? undefined}
              onChange={(date) => onChange({ dateOfBirth: date ?? null })}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 animate-pulse" />
            <p className="text-xs text-slate-500 font-medium leading-tight">
              Don't worry, we only show your age, not your exact birthday.
            </p>
          </div>
        </div>

        {/* 3. Gender Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-800">
            I identify as
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {["Man", "Woman"].map((option) => (
              <AnimatedGenderButton
                key={option}
                label={option}
                isSelected={data.gender === option}
                onClick={() => onChange({ gender: option })}
              />
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}