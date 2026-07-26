import React from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { ChevronRight, Search, Shield, User, Heart, Settings, AlertCircle } from "lucide-react";

const categories = [
  { name: "Account Settings", icon: Settings },
  { name: "Matching & Chatting", icon: Heart },
  { name: "Safety & Privacy", icon: Shield },
  { name: "Premium Features", icon: User },
  { name: "Troubleshooting", icon: AlertCircle },
];

const HelpCenterPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col">
      <TopBar />
      
      {/* Search Header */}
      <div className="bg-gray-900 text-white py-16 md:py-24 px-4 text-center rounded-b-[40px] mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">How can we help you?</h1>
        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            className="w-full pl-14 pr-6 py-4 rounded-2xl text-gray-900 outline-none shadow-xl focus:ring-4 focus:ring-teal-500/50 transition-all placeholder:text-gray-400"
            placeholder="Search for articles, topics..."
          />
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 w-full pb-20">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 border border-gray-100 rounded-2xl hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5 transition-all cursor-pointer flex items-center justify-between group bg-white">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-600 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700 group-hover:text-teal-700 transition-colors">{cat.name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {[
                    "How do I change my location?",
                    "Is The Dating App free to use?",
                    "How do I report a fake profile?",
                    "Can I recover a deleted account?"
                ].map((q, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center group transition-colors">
                        <span className="font-medium text-gray-700">{q}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;