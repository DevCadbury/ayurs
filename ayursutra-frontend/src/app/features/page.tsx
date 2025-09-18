import PageLayout from "@/components/layout/PageLayout";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";

export default function Features() {
  return (
    <PageLayout>
      <div className="pt-16">
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    </PageLayout>
  );
}

