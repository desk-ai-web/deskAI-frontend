import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2 
} from "lucide-react";
import { stripeUtils } from "@/lib/stripe";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const status = await stripeUtils.getSubscriptionStatus();
      setSubscription(status.subscription || null);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      await stripeUtils.redirectToPortal();
    } catch (error: any) {
      console.error('Error redirecting to portal:', error);
      
      // Check if it's a portal configuration error
      if (error.message?.includes('No configuration provided') || 
          error.message?.includes('default configuration has not been created') ||
          error.message?.includes('Billing portal is not configured')) {
        alert('Billing portal is not configured yet. Please contact support or try again later.');
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'past_due':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'canceled':
      case 'unpaid':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading subscription status...</span>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                              You don&apos;t have an active subscription. 
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal"
                onClick={() => window.location.href = '/#pricing'}
              >
                View our plans
              </Button> to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isOnTrial = stripeUtils.isOnTrial(subscription);
  const trialDaysRemaining = stripeUtils.getTrialDaysRemaining(subscription);
  const statusText = stripeUtils.formatSubscriptionStatus(subscription);

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header and Status Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span className="font-semibold text-sm">Subscription Status</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(subscription.status)}
            <span className="text-sm font-medium">Status</span>
            <Badge className={`${getStatusColor(subscription.status)} text-xs`}>
              {statusText}
            </Badge>
          </div>
        </div>

        {/* Trial Info - Compact */}
        {isOnTrial && trialDaysRemaining !== null && (
          <div className="flex items-center space-x-2 mb-3 text-sm">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>You have <strong>{trialDaysRemaining} days</strong> remaining in your trial.</span>
          </div>
        )}

        {/* Mobile Layout */}
        {isMobile ? (
          <div className="space-y-4">
            {/* Billing Period - Stacked vertically on mobile */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Period Start</p>
                  <p className="text-sm font-medium">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Period End</p>
                  <p className="text-sm font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              </div>
              {subscription.trialEnd && (
                <div>
                  <p className="text-xs text-gray-600">Trial Ends</p>
                  <p className="text-sm font-medium">{formatDate(subscription.trialEnd)}</p>
                </div>
              )}
            </div>

            {/* Manage Billing Button - Full width on mobile */}
            <Button 
              onClick={handleManageBilling}
              disabled={portalLoading}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              {portalLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Manage Subscription
                </>
              )}
            </Button>
            
            {/* Additional Info - Centered on mobile */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <div>• Manage subscription, payment methods</div>
              <div>• Cancel or upgrade anytime</div>
              <div>• Download invoices</div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex items-end justify-between mb-2">
            {/* Billing Period - Compact Grid */}
            <div className="grid grid-cols-3 gap-3 flex-1">
              <div>
                <p className="text-xs text-gray-600">Period Start</p>
                <p className="text-sm font-medium">{formatDate(subscription.currentPeriodStart)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Period End</p>
                <p className="text-sm font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
              {subscription.trialEnd && (
                <div>
                  <p className="text-xs text-gray-600">Trial Ends</p>
                  <p className="text-sm font-medium">{formatDate(subscription.trialEnd)}</p>
                </div>
              )}
            </div>

            {/* Manage Billing Button and Info - Stacked on the right */}
            <div className="ml-4 flex-shrink-0 text-right">
              {/* Manage Billing Button - Colored */}
              <Button 
                onClick={handleManageBilling}
                disabled={portalLoading}
                size="sm"
                className="mb-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                {portalLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-3 h-3 mr-1" />
                    Manage
                  </>
                )}
              </Button>
              
              {/* Additional Info - Below the button */}
              <div className="text-xs text-gray-500">
                <div>• Manage subscription, payment methods</div>
                <div>• Cancel or upgrade anytime</div>
                <div>• Download invoices</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
