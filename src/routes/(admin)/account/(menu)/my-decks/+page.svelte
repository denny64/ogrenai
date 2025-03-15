<script lang="ts">
  import { goto } from "$app/navigation"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import DeckCard from "$lib/Card/DeckCard.svelte"
  import Spinner from "$lib/Spinner/Spinner.svelte"
  import { defaultDeckColors } from "$lib/utils"
  import { deckListState } from "$lib/store/deckList.svelte"
  import { language } from "$lib/stores/language"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("my-decks")

  let { data } = $props()
  let { profile, user, deckList } = data

  // Initialize showDeckList with deckListState if it exists, otherwise use the server data
  let showDeckList = $state(
    deckListState.deckList?.length
      ? [...deckListState.deckList]
      : [...deckList],
  )

  let creatingDeck = $state(false)
  let deckName = $state("")

  let newDeckListData = $derived.by(() => {
    return {
      deckList: [...showDeckList],
    }
  })

  console.log("user", user)
  console.log("profile", profile)
  console.log("deckList", deckList)

  const handleAddDeck = async () => {
    creatingDeck = true
    console.log("Adding new deck")
    const response = await fetch("/account/api/deck", {
      method: "POST",
      body: JSON.stringify({
        type: "createDeck",
        data: {
          title: deckName || t.newDeck,
          deckColor:
            defaultDeckColors[
              Math.floor(Math.random() * defaultDeckColors.length)
            ],
        },
      }),
    }).then((res) => res.json())
    console.log("CREATING DECK?", response)

    // Update both showDeckList and deckListState
    const newDeck = { ...response.data }
    showDeckList = [...showDeckList, newDeck]
    deckListState.deckList = [...deckListState.deckList, newDeck]

    creatingDeck = false
    add_deck_modal.close()
    goto(`/account/deck/${response.data.id}`)
  }

  // const createBooking = async () => {
  //   isBooking = true;
  //   console.log("creating booking with data ===", $superBookingForm);
  //   const response = await fetch("/api/bookings", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       type: "createBooking",
  //       data: {
  //         ...$superBookingForm,
  //         restaurantId: userRestaurant.id,
  //       },
  //     }),
  //   }).then((res) => res.json());
  //   console.log("BOOKING RESPONSE", response);
  //   isBooking = false;
  // };

  // RENAME DECK STUFF
  let newDeckName = $state(null)
  let currentDeckId = $state(null)
  let renamingDeck = $state(false)

  const openRenameDeckModal = (event, deck) => {
    event.stopPropagation()
    console.log("OPENING RENAME DECK MODAL id ==", deck)
    newDeckName = deck.title
    currentDeckId = deck.id
    rename_deck_modal.showModal()
  }

  const handleRenameDeck = async () => {
    renamingDeck = true
    console.log("NEW DECK NAME", newDeckName)
    console.log("CURRENT DECK ID", currentDeckId)
    const response = await fetch("/account/api/deck", {
      method: "POST",
      body: JSON.stringify({
        type: "renameDeck",
        data: {
          id: currentDeckId,
          title: newDeckName,
        },
      }),
    }).then((res) => res.json())
    console.log("RENAMED DECK@@@@", response)

    // Update both showDeckList and deckListState
    const updatedDeckList = showDeckList.map((deck) =>
      deck.id === currentDeckId ? { ...deck, title: newDeckName } : deck,
    )
    showDeckList = updatedDeckList
    deckListState.deckList = updatedDeckList

    renamingDeck = false
    rename_deck_modal.close()
  }

  // Add these state variables near the other state declarations
  let deletingDeck = $state(false)
  let deckToDelete = $state(null)

  // Add this function near the other handler functions
  const handleDeleteDeck = async () => {
    deletingDeck = true
    console.log("Deleting deck", deckToDelete)
    const response = await fetch("/account/api/deck", {
      method: "POST",
      body: JSON.stringify({
        type: "deleteDeck",
        data: {
          id: deckToDelete.id,
        },
      }),
    }).then((res) => res.json())
    console.log("DELETED DECK", response)

    // Update both showDeckList and deckListState
    const filteredDeckList = showDeckList.filter(
      (deck) => deck.id !== deckToDelete.id,
    )
    showDeckList = filteredDeckList
    deckListState.deckList = filteredDeckList

    deletingDeck = false
    delete_deck_modal.close()
  }

  const openDeleteDeckModal = (event, deck) => {
    event.stopPropagation()
    console.log("OPENING DELETE DECK MODAL id ==", deck)
    deckToDelete = deck
    delete_deck_modal.showModal()
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
      myDecks: "My decks",
      addDeck: "Add deck",
      learn: "Learn",
      active: "Active",
      noDeckCreated: "No decks created yet",
      addDeckTitle: "Add deck",
      deckName: "Deck name",
      deckNamePlaceholder: "e.g. Frog Facts",
      cancel: "Cancel",
      createDeck: "Create deck",
      creatingDeck: "Creating deck...",
      renameDeck: "Rename deck",
      enterNewDeckName: "Enter new deck name",
      confirm: "Confirm",
      confirming: "Confirming...",
      deleteDeck: "Delete deck",
      areYouSureDelete: "Are you sure you want to delete",
      cannotBeUndone: "This action cannot be undone.",
      delete: "Delete deck",
      deleting: "Deleting...",
      newDeck: "New deck",
    },
    tr: {
      myDecks: "Benim Destelerim",
      addDeck: "Deste Ekle",
      learn: "Öğren",
      active: "Aktif",
      noDeckCreated: "Henüz oluşturulmuş deste yok",
      addDeckTitle: "Deste Ekle",
      deckName: "Deste adı",
      deckNamePlaceholder: "örn. Kurbağa Bilgileri",
      cancel: "İptal",
      createDeck: "Deste Oluştur",
      creatingDeck: "Deste oluşturuluyor...",
      renameDeck: "Desteyi Yeniden Adlandır",
      enterNewDeckName: "Yeni deste adını girin",
      confirm: "Onayla",
      confirming: "Onaylanıyor...",
      deleteDeck: "Desteyi Sil",
      areYouSureDelete: "Silmek istediğinizden emin misiniz",
      cannotBeUndone: "Bu işlem geri alınamaz.",
      delete: "Desteyi Sil",
      deleting: "Siliniyor...",
      newDeck: "Yeni Deste",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })
