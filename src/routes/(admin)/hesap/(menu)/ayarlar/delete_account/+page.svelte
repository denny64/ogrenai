<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let { session } = data

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
      deleteAccount: "Delete Account",
      accountQueuedForDeletion: "Account queued for deletion",
      accountWillBeDeleted: "Your account will be deleted shortly.",
      deleteAccountMessage:
        "Deleting your account can not be undone. You are currently logged in as '{email}'",
      currentPassword: "Current Password",
    },
    tr: {
      settings: "Ayarlar",
      deleteAccount: "Hesabı Sil",
      accountQueuedForDeletion: "Hesap silme işlemi sıraya alındı",
      accountWillBeDeleted: "Hesabınız kısa süre içinde silinecektir.",
      deleteAccountMessage:
        "Hesabınızı silme işlemi geri alınamaz. Şu anda '{email}' olarak giriş yapmış durumdasınız",
      currentPassword: "Mevcut Şifre",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.deleteAccount}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.settings}</h1>

<SettingsModule
  title={t.deleteAccount}
  editable={true}
  dangerous={true}
  message={t.deleteAccountMessage.replace(
    "{email}",
    session?.user?.email || "",
  )}
  saveButtonTitle={t.deleteAccount}
  successTitle={t.accountQueuedForDeletion}
  successBody={t.accountWillBeDeleted}
  formTarget="/hesap/api?/deleteAccount"
  fields={[
    {
      id: "currentPassword",
      label: t.currentPassword,
      initialValue: "",
      inputType: "password",
    },
  ]}
/>
