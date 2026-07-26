import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Section Data for Sidebar Navigation
const SECTIONS = [
  { id: "intro", title: "Introduction" },
  { id: "rules", title: "1. App Rules" },
  { id: "content", title: "2. Types of Content" },
  { id: "restrictions", title: "3. Restrictions on the App" },
  { id: "safety", title: "4. Safety Policy" },
  { id: "privacy", title: "5. Privacy" },
  { id: "payment", title: "6. Payment Terms" },
  { id: "bookings", title: "6b. Cafe & Table Bookings" },
  { id: "virtual", title: "7. Virtual Items" },
  { id: "disclaimer", title: "8. Disclaimer" },
  { id: "liability", title: "9. Limitation of Liability" },
  { id: "termination", title: "10. Termination" },
  { id: "governing", title: "11. Governing Law" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("intro");

  // Scroll spy to highlight active section in sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for header
      
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
                <ScrollText className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-slate-800">Table of Contents</h3>
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
                  Terms and Conditions of Use
                </h1>
                <p className="text-gray-500 text-sm">
                  Last updated: January 23, 2026
                </p>
              </div>

              {/* Legal Text Content */}
              <div className="space-y-10 text-slate-700 leading-relaxed">
                
                {/* Intro */}
                <section id="intro" className="scroll-mt-32">
                  <p className="mb-4">
                    Welcome to The Dating App’s Terms and Conditions of Use (these “Terms”). This is a contract between you and The Dating App Group and we want you to know yours and our rights before you use The Dating App website or application.
                  </p>
                  <p className="mb-4">
                    Please take a few moments to read these Terms before enjoying the App, because once you access, view or use the App, you are going to be legally bound by these Terms.
                  </p>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800 font-medium">
                    Please note that Section 14 contains provisions governing how claims that you and The Dating App have against each other are resolved, including an arbitration agreement.
                  </div>
                </section>

                {/* 1. Rules */}
                <section id="rules" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">1. The Dating App Rules</h2>
                  <p className="mb-4">
                    Before you can use the App, you will need to register for an account (“Account”). In order to create an Account you must:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li>Be at least 18 years old or the age of majority to legally enter into a contract under the laws of your home country.</li>
                    <li>Be legally permitted to use the App by the laws of your home country.</li>
                  </ul>
                  <p>
                    You cannot share your account with another person. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your Account.
                  </p>
                </section>

                {/* 2. Content */}
                <section id="content" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Types of Content</h2>
                  <p className="mb-4">There are three types of content that you will be able to access on the App:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li><strong>Your Content:</strong> Content that you upload and provide.</li>
                    <li><strong>Member Content:</strong> Content that other members provide.</li>
                    <li><strong>Our Content:</strong> Content that The Dating App provides (software, graphics, etc.).</li>
                  </ul>
                  <p>
                    You agree that Your Content must comply with our Community Guidelines. You indemnify us from any claims made in connection with Your Content.
                  </p>
                </section>

                {/* 3. Restrictions */}
                <section id="restrictions" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Restrictions on the App</h2>
                  <p className="mb-4">You agree that you will not:</p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li>Use the App for any unlawful purpose.</li>
                    <li>Stalk, harass, bully, or mistreat any other user.</li>
                    <li>Impersonate any person or entity.</li>
                    <li>Scrape or copy profiles and data from the services.</li>
                    <li>Post content that is hate speech, threatening, sexually explicit, or pornographic.</li>
                  </ul>
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
                    We reserve the right to investigate and terminate your account if you misuse the Service or behave in a way that we regard as inappropriate or unlawful.
                  </div>
                </section>

                {/* 4. Safety */}
                <section id="safety" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Safety Policy</h2>
                  <p className="mb-4">
                    Safety is a top priority. We use a combination of automated systems and human moderators to monitor accounts. We do not tolerate:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mb-4 text-gray-600">
                    <li>Sexual harassment or non-consensual sexual content.</li>
                    <li>Violence or dangerous organizations.</li>
                    <li>Fraud, scams, or impersonation.</li>
                  </ul>
                  <p>
                    If you encounter bad behavior, please use the <strong>Block & Report</strong> feature immediately.
                  </p>
                </section>

                {/* 5. Privacy */}
                <section id="privacy" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Privacy</h2>
                  <p>
                    For information about how The Dating App collects, uses, and shares your personal data, please check out our <Link to="/privacy" className="text-teal-600 font-bold hover:underline">Privacy Policy</Link>. By using the App, you acknowledge that we may use such data in accordance with our Privacy Policy.
                  </p>
                </section>

                {/* 6. Payment */}
                <section id="payment" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Payment Terms</h2>
                  <p className="mb-4">
                    <strong>Subscriptions:</strong> If you purchase a recurring subscription (e.g., Premium), it will automatically renew at the end of the applicable period unless you cancel 24 hours before the end of the term.
                  </p>
                  <p className="mb-4">
                    <strong>Refunds:</strong> Generally, all charges for purchases are nonrefundable, and there are no refunds or credits for partially used periods, except where required by law.
                  </p>
                </section>

                {/* 6b. Cafe & Table Bookings */}
                <section id="bookings" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Cafe & Table Bookings</h2>
                  <p className="mb-4">
                    The App lets you reserve a table at partner cafes and restaurants, either alone or with a match. We facilitate the booking; the venue itself is responsible for honoring it, seating, food, and service. We are not the merchant of record for anything you order or pay for on-site. Booking discounts shown in the App are offered at our discretion and may change or end at any time.
                  </p>
                </section>

                {/* 7. Virtual Items */}
                <section id="virtual" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Virtual Items</h2>
                  <p>
                    From time to time, you may be able to purchase a limited, personal, non-transferable license to use "Virtual Items" (such as Super Likes or Spotlights). Any Virtual Item balance shown in your account does not constitute a real-world balance or reflect any stored value.
                  </p>
                </section>

                {/* 8. Disclaimer */}
                <section id="disclaimer" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Disclaimer</h2>
                  <p className="uppercase text-sm text-gray-500 leading-relaxed">
                    THE APP, SITE, OUR CONTENT, AND MEMBER CONTENT ARE ALL PROVIDED TO YOU “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THE COMPATIBILITY OF ANY MATCHES. YOUR USE OF THE APP IS AT YOUR OWN RISK.
                  </p>
                </section>

                {/* 9. Liability */}
                <section id="liability" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Limitation of Liability</h2>
                  <p className="uppercase text-sm text-gray-500 leading-relaxed">
                    NEITHER US NOR ANY OWNER WILL BE LIABLE FOR ANY DAMAGES, DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE, INCLUDING, WITHOUT LIMITATION, LOSS OF DATA, INCOME, PROFIT OR GOODWILL, LOSS OF OR DAMAGE TO PROPERTY.
                  </p>
                </section>

                {/* 10. Termination */}
                <section id="termination" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Termination</h2>
                  <p>
                    You can delete your Account at any time by going to the “Settings” tab. We reserve the right to suspend or terminate your account without notice if we believe you have violated these Terms.
                  </p>
                </section>

                {/* 11. Governing Law */}
                <section id="governing" className="scroll-mt-32">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Governing Law</h2>
                  <p>
                    These Terms are governed by the laws of the State of Texas, USA, without regard to its conflict of laws rules.
                  </p>
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