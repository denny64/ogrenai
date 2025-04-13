<script lang="ts">
  import SettingsModule from "../settings_module.svelte"
  import { language } from "$lib/stores/language"

  let { data } = $props()
  let { profile } = data
  let unsubscribed = profile?.unsubscribed

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
      emailSubscription: "Email Subscription",
      subscription: "Subscription",
      currentlyUnsubscribed: "You are currently unsubscribed from emails",
      currentlySubscribed: "You are currently subscribed to emails",
      resubscribe: "Re-subscribe",
      unsubscribe: "Unsubscribe",
      resubscribedMessage: "You have been re-subscribed to emails",
      unsubscribedMessage: "You have been unsubscribed from emails",
    },
    tr: {
      emailSubscription: "E-posta Aboneliği",
      subscription: "Abonelik",
      currentlyUnsubscribed: "Şu anda e-postalara abone değilsiniz",
      currentlySubscribed: "Şu anda e-postalara abonesiniz",
      resubscribe: "Yeniden Abone Ol",
      unsubscribe: "Abonelikten Çık",
      resubscribedMessage: "E-postalara yeniden abone oldunuz",
      unsubscribedMessage: "E-posta aboneliğinden çıktınız",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.emailSubscription}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.emailSubscription}</h1>

<SettingsModule
  editable={true}
  title={t.subscription}
  message={unsubscribed ? t.currentlyUnsubscribed : t.currentlySubscribed}
  saveButtonTitle={unsubscribed ? t.resubscribe : t.unsubscribe}
  successBody={unsubscribed ? t.resubscribedMessage : t.unsubscribedMessage}
  formTarget="/hesap/api?/toggleEmailSubscription"
  fields={[]}
/>
