import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export { stripePromise };

// Utility functions for Stripe integration
export const stripeUtils = {
  // Redirect to Stripe checkout
  async redirectToCheckout(planId: string): Promise<void> {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const responseData = await response.json();
      // The API returns { success: true, data: {...}, message: "..." }
      if (responseData.success && responseData.data?.url) {
        window.location.href = responseData.data.url;
      } else {
        throw new Error('Invalid response structure from checkout API');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  },

  // Redirect to Stripe customer portal
  async redirectToPortal(): Promise<void> {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const responseData = await response.json();
      // The API returns { success: true, data: {...}, message: "..." }
      if (responseData.success && responseData.data?.url) {
        window.location.href = responseData.data.url;
      } else {
        throw new Error('Invalid response structure from portal API');
      }
    } catch (error) {
      console.error('Error redirecting to portal:', error);
      throw error;
    }
  },

  // Get user subscription status
  async getSubscriptionStatus(): Promise<{
    hasSubscription: boolean;
    subscription?: {
      id: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      trialEnd?: string;
    };
  }> {
    try {
      const response = await fetch('/api/subscription', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const responseData = await response.json();
      // The API returns { success: true, data: {...}, message: "..." }
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error('Invalid response structure from subscription API');
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  },

  // Check if user is on trial
  isOnTrial(subscription: any): boolean {
    if (!subscription || !subscription.trialEnd) {
      return false;
    }
    
    const trialEnd = new Date(subscription.trialEnd);
    const now = new Date();
    
    return trialEnd > now;
  },

  // Check if subscription is active
  isSubscriptionActive(subscription: any): boolean {
    if (!subscription) {
      return false;
    }
    
    return ['active', 'trialing'].includes(subscription.status);
  },

  // Format subscription status for display
  formatSubscriptionStatus(subscription: any): string {
    if (!subscription) {
      return 'No subscription';
    }

    if (this.isOnTrial(subscription)) {
      return 'Trial';
    }

    switch (subscription.status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      default:
        return subscription.status;
    }
  },

  // Get days remaining in trial
  getTrialDaysRemaining(subscription: any): number | null {
    if (!subscription || !subscription.trialEnd) {
      return null;
    }

    const trialEnd = new Date(subscription.trialEnd);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  },
};
