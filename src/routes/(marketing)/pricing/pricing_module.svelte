<script lang="ts">
  import { pricingPlans } from "./pricing_plans"

  interface Props {
    // Module context
    highlightedPlanId?: string
    callToAction: string
    currentPlanId?: string
    center?: boolean
  }

  let {
    highlightedPlanId = "",
    callToAction,
    currentPlanId = "",
    center = true,
  }: Props = $props()
</script>

<div
  class="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto px-8 place-content-center"
>
  {#each pricingPlans as plan}
    <div
      class="bg-white rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-[320px] justify-self-center {plan.id ===
      highlightedPlanId
        ? 'border-primary'
        : 'border-gray-200'} "
    >
      <div class="flex flex-col h-full">
        <div class="text-xl font-bold">{plan.name}</div>
        <p class="mt-2 text-sm text-gray-500 leading-relaxed">
          {plan.description}
        </p>
        <div class="mt-auto pt-4 text-sm text-gray-600">
          Plan Includes:
          <ul class="list-disc list-inside mt-2 space-y-1">
            {#each plan.features as feature}
              <li class="">{feature}</li>
            {/each}
            <ul></ul>
          </ul>
        </div>
        <div class="pt-8">
          <span class="text-4xl font-bold">{plan.price}</span>
          <span class="text-gray-400">{plan.priceIntervalName}</span>
          <div class="mt-6 pt-4 flex-1 flex flex-row items-center">
            {#if plan.id === currentPlanId}
              <div
                class="btn btn-outline btn-success no-animation w-[80%] mx-auto cursor-default"
              >
                Current Plan
              </div>
            {:else}
              <a
                href={"/account/subscribe/" +
                  (plan?.stripe_price_id ?? "free_plan")}
                class="btn btn-primary w-[80%] mx-auto"
              >
                {callToAction}
              </a>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}
</div>
