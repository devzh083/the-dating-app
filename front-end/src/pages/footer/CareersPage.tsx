import React from "react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Code, PenTool, TrendingUp, MapPin } from "lucide-react";

const jobs = [
  { title: "Senior React Developer", team: "Engineering", location: "Hyderabad, India", icon: Code },
  { title: "Product Designer", team: "Design", location: "Hyderabad, India", icon: PenTool },
  { title: "Marketing Manager", team: "Growth", location: "Remote (India)", icon: TrendingUp },
  { title: "Backend Engineer (Python)", team: "Engineering", location: "Hyderabad, India", icon: Code },
];

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex flex-col">
      <TopBar />
      
      {/* Hero */}
      <div className="bg-teal-600 text-white py-20 md:py-32 px-4 text-center rounded-b-[40px] md:rounded-b-[60px] shadow-lg mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Build the Future of Dating</h1>
        <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
          Join us at our HQ in Hyderabad or work remotely. We're on a mission to create meaningful connections.
        </p>
      </div>

      {/* Jobs List */}
      <div className="flex-1 max-w-4xl mx-auto px-4 w-full pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Open Positions</h2>
        
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl hidden md:block">
                    <job.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-md font-medium text-gray-600">{job.team}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-teal-600 font-bold text-sm md:text-base group-hover:underline">
                Apply Now <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 bg-white rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">Don't see your role?</p>
            <p className="text-sm text-gray-500 mt-1">Send your resume to <span className="text-teal-600 font-bold">careers@thedatingapp.com</span></p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareersPage;