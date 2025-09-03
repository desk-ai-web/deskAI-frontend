import Stripe from 'stripe';
import { storage } from './storage';
import { User } from '@shared/schema';
import logger from './logger';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export { stripe };

// Stripe utility functions
export class StripeService {
  // Create or get Stripe customer
  static async getOrCreateCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    // Update user with Stripe customer ID
    await storage.updateUser(user.id, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  // Create checkout session for subscription
  static async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const plan = await storage.getSubscriptionPlanById(planId);
    if (!plan || !plan.stripePriceId) {
      throw new Error('Plan not found or not configured with Stripe');
    }

    const customerId = await this.getOrCreateCustomer(user);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          userId,
          planId,
        },
      },
    });

    return session;
  }

  // Create customer portal session
  static async createPortalSession(userId: string, returnUrl: string): Promise<string> {
    const user = await storage.getUser(userId);
    if (!user || !user.stripeCustomerId) {
      throw new Error('User not found or no Stripe customer ID');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  // Handle webhook events
  static async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const { type, data } = event;

    switch (type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionEvent(data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(data.object as Stripe.Invoice);
        break;
      
      default:
        logger.info(`Unhandled event type: ${type}`);
    }
  }

  private static async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription event:', { subscriptionId: subscription.id, status: subscription.status });
    
    const userId = subscription.metadata.userId;
    const planId = subscription.metadata.planId;

    if (!userId || !planId) {
      logger.error('Missing metadata in subscription:', { subscriptionId: subscription.id });
      return;
    }

    logger.info('Subscription metadata', { userId, planId });

    // Helper function to safely convert timestamps
    const safeTimestamp = (timestamp: number | undefined): Date | null => {
      if (!timestamp || timestamp <= 0) return null;
      try {
        const date = new Date(timestamp * 1000);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        logger.error('Error converting timestamp:', { timestamp, error: error instanceof Error ? error.message : error });
        return null;
      }
    };

    // For trial subscriptions, use trial_end as the period end if current_period_end is not set
    const currentPeriodStart = safeTimestamp(subscription.current_period_start);
    const currentPeriodEnd = safeTimestamp(subscription.current_period_end) || 
                            (subscription.status === 'trialing' ? safeTimestamp(subscription.trial_end) : null);
    
    const subscriptionData = {
      userId,
      planId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: currentPeriodStart || new Date(),
      currentPeriodEnd: currentPeriodEnd || new Date(),
      trialEnd: safeTimestamp(subscription.trial_end),
    };

    try {
      // Check if subscription already exists
      const existingSubscription = await storage.getUserSubscriptionByStripeId(subscription.id);
      
      if (existingSubscription) {
        logger.info('Updating existing subscription:', { subscriptionId: existingSubscription.id });
        await storage.updateUserSubscription(existingSubscription.id, subscriptionData);
      } else {
        logger.info('Creating new subscription with data:', { subscriptionData });
        await storage.createUserSubscription(subscriptionData);
      }
      logger.info('Subscription saved successfully');
    } catch (error) {
      logger.error('Error saving subscription data:', { error: error instanceof Error ? error.message : error });
      throw error;
    }
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      await this.handleSubscriptionEvent(subscription);
    }
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
      await this.handleSubscriptionEvent(subscription);
    }
  }

  // Cancel subscription
  static async cancelSubscription(stripeSubscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // Reactivate subscription
  static async reactivateSubscription(stripeSubscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  }
}
