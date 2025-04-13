<script lang="ts">
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "./settings_module.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let { profile, user, subscriptionStats } = data

  console.log("sub stats", subscriptionStats)

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
      profile: "Profile",
      name: "Name",
      editProfile: "Edit Profile",
      email: "Email",
      changeEmail: "Change Email",
      password: "Password",
      changePassword: "Change Password",
      subscription: "Email Subscription",
      changeSubscription: "Change Subscription",
      dangerZone: "Danger Zone",
      deleteAccount: "Delete Account",
    },
    tr: {
      settings: "Ayarlar",
      profile: "Profil",
      name: "İsim",
      editProfile: "Profili Düzenle",
      email: "E-posta",
      changeEmail: "E-postayı Değiştir",
      password: "Şifre",
      changePassword: "Şifreyi Değiştir",
      subscription: "Abonelik",
      changeSubscription: "Aboneliği Değiştir",
      dangerZone: "Tehlikeli Bölge",
      deleteAccount: "Hesabı Sil",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.settings}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.settings}</h1>

<SettingsModule
  title={t.profile}
  editable={false}
  fields={[
    { id: "fullName", label: t.name, initialValue: profile?.full_name ?? "" },
    // {
    //   id: "companyName",
    //   label: "Company Name",
    //   initialValue: profile?.company_name ?? "",
    // },
    // {
    //   id: "website",
    //   label: "Company Website",
    //   initialValue: profile?.website ?? "",
    // },
  ]}
  editButtonTitle={t.editProfile}
  editLink="/account/settings/edit_profile"
/>

<SettingsModule
  title={t.email}
  editable={false}
  fields={[{ id: "email", initialValue: user?.email || "" }]}
  editButtonTitle={t.changeEmail}
  editLink="/account/settings/change_email"
/>

<SettingsModule
  title={t.password}
  editable={false}
  fields={[{ id: "password", initialValue: "••••••••••••••••" }]}
  editButtonTitle={t.changePassword}
  editLink="/account/settings/change_password"
/>

<!-- <SettingsModule
  title={t.subscription}
  editable={false}
  fields={[
    {
      id: "subscriptionStatus",
      initialValue: profile?.unsubscribed ? "Unsubscribed" : "Subscribed",
    },
  ]}
  editButtonTitle={t.changeSubscription}
  editLink="/account/settings/change_email_subscription"
/> -->

<!-- MANAGE SUBSCRIPTION -->
<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow">
  <div class="text-xl font-bold mb-3 w-48 md:pr-8 flex-none">Subscription</div>

  <div class="w-full min-w-48">
    <div>
      <label for="fullName"
        ><span class="text-sm text-gray-500">Current Plan</span></label
      >
      <div class="text-lg mb-3">
        <span class="badge badge-lg badge-primary"
          >{subscriptionStats.plan}</span
        >
      </div>
    </div>
    <!-- <a href="/account/settings">
      <button class="btn btn-outline btn-sm mt-3 min-w-[145px]">
        Manage
      </button>
    </a> -->
  </div>
</div>

<!-- DELETE ACCOUNT -->
<SettingsModule
  title={t.dangerZone}
  editable={false}
  dangerous={true}
  fields={[]}
  editButtonTitle={t.deleteAccount}
  editLink="/account/settings/delete_account"
/>
