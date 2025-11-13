import { Card, CardContent } from '@/components/ui/card';
import {
  Eye,
  Ruler,
  Monitor,
  Settings,
  Spline,
  Sliders,
  Play,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import multiScreenVideo from '@/assets/hunch_detection.webm';
import focusTimerVideo from '@/assets/demo_timer_small.webm';
import blinkDetectionVideo from '@/assets/blink_detection.webm';

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-br from-light to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="gradient-text">Reminders</span> - not distractions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Smart detection and gentle reminders that work with your natural
            workflow
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Spline className="w-8 h-8 text-secondary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Posture & movement tracking
                    </h3>
                    <p className="text-gray-600">
                      Detects hunching and stillness in real time — reminding
                      you to move and sit upright
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Eye className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Eye strain monitoring
                    </h3>
                    <p className="text-gray-600">
                      Captures blinking patterns and viewing distance — helping
                      you keep your eyes comfortable and focused
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Ruler className="w-8 h-8 text-secondary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Reactive reminders
                    </h3>
                    <p className="text-gray-600">
                      Provides feedback when a bad habit is detected -
                      disappears when it's improved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            {/* Eye strain relief video */}
            <video
              className="rounded-2xl hover-lift w-full"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={multiScreenVideo} type="video/webm" />
              Demo showing hunch detection on mac.
            </video>
          </div>
        </div>

        {/* Posture Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1 mt-10 flex justify-center">
            {/* Tailored posture and movement tracking video */}
            <video
              className="rounded-2xl hover-lift w-full max-h-[500px] object-contain"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={blinkDetectionVideo} type="video/webm" />
              Blink detection demo video.
            </video>

            {/* Floating annotation box explaining blink detection - positioned at bottom right */}
            <div
              className="absolute -bottom-4 -right-4 glass rounded-xl p-3 max-w-[180px] animate-float shadow-lg"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="flex items-start space-x-2">
                <Eye className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Blink Detection
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-tight">
                    Red overlay indicates detected blinks
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl lg:text-5xl font-bold gradient-text">
              Tailored to you
            </h2>

            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Settings className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Auto-calibrated and fully customizable
                    </h3>
                    <p className="text-gray-600">
                      Learns your posture, movement and blink patterns - and
                      adapts to your preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Sliders className="w-8 h-8 text-accent mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Lightweight in the background
                    </h3>
                    <p className="text-gray-600">
                      Improves your habits while you work - running smoothly in
                      the background
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Monitor className="w-8 h-8 text-accent mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Multi-screen support
                    </h3>
                    <p className="text-gray-600">
                      Works seamlessly across multiple monitors and different
                      webcams
                    </p>
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
              Combine <span className="gradient-text">focus</span> with habit
              tracking
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrated Pomodoro timer that can interact with detection
              functionality
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <Play className="w-8 h-8 text-primary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Synced with active tracking
                      </h3>
                      <p className="text-gray-600">
                        Start productive work sessions that automatically
                        enable/disable habit tracking
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <TrendingUp className="w-8 h-8 text-secondary mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        Sleek and modern
                      </h3>
                      <p className="text-gray-600">
                        Stylish work timer that can stay in the background or
                        float on top of your workspace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-0 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <RefreshCw className="w-8 h-8 text-accent mt-1" />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Just focus</h3>
                      <p className="text-gray-600">
                        The pomodoro timer can be used separately from the
                        detection functionality
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative flex justify-center">
              {/* Focus and productivity video */}
              <video
                className="rounded-2xl shadow-2xl hover-lift w-full max-h-[520px] object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={focusTimerVideo} type="video/webm" />
                Focus timer demo.
              </video>

              {/* <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 max-w-xs animate-float" style={{animationDelay: '1s'}}>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">
                    25:00
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Focus Session
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
