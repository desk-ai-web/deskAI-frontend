import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { stripeUtils } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isActive: boolean;
}

import { getApiUrl } from '@/config';

export function PricingSection() {
  const { user: _user, isAuthenticated } = useAuth();
  // TODO: Use _user for user-specific features or remove if not needed
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(getApiUrl('/api/subscription-plans'));
      if (response.ok) {
        const plansData = await response.json();
        // The API returns { success: true, data: [...], message: "..." }
        if (plansData.success && Array.isArray(plansData.data)) {
          setPlans(plansData.data);
        } else {
          // Invalid data structure - log in development only
          if (import.meta.env.MODE === 'development') {
            console.error('Invalid plans data structure:', plansData);
          }
          setPlans([]);
        }
      }
    } catch (error) {
      // Silent fail for plans fetching
      setPlans([]);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }

    setSelectedPlan(planId);
    setLoading(true);

    try {
      await stripeUtils.redirectToCheckout(planId);
    } catch (error) {
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleTeamPlan = () => {
    window.open('mailto:contact@desk-ai.app?subject=Team Plan Inquiry', '_blank');
  };

  // Use API plans only - no fallback to avoid UUID issues
  const displayPlans = Array.isArray(plans) ? plans : [];
  
  // Get the Pro plan ID for the hero section
  const _proPlanId = displayPlans.find(plan => plan.name === "Pro")?.id;
  // TODO: Use _proPlanId for hero section integration or remove if not needed

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-light to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Start with a <span className="gradient-text">free trial</span>
          </h2>
          <p className="text-xl text-gray-600">Try all features free for 7 days, then choose your plan</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial Plan */}
          <Card className="glass border-0 hover-lift relative">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Free Trial</CardTitle>
              <div className="text-4xl font-bold">
                €0
                <span className="text-lg text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-gray-600">7-day free trial, no credit card required</p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-4 mb-8">
                {[
                  "Full feature access for 7 days",
                  "Posture tracking",
                  "Movement analysis",
                  "Blink detection", 
                  "Screen distance monitoring",
                  "Smart reminders",
                  "Integrated focus timer",
                  "Progress analytics",
                  "Basic support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white"
                variant="outline"
                onClick={() => window.location.href = '/auth'}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          {displayPlans.length > 0 ? displayPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`glass border-0 hover-lift relative ${
                plan.name === "Pro" ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.name === "Pro" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-bg">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-4xl font-bold">
                  €{(plan.price / 100).toFixed(2)}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
                <p className="text-gray-600">
                  {plan.name === "Pro" ? "Go Pro for better screen habits" : "For teams and organizations"}
                </p>
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
                    plan.name === "Pro"
                      ? 'gradient-bg hover:opacity-90' 
                      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                  variant={plan.name === "Pro" ? "default" : "outline"}
                  onClick={() => plan.name === "Team" ? handleTeamPlan() : handlePlanSelect(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.name === "Team" ? "Contact Sales" : "Start 14-Day Trial"
                  )}
                </Button>
              </CardContent>
            </Card>
          )) : (
            <Card className="glass border-0 hover-lift relative">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading subscription plans...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8">Feature Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2">Feature</th>
                  <th className="text-center py-4 px-2">Free Trial</th>
                  <th className="text-center py-4 px-2">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-2">Posture tracking</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Movement analysis</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Blink detection</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Screen distance monitoring</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Smart reminders</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Focus timer</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Multi-screen support</td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                  <td className="text-center py-4 px-2">
                    <Check className="w-5 h-5 text-secondary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 px-2">Analytics & insights</td>
                  <td className="text-center py-4 px-2">7 days</td>
                  <td className="text-center py-4 px-2">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 px-2">Priority support</td>
                  <td className="text-center py-4 px-2">Email only</td>
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
