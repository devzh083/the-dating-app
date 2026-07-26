import { useEffect, useRef } from "react";
import Datepicker from "flowbite-datepicker/Datepicker";
import { Calendar as CalendarIcon } from "lucide-react"; 

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
  const datepickerRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<any>(null); // 'any' avoids TS errors

  useEffect(() => {
    const inputElement = datepickerRef.current;
    if (!inputElement) return;

    // 1. Initialize Flowbite Datepicker
    instanceRef.current = new Datepicker(inputElement, {
      autohide: true,
      format: "mm/dd/yyyy",
      orientation: "bottom", // Forces it to open downwards
      buttons: true,         // Adds "Today" / "Clear"
      autoSelectToday: 0,
      // ✅ FIX: Renders the popup at the body level to prevent it from being 
      // clipped or hidden by the onboarding card's overflow
      container: 'body',     
    });

    // 2. Handle Date Selection
    const handleDateChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      
      if (!target.value) {
        if (onChange) onChange(null);
        return;
      }

      const selectedDate = new Date(target.value);
      if (!isNaN(selectedDate.getTime()) && onChange) {
        onChange(selectedDate);
      }
    };

    inputElement.addEventListener("changeDate", handleDateChange);
    
    // Cleanup
    return () => {
      inputElement.removeEventListener("changeDate", handleDateChange);
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      // Manually cleanup any leftover datepicker containers in body
      const pickers = document.querySelectorAll('.datepicker');
      pickers.forEach(picker => picker.remove());
    };
  }, [onChange]);

  // 3. Sync State -> Input
  useEffect(() => {
    if (datepickerRef.current && instanceRef.current) {
      if (value) {
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        const yyyy = value.getFullYear();
        const formatted = `${mm}/${dd}/${yyyy}`;
        
        if (datepickerRef.current.value !== formatted) {
            instanceRef.current.setDate(value); 
        }
      } else if (datepickerRef.current.value !== "") {
          instanceRef.current.setDate({ clear: true });
      }
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        <CalendarIcon className="w-5 h-5 text-teal-500" />
      </div>
      <input
        ref={datepickerRef}
        type="text"
        className="w-full ps-12 p-4 bg-white border-2 border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-colors cursor-pointer hover:border-teal-200"
        placeholder={placeholder}
        autoComplete="off"
        // Prevent manual typing
        onKeyDown={(e) => e.preventDefault()} 
      />
    </div>
  );
}