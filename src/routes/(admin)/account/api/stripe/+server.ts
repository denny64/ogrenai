import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import Stripe from "stripe"
import {
  PRIVATE_STRIPE_API_KEY,
  PRIVATE_STRIPE_WEBHOOK_SECRET,
  PRIVATE_SUPABASE_SERVICE_ROLE,
} from "$env/static/private"
import { createClient } from "@supabase/supabase-js"
import { PUBLIC_SUPABASE_URL } from "$env/static/public"

const stripeServer = new Stripe(PRIVATE_STRIPE_API_KEY, {
  apiVersion: "2023-08-16",
})

// const supabase = createClient(
//   PUBLIC_SUPABASE_URL,
//   PRIVATE_SUPABASE_SERVICE_ROLE,
//   {
//     auth: {
//       persistSession: false,
//     },
//   },
// )

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, safeGetSession, session, supabaseServiceRole },
}) => {
  const { data, type } = await request.json()

  console.log("data", data)

  console.log("session", session)

  console.log("request.headers.get('origin')", request.headers.get("origin"))

  if (!request.headers.get("origin")) {
    return json({ error: "Origin header is required" }, { status: 400 })
  }

  const successUrl = `${request.headers.get("origin")}/account/my-decks`
  const cancelUrl = `${request.headers.get("origin")}/pricing`
  const returnUrl = `${request.headers.get("origin")}/account/settings`

  let productId = ""
  let priceId = ""

  // teststripe
  // if (data.subType === "yearly") {
  //   productId = "prod_S32ze2SS4FaOkY"
  //   priceId = "price_1R8wtYGuj2EuCfeBX9DKpmA2"
  // } else {
  //   productId = "prod_S32tdvCshiqfL8"
  //   priceId = "price_1R8wnmGuj2EuCfeBKzbWfqgU"
  // }

  // real stripe
  if (data.subType === "yearly") {
    productId = "prod_S7bLcGMuacocZ7"
    priceId = "price_1RDM8MGuj2EuCfeBbCzNtw4W"
  } else {
    productId = "prod_S7bLfaXybxtPkq"
    priceId = "price_1RDM8QGuj2EuCfeBKWoPjVvt"
  }

  const createCheckoutSession = async (
    userId: string,
    stripeCustomerId: string | null,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) => {
    const checkoutData: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription" as const,
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId || null,
        stripeCustomerId: stripeCustomerId || null,
      },
    }

    const checkoutSession =
      await stripeServer.checkout.sessions.create(checkoutData)

    return checkoutSession
  }

  if (type === "newCustomer") {
    try {
      // Create new subscription for first-time subscribers
      // const checkoutData: Stripe.Checkout.SessionCreateParams = {
      //   mode: "subscription" as const,
      //   payment_method_types: ["card"],
      //   allow_promotion_codes: true,
      //   line_items: [
      //     {
      //       price: priceId,
      //       quantity: 1,
      //     },
      //   ],
      //   success_url: successUrl,
      //   cancel_url: cancelUrl,
      //   metadata: {
      //     userId: session?.user?.id || null,
      //   },
      // }

      // const checkoutSession =
      //   await stripeServer.checkout.sessions.create(checkoutData)

      let checkoutSession = await createCheckoutSession(
        data.userId,
        data.stripeCustomerId,
        priceId,
        successUrl,
        cancelUrl,
      )

      return json({
        success: true,
        type: "checkout",
        sessionId: checkoutSession.id,
        stripeUrl: checkoutSession.url,
      })
    } catch (error) {
      console.error("Stripe checkout error:", error)
      return json(
        {
          type: "error",
          message: "Failed to create checkout session",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } else if (type === "existingCustomer") {
    console.log("EXISTING CUSTOMER", data)
    try {
      //check existing stripe customer data? prolly not needed

      // const { data: stripeCusties, error: stripeCustiesError } =
      //   await supabaseServiceRole.rpc("get_stripe_customer", {
      //     customer_id: data.stripeCustomerId,
      //   })

      // console.log("stripeCusties", stripeCusties)

      // if (stripeCustiesError)
      //   console.error("Error getting stripe Custies", stripeCustiesError)
      // else console.log("stripe Custies ==", stripeCusties)

      // check if existing customer has an active subscription

      const { data: stripeSub, error: stripeSubError } =
        await supabaseServiceRole.rpc("get_stripe_subscription", {
          customer_id: data.stripeCustomerId,
        })

      if (stripeSubError)
        console.error("Error getting stripe Sub", stripeSubError)
      else console.log("stripe Sub ==", stripeSub)

      // console.log("STRIPE CUSTY TABLE???!!", sbStripeData)

      const subscriptions = stripeSub || []
      console.log("stripeSub.length", subscriptions.length)

      if (subscriptions.length === 0) {
        // let checkoutSession = await createCheckoutSession(
        //   data.userId,
        //   data.stripeCustomerId,
        //   priceId,
        //   successUrl,
        //   cancelUrl,
        // )

        const checkoutData: Stripe.Checkout.SessionCreateParams = {
          mode: "subscription" as const,
          payment_method_types: ["card"],
          allow_promotion_codes: true,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          customer: data.stripeCustomerId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            userId: data.userId || null,
            stripeCustomerId: data.stripeCustomerId || null,
          },
        }

        const checkoutSession =
          await stripeServer.checkout.sessions.create(checkoutData)

        return json({
          type: "checkout",
          success: true,
          sessionId: checkoutSession.id,
          stripeUrl: checkoutSession.url,
        })
      } else {
        const portalSession = await stripeServer.billingPortal.sessions.create({
          customer: data.stripeCustomerId,
          return_url: returnUrl,
        })

        return json({
          type: "billingPortal",
          success: true,
          message: "manage subscrption mate",
          data: data,
          stripeUrl: portalSession.url,
        })
      }

      // const portalSession = await stripeServer.billingPortal.sessions.create({
      //   customer: data.stripeCustomerId,
      //   return_url: returnUrl,
      // })

      // return json({
      //   success: true,
      //   message: "manage subscrption mate",
      //   data: data,
      //   stripePortalUrl: portalSession.url,
      // })
    } catch (error) {
      console.error("Stripe billing portal error:", error)
      return json(
        {
          type: "error",
          message: "Failed to create stripe billing portal",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  }
}
