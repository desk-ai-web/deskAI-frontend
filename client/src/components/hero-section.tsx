import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import initialViewImage from "@/assets/initial_view.png";

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-bg opacity-5"></div>
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            Fixing your <span className="gradient-text">bad screen habits</span>
          </h1>
          <p className="text-2xl lg:text-3xl text-gray-600 mb-8 font-light">
            without breaking your flow
          </p>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg text-gray-700">Tracks your screen habits via webcam</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg text-gray-700">Smart reminders that adapt to your workflow</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg text-gray-700">100% private - data never leaves your device</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* <Button 
              size="lg"
              className="gradient-bg hover:opacity-90 text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Free Trial
            </Button> */}
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => window.open('/downloads', '_blank')}
            >
              Download Now
            </Button>
          </div>
        </div>
        
        <div className="relative">
          {/* Modern workspace setup image */}
          <img 
            src={initialViewImage}
            alt="DeskAI application interface showing blink tracking and posture monitoring" 
            className="rounded-2xl shadow-2xl max-h-[580px] object-contain mx-auto" 
          />
          
          {/* Floating UI elements */}
          <div className="absolute -top-4 -right-4 glass rounded-2xl p-4 animate-float" style={{animationDelay: '1s'}}>
            <div className="w-8 h-8 text-primary mb-2 mx-auto">👁️</div>
            <p className="text-sm font-semibold">Blink Tracking</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
          
          <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 animate-float" style={{animationDelay: '2s'}}>
            <div className="w-8 h-8 text-secondary mb-2 mx-auto">✓</div>
            <p className="text-sm font-semibold">Posture Check</p>
            <p className="text-xs text-gray-600">Good</p>
          </div>
        </div>
      </div>
    </section>
  );
}
