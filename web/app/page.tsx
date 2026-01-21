import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import PrivacyExplainer from "@/components/PrivacyExplainer";
import Architecture from "@/components/Architecture";
import Treasury from "@/components/Treasury";
import AutoDeleverage from "@/components/AutoDeleverage";
import OtusToken from "@/components/OtusToken";
import FinalCTA from "@/components/FinalCTA";
import Navbar from "@/components/Navbar";
import Scene3D from "@/components/Scene3D";
import MatrixRain from "@/components/MatrixRain";

export default function Home() {
  return (
    <main className="dark flex min-h-screen flex-col bg-background text-foreground selection:bg-accent selection:text-white relative">
      {/* Matrix Rain on sides */}
      <MatrixRain />
      {/* 3D Scene - Limited to first viewport only */}
      <div className="fixed top-0 left-0 right-0 h-screen z-0 pointer-events-none">
        <Scene3D />
      </div>
      <Navbar />
      <Background />
      <Hero />
      <PrivacyExplainer />
      <Architecture />
      <Treasury />
      <AutoDeleverage />
      <OtusToken />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
