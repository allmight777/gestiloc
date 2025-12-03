import { Hero } from "@/components/home/Hero";
import { Steps } from "@/components/home/Steps";
import { Features } from "@/components/home/Features";
import { Stats } from "@/components/home/Stats";
import { PressLogos } from "@/components/home/PressLogos";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <Steps />
      <Features />
      <Stats />
    </>
  );
}
