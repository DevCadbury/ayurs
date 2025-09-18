"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import UserProfile from "@/components/UserProfile";
import LoginForm from "@/components/auth/LoginForm";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { uid } = useAuthStore();
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.95)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-indigo-300/50 shadow-lg"
    >
      {/* Subtle overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center group">
              <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20 hover:bg-white hover:shadow-xl transition-all duration-200 group-hover:scale-105 relative w-8 h-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/logo.png"
                  alt="AyurSutra"
                  fill
                  sizes="32px"
                  className="object-contain transition-transform duration-200"
                  priority
                />
              </motion.div>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {["Features", "Pricing", "About", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-gray-800 hover:text-indigo-600 transition-colors duration-300 font-semibold hover-glow text-shadow"
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {uid ? (
              <UserProfile />
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowLoginForm(true)}
                  className="hover:bg-indigo-50 hover-glow text-gray-800 font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover-glow"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            {["Features", "Pricing", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-gray-800 hover:text-indigo-600 transition-colors duration-300 hover-glow font-semibold text-shadow"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              {uid ? (
                <div className="space-y-2">
                  <UserProfile />
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowLoginForm(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-gray-800 font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLoginForm(true);
                      setIsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover-glow"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Login Form Dialog */}
      {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
    </motion.nav>
  );
}
