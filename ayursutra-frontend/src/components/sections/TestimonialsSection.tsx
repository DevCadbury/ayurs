"use client";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Chief Therapist",
    content:
      "AyurSutra has revolutionized our practice. The scheduling system is intuitive and our patients love the mobile app.",
    rating: 5,
    avatar: "PS",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Rajesh Kumar",
    role: "Center Director",
    content:
      "The analytics dashboard gives us insights we never had before. Our efficiency has improved by 40%.",
    rating: 5,
    avatar: "RK",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Anita Patel",
    role: "Patient",
    content:
      "Booking appointments and tracking my therapy progress has never been easier. Highly recommended!",
    rating: 5,
    avatar: "AP",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Dr. Michael Chen",
    role: "Senior Therapist",
    content:
      "The patient management system is incredibly comprehensive. It has streamlined our entire workflow.",
    rating: 5,
    avatar: "MC",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Sarah Johnson",
    role: "Wellness Coordinator",
    content:
      "Our patients love the real-time updates and the ability to track their progress. It's been a game-changer.",
    rating: 5,
    avatar: "SJ",
    color: "from-green-500 to-emerald-500",
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section 
      ref={ref}
      className="py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            x: [0, -30, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
        
        {/* Floating quote icons */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 text-indigo-300/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + i * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <Quote className="w-full h-full" />
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
            <div className="px-6 py-3 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200 rounded-full shadow-lg inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Customer Stories
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl font-bold text-gray-900 mb-6 text-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            What Our{" "}
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
              Users Say
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            Join thousands of satisfied users who trust AyurSutra for their
            practice management.
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial Card */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="relative"
          >
            <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 shadow-2xl bg-white/90 backdrop-blur-sm hover-lift relative overflow-hidden">
              {/* Animated background gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${testimonials[currentIndex].color} opacity-5`}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              />
              
              <CardContent className="p-12 relative z-10">
                {/* Quote icon */}
                <motion.div
                  className="absolute top-6 left-6 text-indigo-300/30"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Quote className="w-16 h-16" />
                </motion.div>

                {/* Rating stars */}
                <div className="flex justify-center mb-8">
                  {[...Array(testimonials[currentIndex].rating)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: j * 0.1 }}
                      whileHover={{ scale: 1.3, rotate: 15 }}
                    >
                      <Star className="w-6 h-6 text-yellow-400 fill-current mx-1" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial content */}
                <motion.p 
                  className="text-gray-700 leading-relaxed mb-8 text-xl text-center max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  "{testimonials[currentIndex].content}"
                </motion.p>

                {/* Author info */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${testimonials[currentIndex].color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {testimonials[currentIndex].avatar}
                    </motion.div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-1">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-600 text-lg">
                    {testimonials[currentIndex].role}
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation buttons */}
          <motion.button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-white transition-all duration-300 z-20"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 hover:bg-white transition-all duration-300 z-20"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "bg-indigo-600 scale-125" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Additional testimonials grid (smaller cards) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.slice(0, 4).map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group cursor-pointer"
              onClick={() => setCurrentIndex(i)}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/70 backdrop-blur-sm hover-lift relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                <CardContent className="p-6 relative z-10">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
