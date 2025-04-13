<script lang="ts">
  import { page } from "$app/stores"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import SettingsModule from "../settings_module.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("settings")

  let { data } = $props()
  let { user, supabase } = data

  // True if definitely has a password, but can be false if they
  // logged in with oAuth or email link

  // @ts-expect-error: we ignore because Supabase does not maintain an AMR typedef
  let hasPassword = user?.amr?.find((x) => x.method === "password")
    ? true
    : false

  // @ts-expect-error: we ignore because Supabase does not maintain an AMR typedef
  let usingOAuth = user?.amr?.find((x) => x.method === "oauth") ? true : false

  let sendBtnDisabled = $state(false)
  let sendBtnText = $state("Send Set Password Email")
  let sentEmail = $state(false)
  let sendForgotPassword = () => {
    sendBtnDisabled = true
    sendBtnText = "Sending..."

    let email = user?.email
    if (email) {
      supabase.auth
        .resetPasswordForEmail(email, {
          redirectTo: `${$page.url.origin}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`,
        })
        .then((d) => {
          sentEmail = d.error ? false : true
          sendBtnDisabled = false
          sendBtnText = "Send Forgot Password Email"
        })
    }
  }

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
      changePassword: "Change Password",
      passwordChanged: "Password Changed",
      passwordChangedMessage: "On next sign in, use your new password.",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      currentPassword: "Current Password",
      setPasswordByEmail: "Set Password By Email",
      changePasswordByEmail: "Change Password By Email",
      oAuthMessage:
        'You use oAuth to sign in ("Sign in with Github" or similar). You can continue to access your account using only oAuth if you like!',
      emailMessage:
        "The button below will send you an email at {email} which will allow you to set your password.",
      sendSetPasswordEmail: "Send Set Password Email",
      sendForgotPasswordEmail: "Send Forgot Password Email",
      sending: "Sending...",
      emailSentMessage:
        "Sent email! Please check your inbox and use the link to set your password.",
    },
    tr: {
      settings: "Ayarlar",
      changePassword: "Şifreyi Değiştir",
      passwordChanged: "Şifre Değiştirildi",
      passwordChangedMessage: "Bir sonraki girişte yeni şifrenizi kullanın.",
      newPassword: "Yeni Şifre",
      confirmNewPassword: "Yeni Şifreyi Onayla",
      currentPassword: "Mevcut Şifre",
      setPasswordByEmail: "E-posta ile Şifre Belirle",
      changePasswordByEmail: "E-posta ile Şifre Değiştir",
      oAuthMessage:
        'Giriş yapmak için oAuth kullanıyorsunuz ("Github ile Giriş Yap" veya benzeri). İsterseniz hesabınıza sadece oAuth kullanarak erişmeye devam edebilirsiniz!',
      emailMessage:
        "Aşağıdaki düğme, şifrenizi belirlemenizi sağlayacak bir e-postayı {email} adresine gönderecektir.",
      sendSetPasswordEmail: "Şifre Belirleme E-postası Gönder",
      sendForgotPasswordEmail: "Şifremi Unuttum E-postası Gönder",
      sending: "Gönderiliyor...",
      emailSentMessage:
        "E-posta gönderildi! Lütfen gelen kutunuzu kontrol edin ve şifrenizi belirlemek için bağlantıyı kullanın.",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  // Update button text based on language
  $effect(() => {
    if (!sendBtnDisabled) {
      sendBtnText = t.sendSetPasswordEmail
    } else if (sendBtnDisabled && !sentEmail) {
      sendBtnText = t.sending
    }
  })
</script>

<svelte:head>
  <title>{t.changePassword}</title>
</svelte:head>

<h1 class="text-2xl font-bold mb-6">{t.changePassword}</h1>

{#if hasPassword}
  <SettingsModule
    title={t.changePassword}
    editable={true}
    saveButtonTitle={t.changePassword}
    successTitle={t.passwordChanged}
    successBody={t.passwordChangedMessage}
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
      {
        id: "currentPassword",
        label: t.currentPassword,
        initialValue: "",
        inputType: "password",
      },
    ]}
  />
{:else}
  <div
    class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow max-w-md"
  >
    <div class="flex flex-col gap-y-4">
      {#if usingOAuth}
        <div class="font-bold">{t.setPasswordByEmail}</div>
        <div>
          {t.oAuthMessage}
        </div>
      {:else}
        <div class="font-bold">{t.changePasswordByEmail}</div>
      {/if}
      <div>
        {t.emailMessage.replace("{email}", user?.email || "")}
      </div>
      <button
        class="btn btn-outline btn-wide {sentEmail ? 'hidden' : ''}"
        disabled={sendBtnDisabled}
        onclick={sendForgotPassword}
      >
        {sendBtnText}
      </button>
      <div class="success alert alert-success {sentEmail ? '' : 'hidden'}">
        {t.emailSentMessage}
      </div>
    </div>
  </div>
{/if}
