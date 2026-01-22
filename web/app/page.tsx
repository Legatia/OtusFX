import HeroDemoFirst from "@/components/HeroDemoFirst";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import PrivacyExplainer from "@/components/PrivacyExplainer";
import Architecture from "@/components/Architecture";
import AutoDeleverage from "@/components/AutoDeleverage";
import OtusToken from "@/components/OtusToken";
import FinalCTA from "@/components/FinalCTA";
import EncryptedBackground from "@/components/EncryptedBackground";

export default function Home() {
  return (
    <main className="dark flex min-h-screen flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <EncryptedBackground />
      <HeroDemoFirst />
      <Navbar />
      <PrivacyExplainer />
      <Architecture />
      <AutoDeleverage />
      <Features />
      <OtusToken />
      <FinalCTA />
      <Footer />
    </main>
  );
}
