import React from "react";

const PremiumBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl p-6 shadow-xl w-full h-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="text-[10px] md:text-xs font-semibold uppercase opacity-90 tracking-widest">Premium</div>
        <h3 className="text-lg md:text-xl font-bold mt-1 leading-tight">Get your best matches</h3>
        <p className="text-xs md:text-sm mt-1 opacity-90">See who likes you • Unlimited views</p>
      </div>

      <button className="w-full md:w-auto bg-white text-orange-600 px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-sm hover:bg-orange-50 transition-colors">
        Upgrade Now →
      </button>
    </div>
  );
};

export default PremiumBanner;