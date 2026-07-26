// src/components/onboarding/steps/Step6Location.tsx
import { useState } from "react";
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { MapPin, Navigation, Lock, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingData } from "../OnboardingFlow";
import { cn } from "@/lib/utils";

interface Step6Props {
  data: Pick<OnboardingData, "location" | "useCurrentLocation">;
  onChange: (data: Step6Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const Step6Location = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Step6Props) => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      // Using OpenStreetMap's Nominatim API for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DatingApp/1.0' // Nominatim requires a User-Agent
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location details');
      }
      
      const data = await response.json();
      
      // Extract city name from the response
      const address = data.address;
      const city = address.city || 
                   address.town || 
                   address.village || 
                   address.municipality || 
                   address.county ||
                   'Unknown location';
      
      const country = address.country || '';
      
      return country ? `${city}, ${country}` : city;
    } catch (error) {
      console.error('Error fetching city name:', error);
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`; // Fallback to coordinates
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);

    // First attempt with high accuracy
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('📍 Got coordinates:', latitude, longitude);
          
          // Get city name from coordinates
          const cityName = await getCityFromCoordinates(latitude, longitude);
          console.log('🏙️ City name:', cityName);
          
          onChange({
            location: cityName,
            useCurrentLocation: true,
          });
          
          setIsLoadingLocation(false);
        } catch (error) {
          console.error('Error processing location:', error);
          setLocationError('Failed to get your location details');
          setIsLoadingLocation(false);
        }
      },
      // Error callback
      (error) => {
        console.error('Geolocation error:', error);
        
        // If high accuracy times out, try again with lower accuracy
        if (error.code === 3) { // TIMEOUT
          console.log('⏱️ High accuracy timed out, trying with lower accuracy...');
          
          navigator.geolocation.getCurrentPosition(
            // Success callback for second attempt
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                console.log('📍 Got coordinates (low accuracy):', latitude, longitude);
                
                const cityName = await getCityFromCoordinates(latitude, longitude);
                console.log('🏙️ City name:', cityName);
                
                onChange({
                  location: cityName,
                  useCurrentLocation: true,
                });
                
                setIsLoadingLocation(false);
              } catch (error) {
                console.error('Error processing location:', error);
                setLocationError('Failed to get your location details');
                setIsLoadingLocation(false);
              }
            },
            // Error callback for second attempt
            (error2) => {
              console.error('Second geolocation attempt failed:', error2);
              setIsLoadingLocation(false);
              
              switch (error2.code) {
                case 1: // PERMISSION_DENIED
                  setLocationError('Location permission denied. Please enable location access in your browser settings.');
                  break;
                case 2: // POSITION_UNAVAILABLE
                  setLocationError('Location information is unavailable. Please enter your city manually.');
                  break;
                case 3: // TIMEOUT
                  setLocationError('Location request timed out. Please try again or enter your city manually.');
                  break;
                default:
                  setLocationError('Could not get your location. Please enter your city manually.');
              }
            },
            {
              enableHighAccuracy: false, // Use lower accuracy for faster response
              timeout: 15000, // Give it more time (15 seconds)
              maximumAge: 60000 // Accept cached location up to 1 minute old
            }
          );
        } else {
          // Handle other errors immediately
          setIsLoadingLocation(false);
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              setLocationError('Location permission denied. Please enable location access in your browser settings.');
              break;
            case 2: // POSITION_UNAVAILABLE
              setLocationError('Location information is unavailable. Please enter your city manually.');
              break;
            default:
              setLocationError('Could not get your location. Please enter your city manually.');
          }
        }
      },
      {
        enableHighAccuracy: true, // Try high accuracy first
        timeout: 8000, // 8 second timeout for first attempt
        maximumAge: 30000 // Accept cached location up to 30 seconds old
      }
    );
  };

  return (
    <StepLayout
      currentStep={6}
      totalSteps={10}
      title="Where are you?"
      subtitle="Help us show you people nearby"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      canProceed={data.location.trim() !== "" || data.useCurrentLocation}
    >
      <div className="space-y-8">
        {/* Bouncing Visual Icon - Solid Teal */}
        <div className="flex justify-center py-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-200"
          >
            <MapPin className="w-10 h-10 text-white fill-white" />
          </motion.div>
        </div>

        {/* Location Input */}
        <div className="space-y-6">
          <div className={cn(isLoadingLocation && "opacity-50 pointer-events-none")}>
            <TextInput
              value={data.location}
              onChange={(location) =>
                onChange({ ...data, location, useCurrentLocation: false })
              }
              placeholder="Enter your city"
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-sm font-medium text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Use Current Location Button */}
          <motion.button
            whileHover={{ scale: isLoadingLocation ? 1 : 1.01 }}
            whileTap={{ scale: isLoadingLocation ? 1 : 0.98 }}
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-4 rounded-xl border-2 transition-all duration-200 font-semibold outline-none",
              isLoadingLocation && "opacity-70 cursor-not-allowed",
              data.useCurrentLocation && !isLoadingLocation
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-teal-100 text-teal-600 hover:bg-teal-50 hover:border-teal-200 bg-white"
            )}
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Getting your location...</span>
              </>
            ) : (
              <>
                <Navigation className={cn(
                  "w-5 h-5", 
                  data.useCurrentLocation ? "fill-teal-700" : ""
                )} />
                <span>Use my current location</span>
              </>
            )}
          </motion.button>

          {/* Error Message */}
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4"
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Location unavailable
                  </p>
                  <p className="text-sm text-amber-800">
                    {locationError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Privacy Note - Light Teal Box */}
        <div className="mt-8 bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-teal-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                Your privacy is protected
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                We use your location to show you people nearby. Your exact
                location is never shared with other users.
              </p>
            </div>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            💡 Tip: Having trouble with location?
          </p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>• Make sure location services are enabled in your browser</li>
            <li>• Check if your device's location is turned on</li>
            <li>• You can always enter your city manually instead</li>
          </ul>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step6Location;