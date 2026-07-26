import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Section Data for Sidebar Navigation
const SECTIONS = [
  { id: "intro", title: "Introduction" },
  { id: "collect", title: "1. What We Collect" },
  { id: "use", title: "2. How We Use Info" },
  { id: "sharing", title: "3. Sharing Info" },
  { id: "rights", title: "4. Your Rights" },
  { id: "storage", title: "5. Storage & Deletion" },
  { id: "security", title: "6. Security" },
  { id: "contact", title: "7. Contact Us" },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("intro");

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar />

      <main className="flex-1 container mx-auto max-w-7xl pt-24 pb-12 px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION (Sticky) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-2">
                <ShieldCheck className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-slate-800">Privacy Policy</h3>
              </div>
              <nav className="space-y-1">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200",
                      activeSection === section.id
                        ? "bg-teal-50 text-teal-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10">
              
              {/* Header */}
              <div className="mb-8 border-b border-gray-100 pb-6">
                <Link 
                  to="/chats" 
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-teal-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to App
                </Link>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                  Privacy Policy
                </h1>
                <p className="text-gray-500 text-sm">
                  Last updated: December 18, 2025
                </p>
              </div>

              {/* Legal Text Content */}
              <div className="space-y-12 text-slate-700 leading-relaxed">
                
                {/* Intro */}
                <section id="intro" className="scroll-mt-32">
                  <p className="mb-4 text-lg font-medium text-slate-900">
                    Welcome to The Dating App Group Privacy Policy. Whether you’re ready to put yourself out there and start dating or just looking for a new friend, we believe every relationship and opportunity should start with respect and equality… especially when it comes to your personal information.
                  </p>
                  <p className="mb-4">
                    This Policy explains how we process your personal information. It applies any time you’re using The Dating App mobile application or desktop version (“App”), and to your use of our “Sites”.
                  </p>
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800 font-medium flex gap-3">
                    <UserCheck className="w-5 h-5 shrink-0" />
                    We are responsible for taking care of all the personal information we collect and you share with us. We are the data “controller” for all personal information collected.
                  </div>
                </section>

                {/* 1. What We Collect */}
                <section id="collect" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    1. What We Collect
                  </h2>
                  <p className="mb-4">When you download the App and create an account, we collect certain information about you to help enhance the App and verify the people using it.</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="font-bold text-slate-800 mb-2">Registration Info</h3>
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                        <li>Name & Username</li>
                        <li>Gender Identity & Sexual Preference</li>
                        <li>Date of Birth</li>
                        <li>Email & Mobile Number</li>
                        <li>Photographs</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-slate-800 mb-2">Device & Location</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                            <li>WiFi access points</li>
                            <li>Longitude / Latitude coordinates</li>
                            <li>Device ID & Model</li>
                            <li>Operating System</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-slate-800 mb-2">Cafe & Booking Activity</h3>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-gray-600">
                            <li>Cafes/restaurants you view or book</li>
                            <li>Booking date, time, and party size</li>
                            <li>Whether a booking is solo or with a match</li>
                        </ul>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    Note: If you link social media accounts (like Instagram or Spotify), we may collect data you choose to share from those platforms.
                  </p>
                </section>

                {/* 2. How We Use Info */}
                <section id="use" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    2. How We Use Your Information
                  </h2>
                  <p className="mb-4">Our main goal: give you an enjoyable experience as you connect. We use your data to:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li><strong>Offer Services:</strong> Provide features, updates, and customer support.</li>
                    <li><strong>Matching Algorithms:</strong> We use your profile data, activity, and location to predict compatibility and recommend connections.</li>
                    <li><strong>Safety & Moderation:</strong> Automated systems and human moderators review content to prevent fraud, harassment, and illegal activities.</li>
                    <li><strong>Marketing:</strong> If you consent, we send offers and promotions relevant to you.</li>
                  </ul>
                </section>

                {/* 3. Sharing Info */}
                <section id="sharing" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    3. Sharing Your Information
                  </h2>
                  <p className="mb-4">We do not sell your personal data. However, we share data with trusted third parties to operate our services:</p>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-teal-500 bg-gray-50 pl-4">
                        <strong>Service Providers:</strong> For billing (Razorpay), authentication (SMS/email), and customer support hosting.
                    </div>
                    <div className="p-3 border-l-4 border-teal-500 bg-gray-50 pl-4">
                        <strong>Partner Cafes:</strong> When you book a table, we share your name, contact details, and booking time with the venue so they can honor your reservation.
                    </div>
                    <div className="p-3 border-l-4 border-teal-500 bg-gray-50 pl-4">
                        <strong>Legal Enforcement:</strong> We cooperate with law enforcement if required by law or to protect the safety of any person.
                    </div>
                    <div className="p-3 border-l-4 border-teal-500 bg-gray-50 pl-4">
                        <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.
                    </div>
                  </div>
                </section>

                {/* 4. Your Rights */}
                <section id="rights" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-teal-500" />
                    4. Your Rights
                  </h2>
                  <p className="mb-4">You generally have the following rights regarding your personal information:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ <strong>Right to Access:</strong> Request a copy of your data.</li>
                        <li>✅ <strong>Right to Rectify:</strong> Correct inaccurate info.</li>
                        <li>✅ <strong>Right to Erase:</strong> Delete your personal info.</li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ <strong>Right to Restrict:</strong> Limit how we use your data.</li>
                        <li>✅ <strong>Right to Portability:</strong> Get your data in a portable format.</li>
                        <li>✅ <strong>Right to Complain:</strong> Contact data privacy authorities.</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-4 bg-orange-50 text-orange-800 rounded-xl text-sm border border-orange-100">
                    <strong>California Residents:</strong> You have specific rights under the CCPA (Right to Know, Right to Delete). Contact support to exercise these rights.
                  </div>
                </section>

                {/* 5. Storage & Deletion */}
                <section id="storage" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    5. Storage & Deletion
                  </h2>
                  <p className="mb-4">
                    We keep your info only as long as necessary. If you delete your account, we ensure it is no longer viewable on the App.
                  </p>
                  <p className="mb-4 text-gray-600">
                    We retain data for <strong>28 days</strong> after deletion request in case you change your mind, after which the deletion process begins. We may keep certain data longer for legal, tax, or safety reasons (e.g., banned accounts).
                  </p>
                </section>

                {/* 6. Security */}
                <section id="security" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-teal-500" />
                    6. Security
                  </h2>
                  <p className="mb-4">
                    We pride ourselves on taking appropriate security measures to help protect your information against loss, misuse, and unauthorized access.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li>We use secured servers with firewalls.</li>
                    <li>Data is encrypted in transit.</li>
                    <li>We regularly review our security practices.</li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    However, no website is 100% secure. Always keep your password confidential and log out after use.
                  </p>
                </section>

                {/* 7. Contact */}
                <section id="contact" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    7. Contact Us
                  </h2>
                  <p className="mb-4">
                    If you have questions about this Policy or want to exercise your rights, please contact our Data Protection Officer.
                  </p>
                  <div className="bg-slate-900 text-white p-6 rounded-2xl">
                    <p className="font-bold text-lg mb-2">The Dating App Group</p>
                    <p className="text-slate-300 mb-1">Email: <a href="mailto:privacy@thedatingapp.com" className="text-teal-400 hover:underline">privacy@thedatingapp.com</a></p>
                    <p className="text-slate-300">Address: 1 Tech Plaza, Silicon Valley, CA, USA</p>
                  </div>
                </section>

                <div className="pt-8 mt-12 border-t border-gray-100 text-center">
                  <p className="text-gray-400 text-sm">
                    © 2026 The Dating App Group. All Rights Reserved.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}