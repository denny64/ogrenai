<script lang="ts">
  import Spinner from "$lib/Spinner/Spinner.svelte"
  // import { renameDeckState } from "$lib/store/deck.svelte"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      renameDeck: "Rename deck",
      enterNewDeckName: "Enter new deck name",
      confirm: "Confirm",
      confirming: "Confirming...",
      cancel: "Cancel",
    },
    tr: {
      renameDeck: "Desteyi Yeniden Adlandır",
      enterNewDeckName: "Yeni deste adını girin",
      confirm: "Onayla",
      confirming: "Onaylanıyor...",
      cancel: "İptal",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { renamingDeck, handleRenameDeck, newDeckName = $bindable() } = $props()
</script>

<!-- RENAME DECK modal  -->
<dialog id="rename_deck_modal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="font-bold text-lg mb-4">{t.renameDeck}</h3>
    <div class="flex flex-col gap-4">
      <div>
        <p class="mb-2">{t.enterNewDeckName}</p>
        <input
          name="newDeckName"
          type="text"
          placeholder="e.g. Frog Facts"
          class="input input-bordered w-full"
          bind:value={newDeckName}
        />
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button class="btn" disabled={renamingDeck}>{t.cancel}</button>
          <button
            type="button"
            class="btn btn-primary"
            onclick={handleRenameDeck}
            disabled={renamingDeck}
            >{#if renamingDeck}<Spinner /> {t.confirming}
            {:else}
              {t.confirm}
            {/if}</button
          >
        </form>
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
