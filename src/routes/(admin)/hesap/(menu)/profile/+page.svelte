<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("profile")

  let { data } = $props()
  let { profile, user } = data
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <h1 class="text-4xl font-bold">Coming soon...</h1>
</div>
