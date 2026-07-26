import React from "react";

export const MenuFooterImage = () => {
  return (
    <div className="w-full h-full bg-[#f8fbfb] flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 400 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background Pattern - Subtle Doodles */}
        <g opacity="0.1" stroke="#00C98B" strokeWidth="1.5" strokeLinecap="round">
           {/* Floating Hearts */}
           <path d="M50 30 C50 30 55 20 65 20 C75 20 80 30 50 50 C20 30 25 20 35 20 C45 20 50 30 50 30 Z" />
           <path d="M350 40 C350 40 355 30 365 30 C375 30 380 40 350 60 C320 40 325 30 335 30 C345 30 350 40 350 40 Z" />
           <path d="M320 120 C320 120 322 115 328 115 C334 115 336 120 320 130 C304 120 306 115 312 115 C318 115 320 120 320 120 Z" />
           
           {/* Squiggles/Sparkles */}
           <path d="M30 100 Q 40 90, 50 100 T 70 100" fill="none" />
           <path d="M360 90 L 370 80 M 360 80 L 370 90" />
           <circle cx="200" cy="20" r="2" fill="#00C98B" />
           <circle cx="100" cy="140" r="2" fill="#00C98B" />
        </g>

        {/* Main Hashtag Text */}
        <text
          x="200"
          y="75"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="42"
          fill="#0d9488" /* Teal-600 */
          letterSpacing="-1"
        >
          #TheDatingApp
        </text>

        {/* Subtext Group */}
        <g transform="translate(0, 30)">
            
            {/* Indian Flag Line */}
            <g transform="translate(145, 75)">
                {/* Flag Icon */}
                <rect x="0" y="0" width="18" height="12" rx="1" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
                <rect x="0" y="0" width="18" height="4" rx="1" fill="#FF9933" /> {/* Saffron */}
                <rect x="0" y="8" width="18" height="4" rx="1" fill="#138808" /> {/* Green */}
                <circle cx="9" cy="6" r="2" fill="#000080" /> {/* Ashoka Chakra */}
                
                {/* Text */}
                <text x="24" y="10" fontFamily="Arial, sans-serif" fontSize="12" fill="#0d9488" fontWeight="600">
                    Made in India
                </text>
            </g>

            {/* Hyderabad Line */}
            <g transform="translate(130, 95)">
                {/* Heart Icon */}
                <path 
                    d="M6 3.5 C6 3.5 7 1 9.5 1 C12 1 13 3.5 6 8.5 C-1 3.5 0 1 2.5 1 C5 1 6 3.5 6 3.5 Z" 
                    fill="#F43F5E" 
                    transform="translate(4, 2)"
                />
                
                {/* Text */}
                <text x="24" y="10" fontFamily="Arial, sans-serif" fontSize="12" fill="#0d9488" fontWeight="600">
                    Crafted in Hyderabad
                </text>
            </g>
        </g>
      </svg>
    </div>
  );
};