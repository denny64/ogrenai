import { error, json } from "@sveltejs/kit"
import {
  PRIVATE_STRIPE_API_KEY,
  PRIVATE_STRIPE_WEBHOOK_SECRET,
  PRIVATE_SUPABASE_SERVICE_ROLE,
} from "$env/static/private"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"

const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" })

const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PRIVATE_SUPABASE_SERVICE_ROLE,
  {
    auth: {
      persistSession: false,
    },
  },
)

// async function updateSubscription(subscription: Stripe.Subscription) {
//   try {
//     // Get customer ID - handle both string and object formats
//     const customerId =
//       typeof subscription.customer === "string"
//         ? subscription.customer
//         : subscription.customer.id

//     // Get customer data including team_id
//     const { data: customerData, error: customerError } = await supabase
//       .from("stripe_customers")
//       .select("team_id")
//       .eq("stripe_customer_id", customerId)
//       .single()

//     if (customerError) {
//       console.error("Error fetching customer:", customerError)
//       throw error(500, "Error fetching customer data")
//     }

//     // First check if subscription exists
//     const { data: existingSubscription } = await supabase
//       .from("subscriptions")
//       .select("id")
//       .eq("stripe_subscription_id", subscription.id)
//       .single()

//     if (existingSubscription) {
//       // Update existing subscription
//       const { error: updateError } = await supabase
//         .from("subscriptions")
//         .update({
//           status: subscription.status,
//           stripe_customer_id: customerId,
//           price_id: subscription.items.data[0].price.id,
//           product_id: subscription.items.data[0].price.product,
//           current_period_start: new Date(
//             subscription.current_period_start * 1000,
//           ).toISOString(),
//           current_period_end: new Date(
//             subscription.current_period_end * 1000,
//           ).toISOString(),
//           cancel_at: subscription.cancel_at
//             ? new Date(subscription.cancel_at * 1000).toISOString()
//             : null,
//           canceled_at: subscription.canceled_at
//             ? new Date(subscription.canceled_at * 1000).toISOString()
//             : null,
//         })
//         .eq("id", existingSubscription.id)

//       if (updateError) {
//         console.error("Error updating subscription:", updateError)
//         throw updateError
//       }
//     } else {
//       // Insert new subscription
//       const { error: insertError } = await supabase
//         .from("subscriptions")
//         .insert({
//           team_id: customerData.team_id,
//           stripe_subscription_id: subscription.id,
//           stripe_customer_id: customerId,
//           status: subscription.status,
//           price_id: subscription.items.data[0].price.id,
//           product_id: subscription.items.data[0].price.product,
//           current_period_start: new Date(
//             subscription.current_period_start * 1000,
//           ).toISOString(),
//           current_period_end: new Date(
//             subscription.current_period_end * 1000,
//           ).toISOString(),
//           cancel_at: subscription.cancel_at
//             ? new Date(subscription.cancel_at * 1000).toISOString()
//             : null,
//           canceled_at: subscription.canceled_at
//             ? new Date(subscription.canceled_at * 1000).toISOString()
//             : null,
//         })

//       if (insertError) {
//         console.error("Error inserting subscription:", insertError)
//         throw insertError
//       }
//     }
//   } catch (err) {
//     console.error("Error in updateSubscription:", err)
//     throw err
//   }
// }

export async function POST({ request }) {
  const WEBHOOK_SECRET = PRIVATE_STRIPE_WEBHOOK_SECRET

  try {
    const sig = request.headers.get("stripe-signature")
    const data = await request.text()

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        data,
        sig,
        WEBHOOK_SECRET,
      )
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed:", err.message)
      return json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log("Received webhook event:", event.type)
    console.log("event", event)

    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        console.log("checkoutSession data DONE", checkoutSession.metadata)
        let userId = checkoutSession?.metadata?.userId || ""
        let stripeCustomerId =
          checkoutSession?.metadata?.stripeCustomerId || null
        console.log("userId after checkloutsession ??", userId)
        console.log(
          "stripeCustomerId after checkloutsession ??",
          stripeCustomerId,
        )
        if (
          checkoutSession.payment_status === "paid" &&
          checkoutSession.status === "complete"
        ) {
          console.log("payment successful")
          console.log(
            "updaet suspabase profile tripe ID with userid===",
            userId,
          )
          try {
            // const { data: profileData, error: profileError } = await supabase
            //   .from("profiles")
            //   .update({ stripe_customer_id: checkoutSession.customer })
            //   .eq("id", userId)
            //   .single()

            // if (profileError) {
            //   console.error(
            //     "Error updating profile stripe_customer_id:",
            //     profileError,
            //   )
            //   throw error(500, "Error updating profile stripe_customer_id")
            // }

            // console.log("profileData UPDATED WITH STRIPE ID", profileData)
            if (!stripeCustomerId) {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .update({
                  stripe_customer_id: checkoutSession.customer,
                })
                .eq("id", userId)
                .single()

              if (profileError) {
                console.error(
                  "Error updating profile stripe_customer_id:",
                  profileError,
                )
                throw error(500, "Error updating profile stripe_customer_id")
              }

              console.log("profileData UPDATED WITH STRIPE ID", profileData)
            }
          } catch (err) {
            console.error(
              "Error in supabase updating profile stripe_customer_id:",
              err,
            )
            throw err
          }
        } else {
          console.log("payment failed")
        }

        break
      case "invoice.payment_succeeded":
        const invoiceData = event.data.object
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        // console.log("success data===", invoiceData)
        console.log("INVOICE PAYMENT SUCCEEDED")

        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return json({ received: true })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return json({ error: "Webhook handler failed" }, { status: 400 })
  }
}

// import { json } from "@sveltejs/kit"
// import type { RequestEvent } from "./$types"
// import {
//   PRIVATE_STRIPE_API_KEY,
//   PRIVATE_STRIPE_WEBHOOK_SECRET,
// } from "$env/static/private"
// import Stripe from "stripe"

// const stripe = new Stripe(PRIVATE_STRIPE_API_KEY, {
//   apiVersion: "2023-08-16", // Use the latest API version
// })

// export async function POST({ request }: RequestEvent) {
//   const signature = PRIVATE_STRIPE_WEBHOOK_SECRET

//   if (!signature) {
//     return new Response("No signature provided", { status: 400 })
//   }

//   try {
//     // Get the raw body as text
//     const body = await request.text()

//     // Verify the webhook signature
//     const event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       PRIVATE_STRIPE_API_KEY,
//     )

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object
//         // Then define and call a method to handle the successful payment intent.
//         // handlePaymentIntentSucceeded(paymentIntent);
//         console.log("paymentIntent", paymentIntent)
//         break
//       case "payment_method.attached":
//         const paymentMethod = event.data.object
//         // Then define and call a method to handle the successful attachment of a PaymentMethod.
//         // handlePaymentMethodAttached(paymentMethod);
//         console.log("paymentMethod", paymentMethod)
//         break
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`)
//     }

//     // Return a response to acknowledge receipt of the event
//     return json({ received: true })
//   } catch (error) {
//     console.error("Error verifying webhook signature:", error)
//     return new Response("Error verifying webhook signature", { status: 400 })
//   }
// }
