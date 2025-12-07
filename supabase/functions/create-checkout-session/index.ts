// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";

// Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

// Types
interface CheckoutItem {
  title: string;
  price: number;
  quantity?: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-client-info, apikey",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const body = await req.json();
    const items: CheckoutItem[] = body.items;

    if (!items || !Array.isArray(items)) {
      throw new Error("Invalid or missing 'items' array");
    }

    // Detect request origin (localhost or production)
    const origin =
      req.headers.get("origin") ??
      "http://34.60.37.32"; // fallback

    // Build Stripe line items
    const lineItems = items.map((item: CheckoutItem) => {
      const priceInCents = Math.round(item.price * 100);
      const qty = item.quantity ?? 1;

      return {
        price_data: {
          currency: "USD",
          product_data: { name: item.title },
          unit_amount: priceInCents,
        },
        quantity: qty,
      };
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/student/checkoutsuccess`,
      cancel_url: `${origin}/student/checkout`,
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Stripe error:", err);

    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
