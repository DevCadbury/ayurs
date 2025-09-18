"use client";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Star, Zap, Heart } from "lucide-react";
import { useRef } from "react";
export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with Multiple Layers */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/background.png')",
        }}
      />

      {/* Dynamic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-pink-50/60" />
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-200/30 via-purple-200/20 to-pink-200/10"
      />

      {/* Animated Floating Elements */}
      <div className="absolute inset-0">
        {/* Main floating orbs with enhanced animations */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-indigo-300/20 to-purple-300/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"
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
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -180, -360],
            x: [0, 30, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
        />
        
        {/* Additional floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400/40 to-purple-400/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div 
        style={{ scale, opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Enhanced Badge with Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
            animate={isInView ? { scale: 1, opacity: 1, rotateX: 0 } : { scale: 0.8, opacity: 0, rotateX: -90 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="perspective-1000"
          >
            <Badge
              variant="secondary"
              className="mb-6 px-8 py-4 text-sm bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-700 border-2 border-indigo-200 hover-glow rounded-full shadow-lg backdrop-blur-sm"
            >
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mr-2"
              >
                🧘‍♀️
              </motion.span>
              Traditional Medicine • Modern Technology
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="ml-2"
              >
                ✨
              </motion.span>
            </Badge>
          </motion.div>

          {/* Enhanced Main Title with Staggered Animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold tracking-tight"
          >
            <motion.span 
              className="gradient-text-indigo text-shadow-lg"
              animate={isInView ? { 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{
                background: "linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, #f59e0b, #6366f1)",
                backgroundSize: "400% 400%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AyurSutra
            </motion.span>
          </motion.h1>

          {/* Enhanced Subtitle with Typewriter Effect */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-4xl font-semibold text-gray-700"
          >
            <motion.span
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
              className="inline-block overflow-hidden whitespace-nowrap"
            >
              Panchakarma Patient Management & Therapy Scheduling
            </motion.span>
          </motion.h2>

          {/* Enhanced Description with Highlighted Words */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8 }}
            className="mx-auto max-w-4xl text-xl text-gray-600 leading-relaxed"
          >
            Transform your Panchakarma center with our modern, intuitive
            platform designed for{" "}
            <motion.span 
              className="font-semibold text-indigo-600 relative"
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.2 }}
            >
              patients
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full block"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              />
            </motion.span>,{" "}
            <motion.span 
              className="font-semibold text-purple-600 relative"
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.4 }}
            >
              therapists
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full block"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              />
            </motion.span>,
            and{" "}
            <motion.span 
              className="font-semibold text-pink-600 relative"
              whileHover={{ scale: 1.1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.6 }}
            >
              administrators
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full block"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              />
            </motion.span>.
          </motion.p>

          {/* Enhanced CTA Buttons with Advanced Animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            {/* Primary CTA Button */}
            <Link href="/auth">
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateX: 5,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                className="perspective-1000 relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl px-10 py-5 text-lg font-semibold rounded-2xl relative overflow-hidden"
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  />
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="mr-2"
                    >
                      ✨
                    </motion.span>
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            </Link>

            {/* Secondary CTA Button */}
            <Link href="#features">
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  rotateX: -5,
                  rotateY: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
                whileTap={{ scale: 0.95 }}
                className="perspective-1000 relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 1.4 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-indigo-300 hover:border-indigo-500 hover:text-indigo-600 px-10 py-5 text-lg font-semibold rounded-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Animated border gradient */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      background: [
                        "linear-gradient(45deg, transparent, transparent)",
                        "linear-gradient(45deg, #6366f1, #8b5cf6, #ec4899, transparent)",
                        "linear-gradient(45deg, transparent, transparent)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                      padding: "2px",
                      backgroundClip: "padding-box",
                    }}
                  />
                  
                  <span className="relative z-10 flex items-center">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      🔍
                    </motion.span>
                    Explore Features
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Floating Action Icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.6 }}
            className="flex justify-center items-center gap-8 mt-12"
          >
            {[
              { icon: Sparkles, color: "from-yellow-400 to-orange-400", text: "Innovative" },
              { icon: Heart, color: "from-pink-400 to-rose-400", text: "Caring" },
              { icon: Zap, color: "from-blue-400 to-cyan-400", text: "Fast" },
              { icon: Star, color: "from-purple-400 to-indigo-400", text: "Premium" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0 }}
                transition={{ delay: 1.8 + index * 0.1 }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
                <motion.span
                  className="text-xs text-gray-600 mt-2 font-medium"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 2 + index * 0.1 }}
                >
                  {item.text}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