</script>

<svelte:head>
  <title>{t.myDecks}</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <!-- Content area -->
  <div class="flex justify-between items-center">
    <h1 class="text-4xl font-bold">{t.myDecks}</h1>
    <div class="flex gap-2">
      <button class="btn btn-outline" onclick={() => add_deck_modal.showModal()}
        >{t.addDeck}</button
      >
      <button class="btn btn-primary">{t.learn}</button>
    </div>
  </div>

  <!-- Tabs -->
  <div role="tablist" class="tabs tabs-lifted">
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label={t.active}
      checked
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      {#if newDeckListData.deckList.length > 0}
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {#each newDeckListData.deckList as deck, i}
            <DeckCard {deck} {openRenameDeckModal} {openDeleteDeckModal} />
          {/each}
        </div>
      {:else}
        <div class="text-center text-base-content/70">{t.noDeckCreated}</div>
      {/if}
    </div>

    <!-- <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label="Archived"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      No decks archived
    </div> -->
  </div>
</div>

<!-- Add deck modal -->
<dialog id="add_deck_modal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="font-bold text-lg mb-4">{t.addDeckTitle}</h3>
    <div class="flex flex-col gap-4">
      <!-- <div>
        <p class="mb-2">Within</p>
        <div class="border rounded-full inline-block px-4 py-2">My decks</div>
      </div> -->
      <div>
        <p class="mb-2">{t.deckName}</p>
        <input
          name="deckName"
          type="text"
          placeholder={t.deckNamePlaceholder}
          class="input input-bordered w-full"
          bind:value={deckName}
        />
      </div>
      <!-- <div class="flex justify-between items-center">
        <button class="flex items-center gap-2 text-base-content/70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add multiple
        </button>
      </div> -->
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button class="btn" disabled={creatingDeck}>{t.cancel}</button>
          <button
            type="button"
            class="btn btn-primary"
            onclick={handleAddDeck}
            disabled={creatingDeck}
            >{#if creatingDeck}<Spinner /> {t.creatingDeck}
            {:else}
              {t.createDeck}
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

<!-- RENAME DECK modal -->
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
          placeholder={t.deckNamePlaceholder}
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

<!-- DELETE DECK modal -->
<dialog id="delete_deck_modal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="font-bold text-lg mb-4">{t.deleteDeck}</h3>
    <div class="flex flex-col gap-4">
      <p class="text-error">
        {t.areYouSureDelete} "{deckToDelete?.title}"?
      </p>
      <p class="text-base-content/70">{t.cannotBeUndone}</p>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button class="btn" disabled={deletingDeck}>{t.cancel}</button>
          <button
            type="button"
            class="btn btn-error"
            onclick={handleDeleteDeck}
            disabled={deletingDeck}
          >
            {#if deletingDeck}
              <Spinner /> {t.deleting}
            {:else}
              {t.delete}
            {/if}
          </button>
        </form>
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
