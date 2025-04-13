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
      forgotPassword: "Forgot Password",
      rememberPassword: "Already have an account?",
      emailLabel: "Email address",
      emailInputPlaceholder: "Your email address",
      passwordLabel: "Your Password",
      passwordInputPlaceholder: "Your password",
      buttonLabel: "Send reset password instructions",
      loadingButtonLabel: "Sending...",
      confirmationText: "Check your email for the password reset link.",
    },
    tr: {
      signIn: "Giriş Yap",
      forgotPassword: "Şifremi Unuttum",
      rememberPassword: "Şifrenizi hatırlıyor musunuz?",
      emailLabel: "E-posta adresi",
      emailInputPlaceholder: "E-posta adresin",
      passwordLabel: "Şifren",
      passwordInputPlaceholder: "Şifren",
      buttonLabel: "Şifre sıfırlama talimatlarını gönder",
      loadingButtonLabel: "Gönderiliyor...",
      confirmationText:
        "Şifre sıfırlama bağlantısı için e-postanızı kontrol edin.",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()
</script>

<svelte:head>
  <title>{t.forgotPassword}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.forgotPassword}</h1>
<Auth
  supabaseClient={data.supabase}
  view="forgotten_password"
  redirectTo={`${data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`}
  providers={oauthProviders}
  socialLayout="horizontal"
  showLinks={false}
  appearance={sharedAppearance}
  additionalData={undefined}
  localization={{
    variables: {
      forgotten_password: {
        email_label: t.emailLabel,
        email_input_placeholder: t.emailInputPlaceholder,
        password_label: t.passwordLabel,
        button_label: t.buttonLabel,
        loading_button_label: t.loadingButtonLabel,
        confirmation_text: t.confirmationText,
      },
    },
  }}
/>
<div class="text-l text-slate-800 mt-4">
  {t.rememberPassword}
  <a class="underline" href="/giris/giris-yap">{t.signIn}</a>.
</div>
