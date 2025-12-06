// supabase/functions/stripe-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // session.id == order_id we stored
        const sessionId = session.id;

        // Mark order as paid
        const { error } = await supabaseAdmin
          .from("orders")
          .update({
            status: "paid",
            payment_method: "stripe_checkout",
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", sessionId);

        if (error) {
          console.error("Failed to update order as paid:", error);
        }
        break;
      }

      default:
        // Other events can be handled here
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Error", { status: 500 });
  }
});
