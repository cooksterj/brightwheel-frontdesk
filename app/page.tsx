import { Footer } from "@/components/marketing/Footer";
import { Gallery } from "@/components/marketing/Gallery";
import { Hero } from "@/components/marketing/Hero";
import { Navbar } from "@/components/marketing/Navbar";
import { Philosophy } from "@/components/marketing/Philosophy";
import { Testimonials } from "@/components/marketing/Testimonials";

export default function Home() {
  return (
    <main className="bg-paper">
      <Navbar />
      <Hero />
      <Philosophy />
      <Gallery />
      <Testimonials />
      <Footer />
    </main>
  );
}
