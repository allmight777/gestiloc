import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  );
}
