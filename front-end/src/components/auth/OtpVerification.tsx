// C:\Users\vikas\dating-webapp\front-end\src\components\auth\OtpVerification.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface OtpVerificationProps {
  email: string;
  apiBaseUrl: string;
  onSuccess: () => void;
  onResend: () => void;
  onBack: () => void;
}

export default function OtpVerification({
  email,
  apiBaseUrl,
  onSuccess,
  onResend,
  onBack,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = () => {
    if (canResend) {
      onResend();
      setResendTimer(30);
      setCanResend(false);
      setErrorMsg(null);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${apiBaseUrl}/login/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          otp: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid OTP code. Please try again.");
      }

      // Save tokens
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user_email", email.toLowerCase());
      }

      setIsSuccess(true);
      
      // Small delay for success animation before redirecting
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 md:p-10 relative overflow-hidden">
        
        {/* Background decorative blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-teal-600 transition-colors mb-8 text-sm font-medium"
        >
          <div className="p-1 rounded-full group-hover:bg-teal-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to login</span>
        </button>

        {/* Icon Area */}
        <div className="flex justify-center mb-8">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500",
            isSuccess ? "bg-green-100" : "bg-teal-50"
          )}>
            {isSuccess ? (
              <CheckCircle2 className="w-10 h-10 text-green-600 animate-in zoom-in duration-300" />
            ) : (
              <Mail className="w-10 h-10 text-teal-600" />
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Check your email
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            We've sent a 6-digit verification code to <br />
            <span className="font-semibold text-slate-800">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-8">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setErrorMsg(null);
            }}
            disabled={isLoading || isSuccess}
          >
            <InputOTPGroup className="gap-2 sm:gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold rounded-xl border-2 transition-all duration-200",
                    "border-gray-100 bg-gray-50/50 text-slate-800",
                    "focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white focus:outline-none",
                    errorMsg && "border-red-200 bg-red-50/30 text-red-600"
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-center"
          >
            <p className="text-xs font-medium text-red-600">{errorMsg}</p>
          </motion.div>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          className={cn(
            "w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-teal-500/20 transition-all duration-300",
            "bg-gradient-to-r from-teal-500 to-teal-600 hover:to-teal-700 text-white",
            "disabled:opacity-70 disabled:cursor-not-allowed"
          )}
          disabled={otp.length !== 6 || isLoading || isSuccess}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified!</span>
            </div>
          ) : (
            "Verify Email"
          )}
        </Button>

        {/* Resend Section */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-xs font-medium">
            Didn't receive the code?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-teal-600 hover:text-teal-700 hover:underline font-bold ml-1 transition-colors"
              >
                Click to resend
              </button>
            ) : (
              <span className="text-slate-500 font-semibold ml-1">
                Resend in {resendTimer}s
              </span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}