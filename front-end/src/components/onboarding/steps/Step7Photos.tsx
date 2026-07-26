// src/components/onboarding/steps/Step7Photos.tsx
import React, { useState, useEffect } from "react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { Camera, Trash2, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";

interface Step7Props {
  data: Pick<OnboardingData, "photos">;
  onChange: (data: Step7Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const Step7Photos: React.FC<Step7Props> = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}) => {
  // We only care about the first photo for the profile pic
  const [photo, setPhoto] = useState<string | null>(
    data.photos && data.photos.length > 0 ? data.photos[0] : null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync with parent data
  useEffect(() => {
    if (data.photos && data.photos.length > 0) {
      setPhoto(data.photos[0]);
    }
  }, [data.photos]);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Maximum size is 5MB.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/profile/upload-photo/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(errorData.detail || "Upload failed");
      }

      const json = await res.json();
      const url = json.url as string;

      setPhoto(url);
      // We overwrite the photos array to contain ONLY this new photo
      onChange({ photos: [url] });
    } catch (e: any) {
      console.error("Error uploading photo:", e);
      setUploadError(e.message || "Failed to upload photo");
      setTimeout(() => setUploadError(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    onChange({ photos: [] });
  };

  const handleContinue = () => {
    // Logic is handled in state; simply trigger next
    onNext();
  };

  return (
    <StepLayout
      currentStep={7}
      totalSteps={10}
      title="Add a Profile Photo"
      subtitle="Put a face to the name! This will be your main profile picture."
      onBack={onBack}
      onNext={handleContinue}
      onSkip={onSkip}
      // Always allowed to proceed because it is optional
      canProceed={true} 
      nextLabel={photo ? "Looks good, Continue" : "Continue"}
    >
      <div className="flex flex-col items-center space-y-8 py-4">
        
        {/* Upload Error Message */}
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-center"
          >
            <p className="text-sm text-red-600 font-medium">{uploadError}</p>
          </motion.div>
        )}

        {/* Circular Profile Uploader */}
        <div className="relative group">
          
          {/* Animated Ring during upload */}
          {uploading && (
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin z-10" />
          )}

          <div
            className={cn(
              "w-48 h-48 rounded-full overflow-hidden border-4 relative shadow-lg transition-all duration-300",
              photo ? "border-teal-500" : "border-gray-200 bg-gray-50 hover:border-teal-300"
            )}
          >
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="p-4 bg-teal-50 text-teal-600 rounded-full mb-3">
                  <User className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-gray-500">Upload Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    handleFile(e.target.files ? e.target.files[0] : null)
                  }
                  disabled={uploading}
                />
              </label>
            )}

            {/* Overlay Actions (Only when photo exists) */}
            {photo && !uploading && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                {/* Replace Button */}
                <label className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white cursor-pointer hover:bg-white/40 transition-colors" title="Change Photo">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFile(e.target.files ? e.target.files[0] : null)
                    }
                  />
                </label>
                {/* Remove Button */}
                <button
                  onClick={removePhoto}
                  className="p-3 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Edit Icon Badge (if photo exists and not hovering) */}
          {photo && !uploading && (
            <div className="absolute bottom-2 right-2 bg-teal-500 text-white p-2 rounded-full border-4 border-white shadow-sm group-hover:opacity-0 transition-opacity">
              <Camera className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Section to Proceed Without Photo */}
        {!photo && (
          <div className="text-center space-y-4 w-full">
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              A profile photo helps you make better connections, but it's not required right now.
            </p>
            
            <button
              onClick={onNext}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.99]"
            >
              Proceed without profile pic
            </button>
          </div>
        )}

      </div>
    </StepLayout>
  );
};

export default Step7Photos;