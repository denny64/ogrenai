<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()

  let { user } = data

  // Language and translations
  let currentLang = $state<"en" | "tr">("tr")

  // Initialize from the store
  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      settings: "Settings",
      changeEmail: "Change Email",
      emailChangeInitiated: "Email change initiated",
      emailChangeMessage:
        "You should receive emails at both the old and new address to confirm the change. Please click the link in both emails to finalized the change. Until finalized, you must sign in with your current email.",
      email: "Email",
      emailAddress: "Email address",
    },
    tr: {
      settings: "Ayarlar",
      changeEmail: "E-postayı Değiştir",
      emailChangeInitiated: "E-posta değişikliği başlatıldı",
      emailChangeMessage:
        "Değişikliği onaylamak için hem eski hem de yeni adrese e-postalar almalısınız. Değişikliği tamamlamak için lütfen her iki e-postadaki bağlantıya tıklayın. Tamamlanana kadar mevcut e-postanızla giriş yapmalısınız.",
      email: "E-posta",
      emailAddress: "E-posta adresi",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.changeEmail}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.settings}</h1>

<SettingsModule
  title={t.changeEmail}
  editable={true}
  successTitle={t.emailChangeInitiated}
  successBody={t.emailChangeMessage}
  formTarget="/hesap/api?/updateEmail"
  fields={[
    {
      id: "email",
      label: t.email,
      initialValue: user?.email ?? "",
      placeholder: t.emailAddress,
    },
  ]}
/>
