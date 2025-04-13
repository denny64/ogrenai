<script lang="ts">
  import SettingsModule from "../settings_module.svelte"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()

  let { profile } = data

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
      editProfile: "Edit Profile",
      savedProfile: "Saved Profile",
      name: "Name",
      yourFullName: "Your full name",
    },
    tr: {
      settings: "Ayarlar",
      editProfile: "Profili Düzenle",
      savedProfile: "Profil Kaydedildi",
      name: "İsim",
      yourFullName: "Tam adınız",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.editProfile}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.settings}</h1>

<SettingsModule
  editable={true}
  title={t.editProfile}
  successTitle={t.savedProfile}
  formTarget="/hesap/api?/updateProfile"
  fields={[
    {
      id: "fullName",
      label: t.name,
      initialValue: profile?.full_name ?? "",
      placeholder: t.yourFullName,
      maxlength: 50,
    },
    // {
    //   id: "companyName",
    //   label: "Company Name",
    //   initialValue: profile?.company_name ?? "",
    //   maxlength: 50,
    // },
    // {
    //   id: "website",
    //   label: "Company Website",
    //   initialValue: profile?.website ?? "",
    //   maxlength: 50,
    // },
  ]}
/>
