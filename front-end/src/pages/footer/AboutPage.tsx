import React from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Heart, Globe, Users, MapPin } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col">
      <TopBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-teal-50 to-white py-16 md:py-24 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6">
          Making Dating <span className="text-teal-600">Human</span> Again
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Born in the heart of Hyderabad, we are building the future of authentic connections for India and the world.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { icon: Heart, title: "10M+", desc: "Matches Made" },
            { icon: Users, title: "5M+", desc: "Active Users" },
            { icon: MapPin, title: "Hyderabad", desc: "Our Home Base" },
          ].map((item, i) => (
            <div key={i} className="text-center p-8 border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="flex-1 max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
        <div className="prose prose-lg text-gray-600 space-y-6">
          <p>
            Founded in <strong>Hitech City, Hyderabad</strong>, The Dating App was born from a simple frustration: dating apps felt like video games, not pathways to connection. We were tired of the endless swiping that led nowhere.
          </p>
          <p>
            We wanted to build a space where personality shines brighter than a profile picture. A place where "Hi" turns into a conversation, not a ghosting session.
          </p>
          <p>
            Today, we are a diverse team of engineers, designers, and die-hard romantics working out of our office in Telangana, helping millions of people find their person.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;