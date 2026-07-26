import { Shield, Lock, UserCheck, Eye, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: Shield,
    title: "Profile Verification",
    description: "All profiles are verified for authenticity",
    color: "bg-emerald-500",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your conversations are always private",
    color: "bg-indigo-500",
  },
  {
    icon: UserCheck,
    title: "ID Verification",
    description: "Optional ID check for extra trust",
    color: "bg-violet-500",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "You decide who sees your profile",
    color: "bg-rose-500",
  },
];

const SecurityBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-100 shadow-sm h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            Your Safety Matters
          </h3>
          <p className="text-sm text-gray-500">
            Industry-leading security standards
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <div
              className={`w-10 h-10 rounded-lg ${feature.color}
                          flex items-center justify-center mb-3 text-white shadow-sm`}
            >
              <feature.icon className="w-5 h-5" />
            </div>

            <p className="font-semibold text-sm text-gray-900 mb-1">
              {feature.title}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer badges */}
      <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-gray-100">
        {["GDPR Compliant", "256-bit SSL", "24/7 Monitoring"].map(
          (badge, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500"
            >
              <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
              <span>{badge}</span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

export default SecurityBanner;