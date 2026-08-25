import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WorkoutBuilder from "@/components/WorkoutBuilder/WorkoutBuilder";
import HowItWorks from "@/components/HowItWorks";
import WhyGymlot from "@/components/WhyGymlot";
import Features from "@/components/Features";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <WorkoutBuilder />
      <HowItWorks />
      <WhyGymlot />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
