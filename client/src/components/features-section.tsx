import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Ruler, Monitor, Settings, Spline, Sliders } from "lucide-react";
import multiScreenImage from "@/assets/multi-screen.png";
import tailoredImage from "@/assets/tailored.png";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-light to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Reminders</span> - not distractions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smart detection and gentle reminders that work with your natural workflow
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Eye className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Auto-detects blinking patterns</h3>
                    <p className="text-gray-600">Advanced computer vision tracks your natural blinking rate and reminds you when it's time to blink more</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Ruler className="w-8 h-8 text-secondary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Screen distance monitoring</h3>
                    <p className="text-gray-600">Maintains optimal viewing distance with gentle visual cues that fade as you adjust your position</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Monitor className="w-8 h-8 text-accent mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Multi-screen support</h3>
                    <p className="text-gray-600">Works seamlessly across multiple monitors and different workspace configurations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="relative">
            {/* Eye strain relief image */}
            <img 
              src={multiScreenImage}
              alt="Multi-screen setup showing DeskAI monitoring across multiple displays" 
              className="rounded-2xl shadow-2xl hover-lift w-full" 
            />
          </div>
        </div>
        
        {/* Posture Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            {/* Healthy posture at desk image */}
            <img 
              src={tailoredImage}
              alt="Tailored posture and movement tracking interface showing customizable settings" 
              className="rounded-2xl shadow-2xl hover-lift w-full" 
            />
          </div>
          
          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text">Tailored to you</h2>
            
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Settings className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Auto-calibrated detection</h3>
                    <p className="text-gray-600">Learns your natural posture and workspace setup for personalized monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Spline className="w-8 h-8 text-secondary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Posture & movement tracking</h3>
                    <p className="text-gray-600">Detects slouching and reminds you to move with adaptive timing based on your work patterns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Sliders className="w-8 h-8 text-accent mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Fully customizable</h3>
                    <p className="text-gray-600">Adjust sensitivity, reminder frequency, and detection parameters to match your preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Focus Timer Section */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Combine <span className="gradient-text">focus</span> with habit tracking
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrated Pomodoro timer that adapts to your health habits for optimal productivity
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 text-primary mt-1">▶️</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">One-click focus sessions</h3>
                      <p className="text-gray-600">Start productive work sessions that automatically enable health tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 text-secondary mt-1">📈</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Adaptive timing</h3>
                      <p className="text-gray-600">Work and break durations adjust based on your posture and eye strain levels</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 text-accent mt-1">🔄</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Background operation</h3>
                      <p className="text-gray-600">Runs silently while you work without interrupting your workflow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="relative">
              {/* Focus and productivity image */}
              <img 
                src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Clean organized workspace promoting focus and productivity" 
                className="rounded-2xl shadow-2xl hover-lift w-full" 
              />
              
              {/* Timer UI overlay */}
              <div className="absolute top-8 left-8 glass rounded-2xl p-6 max-w-xs">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">25:00</div>
                  <div className="text-sm text-gray-600 mb-4">Focus Session</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
