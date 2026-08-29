import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { SubscriptionStatusValue } from "@/lib/types";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatusValue {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "canceled";
  }
}

async function upsertFromSubscription(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  subscription: Stripe.Subscription
) {
  const price = subscription.items.data[0]?.price;
  await admin.from("subscription_status").upsert({
    user_id: userId,
    status: mapStripeStatus(subscription.status),
    stripe_customer_id:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    price_id: price?.id ?? null,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.supabase_user_id;
      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertFromSubscription(admin, userId, subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        await upsertFromSubscription(admin, userId, subscription);
      } else {
        // Fall back to looking up by stripe_customer_id for renewals that don't carry metadata.
        const customerId =
          typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const { data } = await admin
          .from("subscription_status")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (data?.user_id) await upsertFromSubscription(admin, data.user_id, subscription);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await admin
        .from("subscription_status")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", customerId);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
