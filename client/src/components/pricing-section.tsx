import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      features: [
        "Basic blink tracking",
        "Simple reminders",
        "Basic timer",
        "Desktop app access"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: 2.99,
      description: "For serious professionals",
      features: [
        "Advanced AI tracking",
        "Posture monitoring",
        "Smart focus timer",
        "Detailed analytics",
        "Multi-screen support",
        "Custom reminder settings",
        "Priority support"
      ],
      buttonText: "Start Pro Trial",
      popular: true
    },
    {
      name: "Team",
      price: 9.99,
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Team dashboard",
        "Usage insights",
        "Admin controls",
        "Priority support",
        "Custom integrations"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "Team") {
      // Open contact form or redirect to sales
      window.open('mailto:gopimaheshmehta@gmail.com?subject=Team Plan Inquiry', '_blank');
    } else {
      // // Redirect to signup
      // window.location.href = '/api/login';
      // Redirect to downloads
      window.location.href = '/downloads';
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-light to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose your <span className="gradient-text">plan</span>
          </h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`glass border-0 hover-lift relative ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-bg">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  ${plan.price}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-secondary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full py-3 ${
                    plan.popular 
                      ? 'gradient-bg hover:opacity-90' 
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Feature</th>
                  <th className="text-center py-4 px-2">Free</th>
                  <th className="text-center py-4 px-2">Pro</th>
                  <th className="text-center py-4 px-2">Team</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-2">Blink tracking</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Posture monitoring</td>
                  <td className="text-center py-4 px-2">-</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Analytics & insights</td>
                  <td className="text-center py-4 px-2">Basic</td>
                  <td className="text-center py-4 px-2">Advanced</td>
                  <td className="text-center py-4 px-2">Advanced + Team</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Multi-screen support</td>
                  <td className="text-center py-4 px-2">-</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-2">Priority support</td>
                  <td className="text-center py-4 px-2">-</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
