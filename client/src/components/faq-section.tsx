import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is my webcam data really private?",
      answer: "Yes, absolutely. All video processing happens locally on your device using advanced computer vision. No webcam data, images, or video ever leaves your computer. We only store anonymized usage statistics to help improve the app."
    },
    {
      question: "What platforms are supported?",
      answer: "desk.ai is available for macOS, Windows, and Linux. The app runs natively on each platform and requires a webcam for full functionality. We support the latest versions of each operating system."
    },
    {
      question: "How much system resources does it use?",
      answer: "desk.ai is optimized for minimal resource usage. It typically uses less than 2% CPU and 50MB RAM, running efficiently in the background without impacting your work performance."
    },
    {
      question: "Can I customize the reminders?",
      answer: "Absolutely! You can adjust reminder frequency, sensitivity levels, and choose different reminder styles. The Pro version offers advanced customization options, and the app learns your preferences to adapt to your workflow over time."
    },
    {
      question: "Do I need to keep the app running all the time?",
      answer: "desk.ai is designed to run in the background and only actively monitors when you're working. You can easily pause tracking when needed, and the app will automatically resume when you return to work."
    },
    {
      question: "What's the difference between the free and paid versions?",
      answer: "The free version includes basic blink tracking and simple reminders. Pro adds advanced AI tracking, posture monitoring, detailed analytics, multi-screen support, and customizable settings. Team plans include collaboration features and admin controls."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about desk.ai
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="glass border-0 hover-lift">
              <CardContent className="p-0">
                <button
                  className="w-full text-left p-6 flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-xl font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Help */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.open('mailto:support@deskflow.app', '_blank')}
              className="text-primary hover:underline"
            >
              Contact Support
            </button>
            <button 
              onClick={() => window.open('https://docs.deskflow.app', '_blank')}
              className="text-primary hover:underline"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
