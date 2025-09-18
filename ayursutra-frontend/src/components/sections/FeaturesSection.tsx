"use client";
import { motion, useInView } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Activity, BarChart3, Sparkles, Zap, Shield } from "lucide-react";
import { useRef } from "react";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Automated appointment booking with real-time availability and conflict resolution.",
    color: "from-indigo-400 to-purple-400",
    bgColor: "from-indigo-50 to-purple-50",
    features: ["Real-time availability", "Conflict detection", "Auto-reminders"],
    stats: "99.9% uptime",
  },
  {
    icon: Activity,
    title: "Therapy Tracking",
    description:
      "Monitor patient progress with detailed session logs and wellness metrics.",
    color: "from-purple-400 to-pink-400",
    bgColor: "from-purple-50 to-pink-50",
    features: ["Progress tracking", "Wellness metrics", "Session history"],
    stats: "500+ sessions tracked",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive insights into center performance and patient outcomes.",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50",
    features: ["Performance insights", "Patient outcomes", "Revenue tracking"],
    stats: "40% efficiency boost",
  },
];

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="features"
      className="py-32 bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-100/30 to-pink-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
        
        {/* Additional floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-gradient-to-r from-indigo-300/40 to-purple-300/40 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
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
            <Badge className="px-6 py-3 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-5xl font-bold text-gray-900 mb-6 text-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            Everything You Need to{" "}
            <motion.span
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={isInView ? {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Manage Your Center
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            Streamline operations, enhance patient care, and grow your practice
            with our comprehensive platform.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.8 }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
              whileHover={{ 
                y: -15, 
                rotateY: 8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="perspective-1000 group"
            >
              <Card
                className={`h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br ${feature.bgColor} hover-lift relative overflow-hidden`}
              >
                {/* Animated background gradient */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                />
                
                <CardHeader className="text-center pb-6 relative z-10">
                  <motion.div
                    whileHover={{ 
                      rotate: 360, 
                      scale: 1.15,
                      boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)"
                    }}
                    transition={{ duration: 0.6 }}
                    className={`mx-auto w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg hover-glow relative`}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                    
                    {/* Floating particles around icon */}
                    {[...Array(3)].map((_, j) => (
                      <motion.div
                        key={j}
                        className="absolute w-2 h-2 bg-white/60 rounded-full"
                        style={{
                          left: `${20 + j * 30}%`,
                          top: `${20 + j * 20}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2 + j * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: j * 0.3,
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  <CardTitle className="text-2xl font-bold text-gray-900 text-shadow mb-2">
                    {feature.title}
                  </CardTitle>
                  
                  {/* Stats badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ delay: 0.8 + i * 0.2 }}
                    className="inline-block"
                  >
                    <Badge className="px-3 py-1 text-xs bg-white/80 text-gray-700 border border-gray-200 rounded-full">
                      {feature.stats}
                    </Badge>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <CardDescription className="text-center text-gray-600 leading-relaxed text-lg mb-6">
                    {feature.description}
                  </CardDescription>
                  
                  {/* Feature list */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ delay: 1 + i * 0.2 }}
                    className="space-y-2"
                  >
                    {feature.features.map((item, j) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ delay: 1.2 + i * 0.2 + j * 0.1 }}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mr-3"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: j * 0.2,
                          }}
                        />
                        {item}
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
