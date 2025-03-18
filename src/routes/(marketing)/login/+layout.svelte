<script lang="ts">
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      usingCookies: "Logging in uses Cookies",
    },
    tr: {
      usingCookies: "Giriş yapmak için çerezler kullanılır",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
  interface Props {
    children?: import("svelte").Snippet
  }

  let { children }: Props = $props()
  let isEurope = $state(false)
  try {
    isEurope = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.startsWith("Europe/")
  } catch (e) {
    /* continue */
  }
</script>

<div
  class="text-center content-center max-w-lg mx-auto min-h-[70vh] pb-12 flex items-center place-content-center"
>
  <div class="flex flex-col w-64 lg:w-80">
    {@render children?.()}
    <div class="mt-8 {isEurope ? 'block' : 'hidden'}">
      🍪 {t.usingCookies} 🍪
    </div>
  </div>
</div>
