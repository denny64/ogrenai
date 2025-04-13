<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
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
      emailLabel: "Email address",
      emailInputPlaceholder: "Your email address",
      passwordLabel: "Create a Password",
      passwordInputPlaceholder: "Your password",
    },
    tr: {
      signIn: "Giriş Yap",
      getStarted: "Başla",
      signUp: "Kayıt Ol",
      alreadyHaveAccount: "Hesabın var mı?",
      emailLabel: "E-posta adresi",
      emailInputPlaceholder: "E-posta adresin",
      passwordLabel: "Şifre Oluştur",
      passwordInputPlaceholder: "Şifren",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()
</script>

<svelte:head>
  <title>{t.signUp}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.signUp}</h1>
<Auth
  supabaseClient={data.supabase}
  view="sign_up"
  redirectTo={`${data.url}/auth/callback`}
  showLinks={false}
  providers={oauthProviders}
  socialLayout="horizontal"
  appearance={sharedAppearance}
  additionalData={undefined}
  localization={{
    variables: {
      sign_up: {
        email_label: t.emailLabel,
        email_input_placeholder: t.emailInputPlaceholder,
        password_label: t.passwordLabel,
        password_input_placeholder: t.passwordInputPlaceholder,
        button_label: t.signUp,
      },
    },
  }}
/>
<div class="text-l text-slate-800 mt-4 mb-2">
  {t.alreadyHaveAccount}
  <a class="underline" href="/giris/giris-yap">{t.signIn}</a>.
</div>
