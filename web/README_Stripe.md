# Campus Marketplace – Supabase + Stripe Integration

This project uses Supabase for the backend and Stripe for secure payments.
Stripe checkout is handled using a Supabase Edge Function.

---

## 1. Folder Structure

supabase/
  functions/
    create-checkout-session/
      index.ts
      deno.json

---

## 2. How Stripe Checkout Works

When a user places an order:
1. React frontend collects the cart items.
2. Frontend calls the Supabase Edge Function:
   POST /functions/v1/create-checkout-session
3. The function:
   - Reads Stripe secret keys from environment variables.
   - Creates a Stripe Checkout Session.
   - Returns the session URL or ID.
4. Frontend redirects user to Stripe UI.
5. After payment, Stripe redirects back to:
   /checkout-success

---

## 3. Required Environment Variables

Add these under:
Supabase Dashboard → Project Settings → Functions → Environment Variables

- STRIPE_SECRET_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_URL
- SITE_URL  (http://localhost:5173 for local)

---

## 4. Deploying Functions

Install CLI:
npm install -g supabase

Login:
supabase login

Deploy the function:
supabase functions deploy create-checkout-session

---

## 5. Running Locally

supabase start  (Optional if using local Postgres)
npm install
npm run dev

Open:
http://localhost:5173

---

## 6. Creating the Checkout Session (Edge Function)

Located in:
supabase/functions/create-checkout-session/index.ts

Uses URL-based ESM imports since Edge Functions run on Deno.

---

## 7. Adding a Webhook (Optional)

Webhook URL:
https://<project-id>.functions.supabase.co/stripe-webhook

Purpose:
- verify payment
- update orders table
- notify seller
- send confirmation email

---

## 8. Team Guidelines

- Do NOT push Stripe secret keys to GitHub.
- Environment variables must be set in Supabase dashboard only.
- Never import Node-only modules inside Edge Functions.

---

## 9. Help

For Stripe errors:
Check browser console + Supabase logs:
Supabase Dashboard → Logs → Edge Functions
Stripe Dashboard → Developers → Logs

## 10. Test Data

Card Number : 4242 4242 4242 4242
Expiry : 12/34
CVV : 567
Name and Zip Code can be anything