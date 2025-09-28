"use client";
import PageLayout from "@/components/layout/PageLayout";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24 md:pb-28 lg:pb-32">
        {/* Regular landing page content */}
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </PageLayout>
  );
}
