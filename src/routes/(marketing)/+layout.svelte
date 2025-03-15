<script lang="ts">
  import "../../app.css"
  import { onMount } from "svelte"
  import { language, setLanguage } from "$lib/stores/language"

  interface Props {
    children?: import("svelte").Snippet
  }

  let { children }: Props = $props()

  // Use the store value instead of local state
  let currentLanguage = $state<"en" | "tr">("tr")

  onMount(() => {
    // Initialize from the store
    const unsubscribe = language.subscribe((value) => {
      currentLanguage = value
    })

    return unsubscribe
  })

  function handleSetLanguage(lang: "en" | "tr") {
    setLanguage(lang)
  }

  const translations = {
    en: {
      account: "Account",
      learnWithAI: "Learn with AI",
      aiDescription:
        "AI that turns what you're learning into flashcards so you don't have to",
      learnMore: "Learn More",
    },
    tr: {
      account: "Hesap",
      learnWithAI: "Yapay Zeka ile Öğren",
      aiDescription:
        "Yapay zeka öğrendiklerinizi flashcard'lara dönüştürür, siz uğraşmayın",
      learnMore: "Daha Fazla",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLanguage === "en" ? translations.en : translations.tr
  })
</script>

<!-- NAV BAR -->
<div class="navbar bg-base-100 container mx-auto">
  <div class="flex-1">
    <!-- <a class="btn btn-ghost normal-case text-xl" href="/">{WebsiteName}</a> -->
    <a class="btn btn-ghost normal-case text-xl" href="/">
      <img src="/logo-landscape.png" alt="ÖğrenAI" class="h-14" />
    </a>
  </div>
  <div class="flex-none">
    <!-- Add language toggle -->
    <div class="mr-4">
      <button
        class={`btn btn-sm ${currentLanguage === "en" ? "btn-primary" : "btn-ghost"}`}
        onclick={() => handleSetLanguage("en")}
      >
        EN
      </button>
      <button
        class={`btn btn-sm ${currentLanguage === "tr" ? "btn-primary" : "btn-ghost"}`}
        onclick={() => handleSetLanguage("tr")}
      >
        TR
      </button>
    </div>

    <ul class="menu menu-horizontal px-1 hidden sm:flex font-bold text-lg">
      <!-- <li class="md:mx-4">
        <a
          href="https://github.com/CriticalMoments/CMSaasStarter"
          class="border border-primary">★ us on Github</a
        >
      </li> -->
      <!-- <li class="md:mx-2"><a href="/blog">Blog</a></li> -->
      <!-- <li class="md:mx-2"><a href="/#">Pricing</a></li> -->
      <li class="md:mx-2"><a href="/account/my-decks">{t.account}</a></li>
      <!-- <li class="md:mx-0">
        <a href="/search" aria-label="Search">
          <svg
            fill="#000000"
            class="w-6 h-6"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211zM4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474z"
              fill="currentColor"
            /></svg
          >
        </a>
      </li> -->
    </ul>
    <!-- mobile menu nav -->
    <div class="dropdown dropdown-end sm:hidden">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          /></svg
        >
      </label>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <ul
        tabindex="0"
        class="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold"
      >
        <!-- <li><a href="/blog">Blog</a></li> -->
        <!-- <li><a href="/pricing">Pricing</a></li> -->
        <li><a href="/account/my-decks">{t.account}</a></li>
        <!-- <li><a href="/search">Search</a></li> -->
        <!-- <li>
          <a
            href="https://github.com/CriticalMoments/CMSaasStarter"
            class="border border-primary">★ us on Github</a
          >
        </li> -->
      </ul>
    </div>
  </div>
</div>

<!-- No need to pass props anymore -->
<div class="">
  {@render children?.()}
</div>

<!-- FOOTER -->
<!-- Spacer grows so the footer can be at bottom on short pages -->
<div class="flex-grow"></div>
<div class="">
  <div class="border-t max-w-[1000px] mx-auto"></div>
  <footer
    class="footer max-w-5xl p-10 gap-x-48 lg:gap-x-64 xl:gap-x-96 place-content-center text-base"
  >
    <nav>
      <!-- <span class="footer-title opacity-80">Explore</span>
      <a class="link link-hover mb-1" href="/">Overview</a>
      <a class="link link-hover my-1" href="/pricing">Pricing</a>
      <a class="link link-hover my-1" href="/blog">Blog</a>
      <a class="link link-hover my-1" href="/contact_us">Contact Us</a>
      <a
        class="link link-hover my-1"
        href="https://github.com/CriticalMoments/CMSaasStarter">Github</a
      > -->
      <span class="footer-title opacity-80">{t.learnWithAI}</span>
      <div class="max-w-[260px]">
        <a class="btn btn-ghost normal-case text-xl pl-0" href="/">
          <img src="/logo-landscape.png" alt="ÖğrenAI" class="h-14" />
        </a>
        <!-- <div class="font-medium mb-3">Learning with AI</div> -->
        <div class="font-light">
          {t.aiDescription}
        </div>
        <div class="link text-sm font-bold mt-2">{t.learnMore}</div>
      </div>
    </nav>
    <aside></aside>
  </footer>
</div>
