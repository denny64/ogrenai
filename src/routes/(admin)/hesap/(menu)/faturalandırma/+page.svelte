<script lang="ts">
  import { WebsiteName } from "../../../../../config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import type { SupabaseClient } from "@supabase/supabase-js"
  import type { Database } from "../../../../../DatabaseDefinitions"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      pricing: "Pricing",
      freeSignUp: "Free plan on sign up",
      welcomeOffer: "Welcome Offer!",
      yearly: "Yearly",
      monthly: "Monthly",
      limitedFeatures: "Limited Features",
      neverBilled: "Never billed",
      freeSetsPerMonth: "3 free flashcard sets per month",
      freeLimitedAccess: "Limited access to all future features",
      freeLimitedStorage: "Limited storage",
      UpgradeAnyTime: "Upgrade any time",
      simplePricing: "Simple pricing. All features",
      billedYearly: "Billed yearly",
      billedMonthly: "Billed monthly",
      setsPerMonth: "100 flashcard sets per month",
      accessToAllFeatures: "Access to all future features",
      unlimitedStorage: "Unlimited storage",
      unlimitedStorageBracket: "(we never delete your notes)",
      lockedIn: "This price is locked in for life",
      lockedInBracket: "(even with new features)",
      mostPopular: "Most Popular - save up to 50%",
    },
    tr: {
      pricing: "Fiyatlandırma",
      freeSignUp: "Kayıt olunca ücretsiz plan",
      welcomeOffer: "Hoş geldin hediyesi!",
      yearly: "Yıllık",
      monthly: "aylık",
      limitedFeatures: "Sınırlı özellikler",
      neverBilled: "Ücretlendirme yok",
      freeSetsPerMonth: "Aylık 3 ücretsiz bilgi kartı seti",
      freeLimitedAccess: "Gelecekteki özelliklere sınırlı erişim",
      freeLimitedStorage: "Sınırlı depolama alanı",
      UpgradeAnyTime: "İstediğin zaman geçiş yap",
      simplePricing: "Net fiyatlandırma. Tüm özellikler dahil",
      billedYearly: "Yıllık faturalandırılır",
      billedMonthly: "Her ay faturalandırılır",
      setsPerMonth: "Aylık 100 adet flashcard seti",
      accessToAllFeatures: "Gelecek tüm özelliklere erişim",
      unlimitedStorage: "Sınırsız depolama",
      unlimitedStorageBracket: "(notlarınız asla silinmez)",
      lockedIn: "Bu fiyat ömür boyu sabit kalır",
      lockedInBracket: "(yeni özellikler eklense bile)",
      mostPopular: "En popüler – %50’den fazla tasarruf",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("billing")

  interface PageData {
    supabase: SupabaseClient<Database>
  }

  let { data } = $props<{ data: PageData }>()
  let { supabase, user, session, profile, subscriptionStats } = data

  console.log("BILLING PAGE DATA", data)
  console.log("BILLING PAGE PROFILE", profile)

  let isYearly = $state(true)
  const monthlyPrice = 8.99
  const yearlyPrice = 5.99
  let currentPrice = $derived(isYearly ? yearlyPrice : monthlyPrice)
  let billingText = $derived(
    isYearly ? `${t.billedYearly}` : `${t.billedMonthly}`,
  )

  const handleGetFree = async () => {
    // if (!session) {
    //   goto("/giris/kayit-ol")
    // } else {
    //   // goto("/hesap")
    //   console.log("User is signed in, handle free subscription")
    // }
    console.log("User is signed in, handle free subscription")
  }

  const handleGetPremium = async (subType: string) => {
    if (profile.stripe_customer_id) {
      // EXISTING CUSTOMER STRIPE
      console.log("existing customer, handle premium subscription")
      const response = await fetch("/hesap/api/stripe", {
        method: "POST",
        body: JSON.stringify({
          type: "existingCustomer",
          data: {
            userId: profile.id,
            stripeCustomerId: profile.stripe_customer_id,
            subType: subType,
            amount: isYearly ? yearlyPrice * 12 : monthlyPrice,
          },
        }),
      }).then((res) => res.json())
      console.log("STRIPE BILLING PORTAL DATA? ==", response)
      if (response.success) {
        window.open(response.stripeUrl, "_blank")
      }
    } else {
      // NEW CUSTOMER STRIPE
      console.log("new customer, handle premium subscription")
      const response = await fetch("/hesap/api/stripe", {
        method: "POST",
        body: JSON.stringify({
          type: "newCustomer",
          data: {
            userId: session?.user.id,
            stripeCustomerId: profile.stripe_customer_id,
            subType: subType,
            amount: isYearly ? yearlyPrice * 12 : monthlyPrice,
          },
        }),
      }).then((res) => res.json())
      console.log("STRIPE NEW CUSTOMER RESPONSE ==", response)
      if (response.success === true) {
        window.open(response.stripeUrl, "_blank")
      }
    }
  }

  // console.log("pricing page DATA", data)

  type PlanFeatureRow = {
    name: string
    freeIncluded?: boolean
    proIncluded?: boolean
    freeString?: string
    proString?: string
    header?: boolean
  }

  const planFeatures: PlanFeatureRow[] = [
    {
      name: "Section 1",
      header: true,
    },
    {
      name: "Feature 1",
      freeIncluded: true,
      proIncluded: true,
    },
    {
      name: "Feature 2",
      freeIncluded: false,
      proIncluded: true,
    },
    {
      name: "Feature 3",
      freeString: "3",
      proString: "Unlimited",
    },
    {
      name: "Section 2",
      header: true,
    },
    {
      name: "Feature 4",
      freeIncluded: true,
      proIncluded: true,
    },
    {
      name: "Feature 5",
      freeIncluded: false,
      proIncluded: true,
    },
  ]
</script>

<svelte:head>
  <title>{t.pricing}</title>
  <meta name="description" content="{t.pricing} - {WebsiteName}" />
</svelte:head>

<div class="min-h-[70vh] pb-8 pt-[5vh] px-4">
  <h1 class="text-3xl font-bold text-center">{t.pricing}</h1>
  <h2 class="text-xl text-center text-slate-500 mt-1 pb-3">
    {t.freeSignUp}
  </h2>

  <div class="flex items-center justify-center gap-3 mt-8">
    <!-- <span class="text-lg">Monthly</span> -->
    <label class="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" bind:checked={isYearly} class="sr-only peer" />
      <div
        class="w-14 h-7 bg-base-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"
      ></div>
    </label>
    <span class="text-lg">{t.yearly}</span>
    <span class="badge badge-success">{t.welcomeOffer}</span>
  </div>

  <div class="w-full my-8">
    <div
      class="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto justify-center items-center mt-8"
    >
      <!-- Monthly Plan -->
      <div class="card w-96 bg-base-100 border border-base-300">
        <div class="card-body">
          <h2 class="text-3xl font-bold">Free</h2>
          <p class="text-base-content/70">{t.limitedFeatures}</p>

          <!-- Free Plan Price -->
          <div class="my-4">
            <span class="text-5xl font-bold">$0</span>
            <span class="text-base-content/70">/{t.monthly}</span>
          </div>
          <p class="text-base-content/70">{t.neverBilled}</p>

          <button
            class="btn btn-outline btn-primary mt-4"
            onclick={handleGetFree}
            disabled={subscriptionStats.plan === "Free"}
            >{subscriptionStats.plan === "Free" ? "Current" : "Manage"}</button
          >

          <div class="divider mt-4"></div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.freeSetsPerMonth}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.freeLimitedAccess}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.freeLimitedStorage}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.UpgradeAnyTime}</span>
            </div>
            <!-- <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Any use case</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>80+ Languages</span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Yearly Plan -->
      <div class="card w-96 bg-base-100 relative border-2 border-primary">
        <div
          class="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-content px-4 py-1 rounded-full text-sm whitespace-nowrap"
        >
          {t.mostPopular}
        </div>
        <div class="card-body">
          <h2 class="text-3xl font-bold">Premium</h2>
          <p class="text-base-content/70">
            {t.simplePricing}
          </p>

          <!-- Premium Plan Price -->
          <div class="my-4">
            {#if isYearly}
              <div class="relative">
                <div
                  class="absolute -top-6 text-2xl text-base-content/50 line-through"
                >
                  ${yearlyPrice}/{t.monthly}
                </div>
                <span class="text-5xl font-bold">$3.99</span>
                <span class="text-base-content/70">/{t.monthly}</span>
              </div>
            {:else}
              <span class="text-5xl font-bold">${currentPrice}</span>
              <span class="text-base-content/70">/{t.monthly}</span>
            {/if}
          </div>
          <p class="text-base-content/70">{billingText}</p>

          <!-- <button
            class="btn btn-primary mt-4"
            onclick={() => handleGetPremium(isYearly ? "yearly" : "monthly")}
            >Get Premium</button
          > -->
          {#if isYearly}
            <button
              class="btn btn-primary mt-4"
              onclick={() => handleGetPremium("yearly")}
              disabled={subscriptionStats.plan === "Premium Yearly"}
              >{subscriptionStats.plan === "Premium Yearly"
                ? "Current"
                : "Get Yearly"}</button
            >
          {:else}
            <button
              class="btn btn-primary mt-4"
              onclick={() => handleGetPremium("monthly")}
              disabled={subscriptionStats.plan === "Premium Monthly"}
              >{subscriptionStats.plan === "Premium Monthly"
                ? "Current"
                : "Get Monthly"}</button
            >
          {/if}
          <!-- <button class="btn btn-outline btn-primary mt-4">Get Premium</button> -->

          <div class="divider mt-4"></div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.setsPerMonth}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.accessToAllFeatures}</span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.lockedIn} </span>
            </div>
            <div>{t.lockedInBracket}</div>
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t.unlimitedStorage}</span>
            </div>
            <div>{t.unlimitedStorageBracket}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
