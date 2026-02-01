/**
 * Comprehensive Subscription Flow Tests
 *
 * Tests all critical paths and edge cases for subscription creation,
 * webhook processing, and customer deduplication.
 *
 * Run with: npm test tests/subscription-flow.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

// Mock user for testing
const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
};

const TEST_PRICE_ID = 'price_test_123';

let stripe: Stripe;
let createdCustomers: string[] = [];
let createdSubscriptions: string[] = [];

beforeEach(async () => {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  createdCustomers = [];
  createdSubscriptions = [];

  // Clean up test data
  await sql`DELETE FROM subscriptions WHERE user_id = ${TEST_USER.id}`;
  await sql`DELETE FROM user_profiles WHERE user_id = ${TEST_USER.id}`;
  await sql`DELETE FROM orphaned_subscriptions WHERE customer_email = ${TEST_USER.email}`;
});

afterEach(async () => {
  // Clean up Stripe resources
  for (const subId of createdSubscriptions) {
    try {
      await stripe.subscriptions.cancel(subId);
    } catch (error) {
      console.warn(`Failed to clean up subscription ${subId}:`, error);
    }
  }

  for (const custId of createdCustomers) {
    try {
      await stripe.customers.del(custId);
    } catch (error) {
      console.warn(`Failed to clean up customer ${custId}:`, error);
    }
  }
});

describe('Subscription Flow - Customer Creation', () => {
  it('should create new customer for first-time user', async () => {
    const response = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.sessionId).toBeDefined();

    // Verify customer was created with metadata
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const customerId = session.customer as string;
    createdCustomers.push(customerId);

    const customer = await stripe.customers.retrieve(customerId);
    expect((customer as any).metadata?.userId).toBe(TEST_USER.id);
    expect((customer as any).email).toBe(TEST_USER.email);

    // Verify customer was saved to database
    const dbResult = await sql`
      SELECT stripe_customer_id FROM subscriptions WHERE user_id = ${TEST_USER.id}
    `;
    expect(dbResult.rows[0]?.stripe_customer_id).toBe(customerId);
  });

  it('should reuse existing customer for returning user', async () => {
    // First checkout
    const response1 = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data1 = await response1.json();
    const session1 = await stripe.checkout.sessions.retrieve(data1.sessionId);
    const customerId1 = session1.customer as string;
    createdCustomers.push(customerId1);

    // Second checkout (should reuse customer)
    const response2 = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data2 = await response2.json();
    const session2 = await stripe.checkout.sessions.retrieve(data2.sessionId);
    const customerId2 = session2.customer as string;

    // Should be the same customer
    expect(customerId1).toBe(customerId2);

    // Verify only one customer in Stripe
    const customers = await stripe.customers.list({ email: TEST_USER.email });
    expect(customers.data.length).toBe(1);
  });

  it('should NOT create duplicate customers on concurrent requests', async () => {
    // Simulate user clicking "Subscribe" multiple times rapidly
    const requests = Array(5)
      .fill(null)
      .map(() =>
        fetch('http://localhost:3000/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: TEST_PRICE_ID,
            userId: TEST_USER.id,
            userEmail: TEST_USER.email,
          }),
        }),
      );

    const responses = await Promise.all(requests);
    const data = await Promise.all(responses.map((r) => r.json()));

    // Get all customer IDs
    const customerIds = new Set<string>();
    for (const item of data) {
      const session = await stripe.checkout.sessions.retrieve(item.sessionId);
      const customerId = session.customer as string;
      customerIds.add(customerId);
      createdCustomers.push(customerId);
    }

    // Should only have ONE unique customer
    expect(customerIds.size).toBe(1);

    // Verify in Stripe
    const customers = await stripe.customers.list({ email: TEST_USER.email });
    expect(customers.data.length).toBe(1);
  });

  it('should find existing customer by metadata even if email changed', async () => {
    // Create customer manually with userId metadata
    const customer = await stripe.customers.create({
      email: 'old-email@example.com',
      metadata: { userId: TEST_USER.id },
    });
    createdCustomers.push(customer.id);

    // Save to database
    await sql`
      INSERT INTO subscriptions (user_id, stripe_customer_id, user_email)
      VALUES (${TEST_USER.id}, ${customer.id}, 'old-email@example.com')
    `;

    // Try to create checkout with new email
    const response = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email, // Different email!
        }),
      },
    );

    const data = await response.json();
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    // Should reuse the same customer (matched by userId)
    expect(session.customer).toBe(customer.id);
  });
});

describe('Subscription Flow - Duplicate Prevention', () => {
  it('should prevent duplicate subscriptions for user with active subscription', async () => {
    // Create customer and active subscription
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
      metadata: { userId: TEST_USER.id },
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
      metadata: { userId: TEST_USER.id },
    });
    createdSubscriptions.push(subscription.id);

    // Save to database
    await sql`
      INSERT INTO subscriptions (
        user_id, stripe_customer_id, stripe_subscription_id,
        status, plan_type, user_email
      ) VALUES (
        ${TEST_USER.id}, ${customer.id}, ${subscription.id},
        'active', 'lunary_plus', ${TEST_USER.email}
      )
    `;

    // Try to create another checkout
    const response = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data = await response.json();

    // Should redirect to portal instead of checkout
    expect(data.portalUrl).toBeDefined();
    expect(data.reason).toBe('existing_subscription');
    expect(data.sessionId).toBeUndefined();
  });

  it('should allow new subscription if previous was cancelled', async () => {
    // Create customer and cancelled subscription
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
      metadata: { userId: TEST_USER.id },
    });
    createdCustomers.push(customer.id);

    await sql`
      INSERT INTO subscriptions (
        user_id, stripe_customer_id, status, plan_type, user_email
      ) VALUES (
        ${TEST_USER.id}, ${customer.id}, 'cancelled', 'free', ${TEST_USER.email}
      )
    `;

    // Try to create new checkout
    const response = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data = await response.json();

    // Should allow new checkout
    expect(data.sessionId).toBeDefined();
    expect(data.portalUrl).toBeUndefined();
  });
});

describe('Webhook Flow - userId Resolution', () => {
  it('should resolve userId from subscription metadata', async () => {
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
      metadata: { userId: TEST_USER.id }, // userId in subscription metadata
    });
    createdSubscriptions.push(subscription.id);

    // Simulate webhook
    const webhookPayload = {
      type: 'customer.subscription.created',
      data: { object: subscription },
    };

    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature', // Would need real signature in production
      },
      body: JSON.stringify(webhookPayload),
    });

    // Check if subscription was saved to database
    const dbResult = await sql`
      SELECT user_id, stripe_customer_id, stripe_subscription_id
      FROM subscriptions
      WHERE user_id = ${TEST_USER.id}
    `;

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].stripe_customer_id).toBe(customer.id);
    expect(dbResult.rows[0].stripe_subscription_id).toBe(subscription.id);
  });

  it('should resolve userId from customer metadata if not in subscription', async () => {
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
      metadata: { userId: TEST_USER.id }, // userId in customer metadata
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
      metadata: {}, // No userId here
    });
    createdSubscriptions.push(subscription.id);

    // Simulate webhook
    const webhookPayload = {
      type: 'customer.subscription.created',
      data: { object: subscription },
    };

    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Check if subscription was saved
    const dbResult = await sql`
      SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${subscription.id}
    `;

    expect(dbResult.rows.length).toBe(1);
    expect(dbResult.rows[0].user_id).toBe(TEST_USER.id);
  });

  it('should resolve userId from database by customer_id', async () => {
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
      // No metadata
    });
    createdCustomers.push(customer.id);

    // Pre-populate database with customer_id
    await sql`
      INSERT INTO subscriptions (user_id, stripe_customer_id, user_email)
      VALUES (${TEST_USER.id}, ${customer.id}, ${TEST_USER.email})
    `;

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
      metadata: {}, // No metadata
    });
    createdSubscriptions.push(subscription.id);

    // Simulate webhook
    const webhookPayload = {
      type: 'customer.subscription.created',
      data: { object: subscription },
    };

    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Check if subscription was updated
    const dbResult = await sql`
      SELECT stripe_subscription_id FROM subscriptions WHERE user_id = ${TEST_USER.id}
    `;

    expect(dbResult.rows[0].stripe_subscription_id).toBe(subscription.id);
  });

  it('should create orphaned subscription if userId cannot be resolved', async () => {
    const customer = await stripe.customers.create({
      email: 'unknown@example.com',
      // No metadata, not in database
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
      metadata: {}, // No metadata
    });
    createdSubscriptions.push(subscription.id);

    // Simulate webhook
    const webhookPayload = {
      type: 'customer.subscription.created',
      data: { object: subscription },
    };

    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Should return 200 (not error)
    expect(response.status).toBe(200);

    // Check if orphaned subscription was created
    const orphanedResult = await sql`
      SELECT * FROM orphaned_subscriptions
      WHERE stripe_subscription_id = ${subscription.id}
    `;

    expect(orphanedResult.rows.length).toBe(1);
    expect(orphanedResult.rows[0].customer_email).toBe('unknown@example.com');
    expect(orphanedResult.rows[0].resolved).toBe(false);

    // Clean up
    await sql`DELETE FROM orphaned_subscriptions WHERE stripe_subscription_id = ${subscription.id}`;
  });

  it('should NOT throw error on webhook failure', async () => {
    // Create subscription without any way to resolve userId
    const customer = await stripe.customers.create({
      email: 'orphan@example.com',
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
    });
    createdSubscriptions.push(subscription.id);

    const webhookPayload = {
      type: 'customer.subscription.created',
      data: { object: subscription },
    };

    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Should return success, not error (prevents Stripe retries)
    expect(response.status).toBe(200);

    // Clean up
    await sql`DELETE FROM orphaned_subscriptions WHERE customer_email = 'orphan@example.com'`;
  });
});

describe('Auto-Recovery', () => {
  it('should auto-recover orphaned subscription on user login', async () => {
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
    });
    createdCustomers.push(customer.id);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: TEST_PRICE_ID }],
    });
    createdSubscriptions.push(subscription.id);

    // Create orphaned subscription
    await sql`
      INSERT INTO orphaned_subscriptions (
        stripe_subscription_id, stripe_customer_id, customer_email,
        status, plan_type, resolved
      ) VALUES (
        ${subscription.id}, ${customer.id}, ${TEST_USER.email},
        'active', 'lunary_plus', false
      )
    `;

    // User checks their subscription
    const response = await fetch(
      'http://localhost:3000/api/stripe/get-subscription',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data = await response.json();

    // Should find and link the subscription
    expect(data.success).toBe(true);
    expect(data.subscription).toBeDefined();
    expect(data.status).toBe('active');

    // Check if orphaned subscription was marked as resolved
    const orphanedResult = await sql`
      SELECT resolved, resolved_by FROM orphaned_subscriptions
      WHERE stripe_subscription_id = ${subscription.id}
    `;

    expect(orphanedResult.rows[0].resolved).toBe(true);
    expect(orphanedResult.rows[0].resolved_by).toBe('auto_recovery');

    // Check if metadata was updated in Stripe
    const updatedCustomer = await stripe.customers.retrieve(customer.id);
    expect((updatedCustomer as any).metadata?.userId).toBe(TEST_USER.id);
  });
});

describe('Edge Cases', () => {
  it('should handle customer deletion and recreation', async () => {
    // Create and delete customer
    const customer = await stripe.customers.create({
      email: TEST_USER.email,
      metadata: { userId: TEST_USER.id },
    });
    const customerId = customer.id;

    await sql`
      INSERT INTO subscriptions (user_id, stripe_customer_id)
      VALUES (${TEST_USER.id}, ${customerId})
    `;

    await stripe.customers.del(customerId);

    // Try to create new checkout
    const response = await fetch(
      'http://localhost:3000/api/stripe/create-checkout-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: TEST_PRICE_ID,
          userId: TEST_USER.id,
          userEmail: TEST_USER.email,
        }),
      },
    );

    const data = await response.json();
    expect(data.sessionId).toBeDefined();

    // Should create a new customer (old one was deleted)
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const newCustomerId = session.customer as string;
    expect(newCustomerId).not.toBe(customerId);
    createdCustomers.push(newCustomerId);
  });

  it('should handle race condition in checkout.session.completed', async () => {
    // This tests the scenario where subscription.created fires before checkout.session.completed
    // The webhook should still be able to resolve the user

    const customer = await stripe.customers.create({
      email: TEST_USER.email,
    });
    createdCustomers.push(customer.id);

    // Simulate checkout session with userId in metadata
    const checkoutSession = {
      id: 'cs_test_123',
      customer: customer.id,
      subscription: 'sub_test_123',
      client_reference_id: TEST_USER.id,
      metadata: { userId: TEST_USER.id },
    };

    // Simulate checkout.session.completed webhook
    const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: checkoutSession },
      }),
    });

    // Should process successfully
    expect(response.status).toBe(200);

    // Customer metadata should be updated
    const updatedCustomer = await stripe.customers.retrieve(customer.id);
    expect((updatedCustomer as any).metadata?.userId).toBe(TEST_USER.id);
  });
});
