import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is my webcam data really private?",
      answer: "Yes! All video processing happens locally on your device. No webcam data, images, or video ever leave your computer."
    },
    {
      question: "What platforms are supported?",
      answer: "desk.ai is available for macOS (Apple), Windows, and Linux. The app runs natively on each platform and requires a webcam for full functionality."
    },
    {
      question: "How much system resources does it use?",
      answer: "desk.ai is optimized for minimal resource usage. It typically uses less than 2% CPU and 50MB RAM, running efficiently in the background without impacting your work performance."
    },
    {
      question: "Can I customize the reminders?",
      answer: "Yes, you can adjust the reminder size and decide the blur intensity of the screen (incl. no blur to only use icon reminders)."
    },
    {
      question: "Do I need to keep the app running all the time?",
      answer: "desk.ai is designed to run in the background while you are working on your computer. The app interface is only used to manage your settings and start the individual trackings."
    },
    {
      question: "What is the difference between the free and paid versions?",
      answer: "The free version includes trial for 7 days. After that, you would need to purchase the pro version to continue using the app."
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
              onClick={() => window.open('mailto:contact@desk-ai.app', '_blank')}
              className="text-primary hover:underline"
            >
              Contact Support
            </button>
            {/* <button 
              onClick={() => window.open('https://docs.deskflow.app', '_blank')}
              className="text-primary hover:underline"
            >
              View Documentation
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
}
