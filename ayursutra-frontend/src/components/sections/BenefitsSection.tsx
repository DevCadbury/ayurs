"use client";
import { motion, useInView } from "framer-motion";
import { Users, Shield, Heart, Sparkles, Zap, Star } from "lucide-react";
import { useRef } from "react";

const benefits = [
  {
    icon: Users,
    title: "Multi-Role Support",
    description:
      "Dedicated dashboards for patients, therapists, and administrators.",
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-100 to-purple-100",
    features: ["Patient Portal", "Therapist Dashboard", "Admin Panel"],
    stats: "3 User Types",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "HIPAA-compliant data handling with enterprise-grade security.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-100 to-emerald-100",
    features: ["HIPAA Compliant", "End-to-End Encryption", "Regular Audits"],
    stats: "99.9% Uptime",
  },
  {
    icon: Heart,
    title: "Patient-Centric",
    description: "Focus on holistic wellness with personalized care plans.",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-100 to-rose-100",
    features: ["Personalized Plans", "Progress Tracking", "Wellness Insights"],
    stats: "100% Patient Focus",
  },
];

export default function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="py-32 bg-gradient-to-br from-white via-purple-50 to-indigo-50 relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 40, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-r from-indigo-100/20 to-blue-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            x: [0, -35, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 3
          }}
        />
        
        {/* Floating benefit icons */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 text-purple-300/40"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i * 10}%`,
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 15, -15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            <Star className="w-full h-full" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="px-6 py-3 text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 rounded-full shadow-lg inline-flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Core Benefits
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl font-bold text-gray-900 mb-6 text-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            Why Choose{" "}
            <motion.span
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
              animate={isInView ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              AyurSutra?
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            Built specifically for Panchakarma centers with deep understanding
            of traditional healing practices.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.8 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 8,
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="text-center perspective-1000 group relative"
            >
              {/* Card container with enhanced styling */}
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 overflow-hidden">
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                />
                
                {/* Icon container with enhanced animations */}
                <motion.div
                  whileHover={{ 
                    rotate: 360, 
                    scale: 1.15,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{ duration: 0.6 }}
                  className={`relative mx-auto w-24 h-24 bg-gradient-to-br ${benefit.bgColor} rounded-2xl flex items-center justify-center mb-8 shadow-lg hover-glow`}
                >
                  <benefit.icon
                    className={`w-12 h-12 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}
                  />
                  
                  {/* Floating particles around icon */}
                  {[...Array(4)].map((_, j) => (
                    <motion.div
                      key={j}
                      className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      style={{
                        left: `${15 + j * 20}%`,
                        top: `${15 + j * 15}%`,
                      }}
                      animate={{
                        y: [0, -15, 0],
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2 + j * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: j * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
                
                {/* Title with animated underline */}
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 mb-4 text-shadow relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.8 + i * 0.2 }}
                >
                  {benefit.title}
                  <motion.div
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r ${benefit.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "60%" } : { width: 0 }}
                    transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
                  />
                </motion.h3>
                
                {/* Description */}
                <motion.p 
                  className="text-gray-600 leading-relaxed text-lg mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 1.2 + i * 0.2 }}
                >
                  {benefit.description}
                </motion.p>
                
                {/* Features list */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 1.4 + i * 0.2 }}
                  className="space-y-3 mb-6"
                >
                  {benefit.features.map((feature, j) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ delay: 1.6 + i * 0.2 + j * 0.1 }}
                      className="flex items-center text-sm text-gray-600"
                    >
                      <motion.div
                        className={`w-2 h-2 bg-gradient-to-r ${benefit.color} rounded-full mr-3`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: j * 0.3,
                        }}
                      />
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Stats badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ delay: 1.8 + i * 0.2 }}
                  className="inline-block"
                >
                  <div className={`px-4 py-2 bg-gradient-to-r ${benefit.color} text-white text-sm font-semibold rounded-full shadow-lg`}>
                    {benefit.stats}
                  </div>
                </motion.div>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
