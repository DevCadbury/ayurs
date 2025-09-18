import PageLayout from "@/components/layout/PageLayout";
import HeroSection from "@/components/sections/HeroSection";
import BenefitsSection from "@/components/sections/BenefitsSection";
import CTASection from "@/components/sections/CTASection";

export default function About() {
  return (
    <PageLayout>
      <div className="pt-16">
        <HeroSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </PageLayout>
  );
}

