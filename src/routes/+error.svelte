<script lang="ts">
  import "../app.css"
  import { page } from "$app/stores"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      embarrassing: "This is embarrassing...",
      thereWasAnError: "There was an error:",
      errorMessage: "Not Found",
      returnHome: "Return Home",
    },
    tr: {
      embarrassing: "Bu biraz utanç verici...",
      thereWasAnError: "Bir hata oluştu:",
      errorMessage: "Sayfa bulunamadı",
      returnHome: "Ana sayfaya dön",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<div class="hero min-h-[100vh]">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="text-5xl font-bold">{t.embarrassing}</h1>
      <p class="py-6 text-2xl">
        {t.thereWasAnError}
        {$page?.error?.message === "Not Found" && t.errorMessage}
      </p>
      <div>
        <a href="/" class="btn btn-primary btn-wide">{t.returnHome}</a>
      </div>
    </div>
  </div>
</div>
