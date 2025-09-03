import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import initialViewImage from "@/assets/initial_view.png";
import { stripeUtils } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

export function HeroSection() {
  const { isAuthenticated, user: _user } = useAuth();
  // TODO: Use _user for user-specific features or remove if not needed
  const [loading, setLoading] = useState(false);
  const [proPlanId, setProPlanId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasSubscription: boolean;
    subscription?: any;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch the Pro plan ID and subscription status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansResponse = await fetch('/api/subscription-plans');
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          // The API returns { success: true, data: [...], message: "..." }
          if (plansData.success && Array.isArray(plansData.data)) {
            const proPlan = plansData.data.find((plan: any) => plan.name === "Pro");
            if (proPlan) {
              setProPlanId(proPlan.id);
            }
          } else {
            console.error('Invalid plans data structure:', plansData);
          }
        }

        // Fetch subscription status if authenticated
        if (isAuthenticated) {
          setStatusLoading(true);
          try {
            const statusResponse = await fetch('/api/subscription', {
              credentials: 'include',
            });
            if (statusResponse.ok) {
              const status = await statusResponse.json();
              setSubscriptionStatus(status);
            }
          } catch (error) {
            console.error('Error fetching subscription status:', error);
          } finally {
            setStatusLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      // Redirect to auth page if not logged in
      window.location.href = '/auth';
      return;
    }

    if (!proPlanId) {
      alert('Unable to load subscription plans. Please try again.');
      return;
    }

    setLoading(true);
    try {
      await stripeUtils.redirectToCheckout(proPlanId);
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleManageSubscription = async () => {
    try {
      await stripeUtils.redirectToPortal();
    } catch (error) {
      console.error('Error redirecting to portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  // Helper functions to check subscription status
  const isOnTrial = (subscription: any): boolean => {
    if (!subscription || !subscription.trialEnd) {
      return false;
    }
    const trialEnd = new Date(subscription.trialEnd);
    const now = new Date();
    return trialEnd > now;
  };

  const isSubscriptionActive = (subscription: any): boolean => {
    if (!subscription) {
      return false;
    }
    return ['active', 'trialing'].includes(subscription.status);
  };

  // Determine what button to show
  const getPrimaryButton = () => {
    if (!isAuthenticated) {
      return {
        text: "Start Free Trial",
        onClick: handleStartTrial,
        loading: loading,
        disabled: loading || !proPlanId
      };
    }

    if (statusLoading) {
      return {
        text: "Loading...",
        onClick: () => {},
        loading: true,
        disabled: true
      };
    }

    if (subscriptionStatus?.hasSubscription && isSubscriptionActive(subscriptionStatus.subscription)) {
      if (isOnTrial(subscriptionStatus.subscription)) {
        return {
          text: "Go to Dashboard",
          onClick: handleGoToDashboard,
          loading: false,
          disabled: false
        };
      } else {
        return {
          text: "Manage Subscription",
          onClick: handleManageSubscription,
          loading: false,
          disabled: false
        };
      }
    }

    // No active subscription, show start trial
    return {
      text: "Start Free Trial",
      onClick: handleStartTrial,
      loading: loading,
      disabled: loading || !proPlanId
    };
  };

  const primaryButton = getPrimaryButton();
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
            <Button 
              size="lg"
              className={`text-lg px-8 py-6 ${
                primaryButton.text === "Start Free Trial" 
                  ? "gradient-bg hover:opacity-90" 
                  : "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white"
              }`}
              onClick={primaryButton.onClick}
              disabled={primaryButton.disabled}
            >
              {primaryButton.loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                primaryButton.text
              )}
            </Button>
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
