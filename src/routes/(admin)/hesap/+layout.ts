import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public"
import {
  createBrowserClient,
  createServerClient,
  isBrowser,
} from "@supabase/ssr"
import { redirect } from "@sveltejs/kit"
import type { Database } from "../../../DatabaseDefinitions.js"
import { CreateProfileStep } from "../../../config"
import { load_helper } from "$lib/load_helpers"
import { credits } from "$lib/stores/credits"

export const load = async ({ fetch, data, depends, url }) => {
  depends("supabase:auth")

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll() {
            return data.cookies
          },
        },
      })

  const { session, user } = await load_helper(data.session, supabase)
  if (!session || !user) {
    redirect(303, "/giris")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`*`)
    .eq("id", user.id)
    .single()

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const createProfilePath = "/hesap/create_profile"
  const signOutPath = "/hesap/sign_out"
  if (
    profile &&
    !_hasFullProfile(profile) &&
    url.pathname !== createProfilePath &&
    url.pathname !== signOutPath &&
    CreateProfileStep
  ) {
    redirect(303, createProfilePath)
  }

  // Define the structure for period stats
  let subscriptionStats = {
    creditsAvailable: 3,
    startDate: null,
    endDate: null,
    periodNumber: 0,
    plan: "Free",
    remainingCredits: 3,
    completedDecksInPeriod: 0,
  }

  // Calculate credit period and available credits
  function getCurrentCreditPeriod(startDateTime: string, plan: string) {
    const startDate = new Date(startDateTime)
    const now = new Date()

    const msPer30Days = 30 * 24 * 60 * 60 * 1000
    const timeElapsed = now - startDate

    const periodNumber = Math.floor(timeElapsed / msPer30Days)
    const periodStartDate = new Date(
      startDate.getTime() + periodNumber * msPer30Days,
    )
    const periodEndDate = new Date(periodStartDate.getTime() + msPer30Days)

    // Define credits based on plan
    const creditsMap = {
      "Premium Yearly": 100,
      "Premium Monthly": 100,
      Free: 3,
    }

    return {
      periodNumber,
      creditsAvailable: creditsMap[plan] || 3,
      startDate: periodStartDate,
      endDate: periodEndDate,
    }
  }

  // Calculate period statistics including remaining credits
  function calculatePeriodStats(creditPeriod, completedDecks, planType) {
    console.log("creditPeriod in func", creditPeriod)
    console.log("completedDecks in func", completedDecks)
    // Create dates in UTC by appending Z to force UTC interpretation
    let periodStart = new Date(creditPeriod.startDate + "Z")
    let periodEnd = new Date(creditPeriod.endDate + "Z")

    if (planType === "Free") {
      periodStart = new Date(creditPeriod.startDate)
      periodEnd = new Date(creditPeriod.endDate)
    }

    const decksInPeriod =
      completedDecks?.filter((deck) => {
        const completedAt = new Date(deck.completed_at)
        return completedAt >= periodStart && completedAt <= periodEnd
      }) || []

    console.log("periodStart", periodStart)
    console.log("periodEnd", periodEnd)
    console.log("decksInPeriod", decksInPeriod)

    return {
      creditsAvailable: creditPeriod.creditsAvailable,
      // startDate: creditPeriod.startDate,
      // endDate: creditPeriod.endDate,
      startDate: periodStart,
      endDate: periodEnd,
      periodNumber: creditPeriod.periodNumber,
      plan: planType,
      remainingCredits: creditPeriod.creditsAvailable - decksInPeriod.length,
      completedDecksInPeriod: decksInPeriod.length,
    }
  }

  // Fetch completed decks
  const { data: completedDecks, error: completedDecksError } = await supabase
    .from("deck_completed")
    .select("*")
    .eq("profile_id", user.id)

  console.log("sb completedecks", completedDecks)

  // teststripe
  // const SUBSCRIPTION_PRODUCTS = {
  //   YEARLY: "prod_S32ze2SS4FaOkY",
  //   MONTHLY: "prod_S32tdvCshiqfL8",
  // }

  // real stripe
  const SUBSCRIPTION_PRODUCTS = {
    YEARLY: "prod_S7bLcGMuacocZ7",
    MONTHLY: "prod_S7bLfaXybxtPkq",
  }

  // Handle subscription and calculate period stats
  if (profile.stripe_customer_id) {
    const { data: stripeSub, error: stripeSubError } = await supabase.rpc(
      "get_stripe_subscription",
      { customer_id: profile.stripe_customer_id },
    )

    if (stripeSubError) {
      console.error("Error getting stripe subscription:", stripeSubError)
    } else if (stripeSub?.length > 0) {
      const subscription = stripeSub[0]
      console.log("subscription", subscription)
      const isMonthly =
        subscription.attrs.plan.product === SUBSCRIPTION_PRODUCTS.MONTHLY

      if (isMonthly) {
        // console.log("completedecks", completedDecks)
        console.log(
          "subscription.current_period_start",
          subscription.current_period_start,
        )
        console.log(
          "subscription.current_period_end",
          subscription.current_period_end,
        )
        subscriptionStats = calculatePeriodStats(
          {
            creditsAvailable: 100,
            startDate: subscription.current_period_start,
            endDate: subscription.current_period_end,
            periodNumber: 0,
          },
          completedDecks,
          "Premium Monthly",
        )
      } else {
        const creditPeriod = getCurrentCreditPeriod(
          subscription.current_period_start,
          "Premium Yearly",
        )
        subscriptionStats = calculatePeriodStats(
          creditPeriod,
          completedDecks,
          "Premium Yearly",
        )
      }
    } else {
      const creditPeriod = getCurrentCreditPeriod(
        user.email_confirmed_at,
        "Free",
      )
      subscriptionStats = calculatePeriodStats(
        creditPeriod,
        completedDecks,
        "Free",
      )
    }
  } else {
    const creditPeriod = getCurrentCreditPeriod(user.email_confirmed_at, "Free")
    subscriptionStats = calculatePeriodStats(
      creditPeriod,
      completedDecks,
      "Free",
    )
  }

  console.log("Subscription Stats:", subscriptionStats)
  credits.set(subscriptionStats.remainingCredits)

  // To read the value, you need to subscribe:
  let currentCredits: number
  credits.subscribe((value) => {
    currentCredits = value
    console.log("Credits:", value)
  })

  const deckList = await fetch(
    "/hesap/api/deck?profileId=" + session?.user.id,
  ).then((res) => res.json())

  return {
    supabase,
    session,
    profile,
    user,
    amr: aal?.currentAuthenticationMethods,
    deckList: deckList.data,
    completedDecks: completedDecks,
    subscriptionStats,
  }
}

export const _hasFullProfile = (
  profile: Database["public"]["Tables"]["profiles"]["Row"] | null,
) => {
  if (!profile) {
    return false
  }
  if (!profile.full_name) {
    return false
  }
  // if (!profile.company_name) {
  //   return false
  // }
  // if (!profile.website) {
  //   return false
  // }

  return true
}
