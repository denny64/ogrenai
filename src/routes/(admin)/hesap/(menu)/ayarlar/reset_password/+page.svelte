<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

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
      resetPassword: "Reset Password",
      passwordChanged: "Password Changed",
      passwordChangedMessage: "On next sign in, use your new password.",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      returnSettingsLink: "Return to Settings",
    },
    tr: {
      settings: "Ayarlar",
      resetPassword: "Şifreyi Sıfırla",
      passwordChanged: "Şifre Değiştirildi",
      passwordChangedMessage: "Bir sonraki girişte yeni şifrenizi kullanın.",
      newPassword: "Yeni Şifre",
      confirmNewPassword: "Yeni Şifreyi Onayla",
      returnSettingsLink: "Ayarlar'a dön",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.resetPassword}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.settings}</h1>

<SettingsModule
  title={t.resetPassword}
  editable={true}
  saveButtonTitle={t.resetPassword}
  successTitle={t.passwordChanged}
  successBody={t.passwordChangedMessage}
  returnSettingsLink={t.returnSettingsLink}
  formTarget="/hesap/api?/updatePassword"
  fields={[
    {
      id: "newPassword1",
      label: t.newPassword,
      initialValue: "",
      inputType: "password",
    },
    {
      id: "newPassword2",
      label: t.confirmNewPassword,
      initialValue: "",
      inputType: "password",
    },
  ]}
/>
