<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      signOutYes: "Signing out....",
      signOutNo: "There was an issue signing out.",
    },
    tr: {
      // signOutYes: "Çıkış yapılıyor....",
      // signOutNo: "Çıkış yapılırken bir sorun oluştu.",
      signOutYes: "Oturum kapatılıyor....",
      signOutNo: "Oturumu kapatma sırasında bir sorun oluştu.",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()

  let { supabase } = data
  let message = $state("")

  $effect(() => {
    message = t.signOutYes
  })

  // on mount, sign out
  onMount(() => {
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        message = t.signOutNo
      } else {
        goto("/")
      }
    })
  })
</script>

<h1 class="text-2xl font-bold m-6 mx-auto my-auto">{message}</h1>
