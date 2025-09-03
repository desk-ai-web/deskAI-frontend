import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      
      {/* CTA Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Start fixing your screen habits in less than 5 minutes
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Be among the first to transform your screen habits and improve your workspace wellness with desk.ai
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => isAuthenticated ? setLocation('/dashboard') : setLocation('/auth')}
              className="bg-white text-primary px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </button>
            <button 
              onClick={() => setLocation('/downloads')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-primary transition-all"
            >
              Download Now
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
