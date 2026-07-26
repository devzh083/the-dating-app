import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Shield,
  FileText,
  Sparkles,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// ✅ Import the new internal image component
import { MenuFooterImage } from "@/components/layout/MenuFooterImage";

interface ProfileDropdownProps {
  userName: string;
  userPhoto: string | null;
  onLogout?: () => void;
}

export default function ProfileDropdown({ userName, userPhoto, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    onLogout?.();
    setIsOpen(false);
    navigate("/");
  };

  // Get initial safely
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 ml-2 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md hover:bg-teal-600 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 overflow-hidden ring-2 ring-white active:scale-95"
      >
        {userPhoto ? (
          <img 
            src={userPhoto} 
            alt={userName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay (Backdrop) */}
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] sm:hidden" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              // Mobile: Fixed centered / Desktop: Absolute right aligned
              className="
                fixed top-24 left-1/2 -translate-x-1/2 w-[90vw] 
                sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-3 sm:w-80 
                bg-white rounded-3xl shadow-2xl border border-gray-100 py-2 z-[100] overflow-hidden font-sans
              "
            >
              {/* Header with Profile Photo */}
              <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-sm overflow-hidden shrink-0 border-2 border-white">
                    {userPhoto ? (
                      <img 
                        src={userPhoto} 
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 font-medium">View your profile</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-gray-50 hover:text-teal-600 transition-colors w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-1.5 bg-gray-100 rounded-xl text-gray-500">
                      <User className="w-4 h-4" />
                  </div>
                  Profile Settings
                </Link>

                <Link
                  to="/premium"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-pink-50 hover:text-pink-600 transition-colors w-full text-left group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-1.5 bg-pink-100 rounded-xl text-pink-500 group-hover:text-pink-600">
                      <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="flex-1">Get Premium</span>
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">NEW</span>
                </Link>

                <div className="my-1 border-t border-gray-50"></div>

                <Link
                  to="/privacy"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4 text-gray-400" />
                  Privacy Policy
                </Link>

                <Link
                  to="/terms"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors w-full text-left"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  Terms of Service
                </Link>

                <div className="my-1 border-t border-gray-50"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors w-full text-left mb-1"
                >
                  <LogOut className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                  Sign Out
                </button>

                {/* ✅ Decorative Image Footer (SVG Component) */}
                <div className="relative h-28 w-full rounded-2xl overflow-hidden mt-2 border border-teal-100/50">
                    <MenuFooterImage />
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}