import React from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, Lock, Globe, Newspaper, BookOpen, AlertTriangle } from "lucide-react";

interface LegalPageProps {
  type: "privacy" | "terms" | "cookies" | "ip" | "safety" | "guidelines" | "press" | "blog";
}

const contentMap: Record<string, { title: string; icon: any; date: string; content: React.ReactNode }> = {
  privacy: {
    title: "Privacy Policy",
    icon: Lock,
    date: "January 20, 2026",
    content: (
      <>
        <p className="lead">Your privacy is at the core of the The Dating App experience. This policy describes how we collect, use, and share your personal information.</p>
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users.</p>
        <h3>2. How We Use Information</h3>
        <p>We use your information to provide, maintain, and improve our services, match you with other users, and ensure safety within the community.</p>
        <h3>3. Data Storage</h3>
        <p>Your data is securely stored on servers located in India, complying with local data protection regulations.</p>
      </>
    ),
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    date: "January 15, 2026",
    content: (
      <>
        <p className="lead">Welcome to The Dating App. By accessing our platform, you agree to these Terms.</p>
        <h3>1. Eligibility</h3>
        <p>You must be at least 18 years of age to create an account on The Dating App.</p>
        <h3>2. Code of Conduct</h3>
        <p>You agree to treat other users with respect and not to engage in harassment, bullying, or hate speech.</p>
        <h3>3. Jurisdiction</h3>
        <p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</p>
      </>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    icon: Globe,
    date: "December 10, 2025",
    content: <p>We use cookies to improve your experience, remember your preferences, and analyze site traffic to provide better matches.</p>,
  },
  ip: {
    title: "Intellectual Property",
    icon: Shield,
    date: "January 01, 2026",
    content: <p>All content, trademarks, and data on this platform are the property of The Dating App or its licensors. Unauthorized use is strictly prohibited.</p>,
  },
  safety: {
    title: "Safety Center",
    icon: Shield,
    date: "Updated Regularly",
    content: (
      <>
        <p className="lead">Your safety is our priority. Here are tips to stay safe while dating online and offline.</p>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 my-6">
            <h4 className="flex items-center gap-2 text-orange-800 font-bold mb-2"><AlertTriangle className="w-5 h-5"/> Important</h4>
            <p className="text-orange-700 text-sm">Never share financial information or OTPs with anyone on the app.</p>
        </div>
        <ul className="list-disc pl-5 mt-4 space-y-3">
          <li><strong>Keep it on the app:</strong> Keep conversations on the platform initially to utilize our safety features.</li>
          <li><strong>Public Meetings:</strong> Meet in public places for first dates (Cafes, Malls, etc.).</li>
          <li><strong>Tell a Friend:</strong> Tell a friend or family member where you are going and who you are meeting.</li>
        </ul>
      </>
    ),
  },
  guidelines: {
    title: "Community Guidelines",
    icon: BookOpen,
    date: "January 2026",
    content: (
        <>
            <p>We are a community built on kindness. To remain on The Dating App, you must adhere to the following:</p>
            <ul className="space-y-4 mt-6">
                <li className="flex gap-3"><span className="font-bold text-red-500">X</span> No Harassment or Bullying</li>
                <li className="flex gap-3"><span className="font-bold text-red-500">X</span> No Hate Speech</li>
                <li className="flex gap-3"><span className="font-bold text-red-500">X</span> No Nudity or Sexual Content in public profiles</li>
                <li className="flex gap-3"><span className="font-bold text-green-500">✓</span> Be Kind and Respectful</li>
            </ul>
        </>
    ),
  },
  press: {
    title: "Press & News",
    icon: Newspaper,
    date: "Latest",
    content: <p>For press inquiries, please contact <strong>press@thedatingapp.com</strong>. We are making headlines across India for our unique approach to safe dating.</p>,
  },
  blog: {
    title: "The Dating App Blog",
    icon: BookOpen,
    date: "Latest Stories",
    content: (
        <div className="text-center py-12">
            <p className="text-xl font-bold text-gray-800">Coming Soon!</p>
            <p className="text-gray-600 mt-2">We are writing stories about successful matches, dating advice, and features.</p>
        </div>
    ),
  }
};

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const data = contentMap[type];
  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-white pt-20 flex flex-col">
      <TopBar />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="bg-white rounded-[32px] md:shadow-xl md:shadow-gray-200/40 md:border border-gray-100 p-6 md:p-12">
          <div className="flex items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">{data.title}</h1>
              <p className="text-sm text-gray-500 mt-1">Last updated: {data.date}</p>
            </div>
          </div>
          
          <div className="prose prose-teal prose-lg max-w-none text-gray-600 space-y-6">
            {data.content}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalPage;