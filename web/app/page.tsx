import HeroDemoFirst from "@/components/HeroDemoFirst";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import PrivacyExplainer from "@/components/PrivacyExplainer";

export default function Home() {
  return (
    <main className="dark flex min-h-screen flex-col bg-background text-foreground selection:bg-accent selection:text-white">
      <HeroDemoFirst />
      <PrivacyExplainer />
      <Features />
      <Footer />
    </main>
  );
}
