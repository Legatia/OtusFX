import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import Architecture from "@/components/Architecture";
import Treasury from "@/components/Treasury";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-primary selection:bg-accent selection:text-white relative">
      <Navbar />
      <Background />
      <Hero />
      <Architecture />
      <Treasury />
      <Features />
      <Footer />
    </main>
  );
}
