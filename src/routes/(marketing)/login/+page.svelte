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
      signIn: "Sign In",
      getStarted: "Get Started",
      signUp: "Sign Up",
      alreadyHaveAccount: "Already have an account?",
    },
    tr: {
      signIn: "Giriş Yap",
      getStarted: "Başla",
      signUp: "Kayıt Ol",
      alreadyHaveAccount: "Zaten bir hesabın var mı?",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.signIn}</title>
</svelte:head>

<div>
  <h1 class="text-xl font-bold">{t.getStarted}</h1>
  <a href="/login/sign_up"
    ><button class="btn btn-primary mt-3 btn-wide">{t.signUp}</button></a
  >

  <h1 class="text-xl mt-6">{t.alreadyHaveAccount}</h1>
  <a href="/login/sign_in"
    ><button class="btn btn-outline btn-primary mt-3 btn-wide"
      >{t.signIn}</button
    ></a
  >
</div>
