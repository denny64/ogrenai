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
      checkEmailConfirm: "Check your email for a confirmation link",
      passwordError: "Password should be at least 6 characters.",
      loading: "Signing up...",
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
      checkEmailConfirm: "Onay bağlantısı için e-postanı kontrol et",
      passwordError: "Şifre en az 6 karakter olmalıdır.",
      loading: "Kayıt oluyor...",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()

  $effect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
          return

        for (const node of mutation.addedNodes) {
          if (
            node instanceof HTMLElement &&
            (node.classList.contains("supabase-account-ui_ui-message") ||
              node.classList.contains("supabase-auth-ui_ui-message"))
          ) {
            const originErrorMessage = node.innerHTML.trim()

            console.log("originErrorMessage", originErrorMessage)

            // let translatedErrorMessage = "<DEFAULT MESSAGE>"
            // let translatedErrorMessage =
            //   currentLang === "tr"
            //     ? "Geçersiz giriş bilgileri"
            //     : "Invalid login credentials"
            let translatedErrorMessage = `${t.passwordError}`
            switch (originErrorMessage) {
              case "Anonymous sign-ins are disabled":
                translatedErrorMessage = "ahkmadkh"
                break
              case "Password should be at least 6 characters.":
                translatedErrorMessage = `${t.passwordError}`
                break
              case "Invalid login credentials":
                translatedErrorMessage = ""
                break
            }

            if (!document.querySelector("#auth-forgot-password")) {
              node.innerHTML = translatedErrorMessage
            }
          }
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
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
        loading_button_label: t.loading,
        confirmation_text: t.checkEmailConfirm,
      },
    },
  }}
/>
<div class="text-l text-slate-800 mt-4 mb-2">
  {t.alreadyHaveAccount}
  <a class="underline" href="/giris/giris-yap">{t.signIn}</a>.
</div>
