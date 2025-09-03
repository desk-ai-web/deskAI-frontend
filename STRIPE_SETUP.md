# Stripe Integration Setup Guide

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Frontend Stripe Key (for Vite)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

## Stripe Dashboard Setup

### 1. Create Stripe Account
- Go to [stripe.com](https://stripe.com) and create an account
- Complete the onboarding process

### 2. Get API Keys
- Go to Developers > API keys in your Stripe dashboard
- Copy your publishable key and secret key
- Use test keys for development, live keys for production

### 3. Create Products and Prices
- Go to Products in your Stripe dashboard
- Create two products:
  - **Pro Plan**: €2.99/month
- **Team Plan**: €9.99/month
- For each product, create a recurring price with:
  - Billing model: Standard pricing
  - Price: €2.99 or €9.99
  - Billing period: Monthly
  - Trial period: 14 days

### 4. Set Up Webhooks
- Go to Developers > Webhooks in your Stripe dashboard
- Click "Add endpoint"
- Endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (or `http://localhost:5173/api/webhooks/stripe` for development)
- Select these events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copy the webhook signing secret

### 5. Update Database with Stripe Price IDs
After creating the products and prices in Stripe, update your database:

```sql
-- Update subscription plans with Stripe price IDs
UPDATE subscription_plans 
SET stripe_price_id = 'price_your_pro_plan_price_id' 
WHERE name = 'Pro';

UPDATE subscription_plans 
SET stripe_price_id = 'price_your_team_plan_price_id' 
WHERE name = 'Team';
```

## Testing the Integration

### 1. Test Cards
Use these test card numbers in Stripe checkout:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### 2. Test Flow
1. Start your development server
2. Create a user account
3. Go to pricing page
4. Click "Start 14-Day Trial" on Pro plan
5. Complete checkout with test card
6. Verify subscription appears in dashboard
7. Test customer portal access

## Production Deployment

### 1. Switch to Live Keys
- Replace test keys with live keys in production
- Update webhook endpoint URL to production domain
- Ensure HTTPS is enabled

### 2. Database Migration
Run the database migration to add Stripe fields:
```bash
npm run db:push
```

### 3. Monitor Webhooks
- Check webhook delivery in Stripe dashboard
- Monitor for failed webhook events
- Set up alerts for payment failures

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** in production
4. **Implement proper error handling** for failed payments
5. **Monitor subscription status** changes
6. **Handle trial expiration** gracefully

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook endpoint URL
   - Verify webhook secret
   - Check server logs

2. **Checkout not working**
   - Verify publishable key
   - Check browser console for errors
   - Ensure user is authenticated

3. **Subscription not updating**
   - Check webhook events in Stripe dashboard
   - Verify database connection
   - Check server logs for errors

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will log detailed Stripe API calls and webhook events.
