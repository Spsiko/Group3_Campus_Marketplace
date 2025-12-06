import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

serve(async (req) => {
  // --- CORS ---
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
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      throw new Error("Items array missing");
    }

    const lineItems = items.map((i: any, idx: number) => {
      if (i.price == null || isNaN(Number(i.price))) {
        throw new Error(`Invalid price for item at index ${idx}`);
      }

      const priceInCents = Math.round(Number(i.price) * 100);
      const qty = Number(i.quantity) || 1;

      return {
        price_data: {
          currency: "USD",
          product_data: { name: i.title || "Item" },
          unit_amount: priceInCents,
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: "http://localhost:5173/student/checkoutsuccess",
      cancel_url: "http://localhost:5173/student/checkout",
    });

    return new Response(JSON.stringify({ id: session.id, url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    console.error("Stripe error:", err);

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
