<script lang="ts">
  import { Auth } from "@supabase/auth-ui-svelte"
  import { sharedAppearance, oauthProviders } from "../login_config"
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
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
      signIn: "Sign In",
      signUp: "Sign Up",
      emailLabel: "Email address",
      emailInputPlaceholder: "Your email address",
      passwordLabel: "Your Password",
      passwordInputPlaceholder: "Your password",
      buttonLabel: "Sign in",
      emailVerified: "Email verified! Please sign in.",
      forgotPassword: "Forgot Password?",
      dontHaveAccount: "Don't have an account?",
    },
    tr: {
      signIn: "Giriş Yap",
      signUp: "Kayıt Ol",
      emailLabel: "E-posta adresi",
      emailInputPlaceholder: "E-posta adresin",
      passwordLabel: "Şifren",
      passwordInputPlaceholder: "Şifren",
      buttonLabel: "Giriş Yap",
      emailVerified: "E-posta doğrulandı! Lütfen giriş yapın.",
      forgotPassword: "Şifremi Unuttum?",
      dontHaveAccount: "Hesabın yok mu?",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()
  let { supabase } = data

  onMount(() => {
    supabase.auth.onAuthStateChange((event) => {
      // Redirect to account after successful login
      if (event == "SIGNED_IN") {
        // Delay needed because order of callback not guaranteed.
        // Give the layout callback priority to update state or
        // we'll just bounch back to login when /hesap tries to load
        setTimeout(() => {
          goto("/hesap/kartlarim")
        }, 1)
      }
    })
  })

  // * Supabase Auth Error Message Translation
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

            // let translatedErrorMessage = "<DEFAULT MESSAGE>"
            let translatedErrorMessage =
              currentLang === "tr"
                ? "Geçersiz giriş bilgileri"
                : "Invalid login credentials"
            switch (originErrorMessage) {
              case "Invalid login credentials":
                translatedErrorMessage = "Geçersiz giriş bilgileri"
                break
              case "missing email or phone":
                translatedErrorMessage = "E-posta veya telefon numarası eksik"
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
  <title>{t.signIn}</title>
</svelte:head>

{#if $page.url.searchParams.get("verified") == "true"}
  <div role="alert" class="alert alert-success mb-5">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      /></svg
    >
    <span>{t.emailVerified}</span>
  </div>
{/if}
<h1 class="text-2xl font-bold mb-6">{t.signIn}</h1>
<Auth
  supabaseClient={data.supabase}
  view="sign_in"
  redirectTo={`${data.url}/auth/callback`}
  providers={oauthProviders}
  socialLayout="horizontal"
  showLinks={false}
  appearance={sharedAppearance}
  additionalData={undefined}
  localization={{
    variables: {
      sign_in: {
        email_label: t.emailLabel,
        email_input_placeholder: t.emailInputPlaceholder,
        password_label: t.passwordLabel,
        password_input_placeholder: t.passwordInputPlaceholder,
        button_label: t.signIn,
      },
    },
  }}
/>
<div class="text-l text-slate-800 mt-4">
  <a class="underline" href="/giris/sifre-mi-unuttun">{t.forgotPassword}</a>
</div>
<div class="text-l text-slate-800 mt-3">
  {t.dontHaveAccount}
  <a class="underline" href="/giris/kayit-ol">{t.signUp}</a>.
</div>
