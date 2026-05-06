import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "all",
      limit: 10,
    });
    // ACH debits stay in "incomplete"/"processing" for days before turning active.
    // Treat any non-canceled subscription as good-to-proceed so the user isn't blocked.
    const validStatuses = ["active", "trialing", "past_due", "incomplete", "processing", "unpaid"];
    const validSub = subs.data.find((s) => validStatuses.includes(s.status));
    const hasActive = !!validSub;
    let subscriptionEnd: string | null = null;

    if (validSub) {
      subscriptionEnd = validSub.current_period_end
        ? new Date(validSub.current_period_end * 1000).toISOString()
        : null;

      await supabaseClient
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_activated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .is("subscription_activated_at", null);

      await supabaseClient
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({ subscribed: hasActive, subscription_end: subscriptionEnd }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
