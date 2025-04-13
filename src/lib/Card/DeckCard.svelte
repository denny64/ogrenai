<script lang="ts">
  import { goto } from "$app/navigation"
  import { language } from "$lib/stores/language"

  let { deck, openRenameDeckModal, openDeleteDeckModal } = $props()

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      renameDeck: "Rename deck",
      deleteDeck: "Delete deck",
      cards: "cards",
    },
    tr: {
      renameDeck: "Desteyi Yeniden Adlandır",
      deleteDeck: "Desteyi Sil",
      cards: "kartlar",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  const clickCard = () => {
    console.log("clicked card")
    goto(`/hesap/kart-destesi/${deck.id}`)
  }

  const handleOptionsClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  // console.log("DECK CARD", deck)
</script>

<div class="card bg-white shadow-xl cursor-pointer" onclick={clickCard}>
  <div class="card-body p-0">
    <div
      class="flex justify-between items-start p-4 rounded-t-xl text-gray-900"
      style="background-color: {deck.deck_color};"
    >
      <h2 class="card-title">{deck.title}</h2>
      <div class="dropdown dropdown-end">
        <button
          class="btn btn-ghost btn-sm btn-circle text-emerald-900 hover:bg-white"
          aria-label="Deck options"
          aria-haspopup="true"
          onclick={handleOptionsClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="w-4 h-4 stroke-current"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            ></path></svg
          >
        </button>
        <ul
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button
              class="flex items-center gap-2"
              onclick={() => openRenameDeckModal(event, deck)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                ></path><path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                ></path></svg
              >
              {t.renameDeck}
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={() => openDeleteDeckModal(event, deck)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                ></path></svg
              >
              {t.deleteDeck}
            </button>
          </li>
          <!-- <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                ></path></svg
              >
              Change colour
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"><path d="M5 9l7 7 7-7"></path></svg
              >
              Move
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path></svg
              >
              Share
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path></svg
              >
              Archive
            </button>
          </li> -->
        </ul>
      </div>
    </div>
    <div class="px-4 min-h-[48px] flex items-center">
      {#if deck.card.length > 0}
        <p class="text-sm text-gray-500">{deck.card.length} {t.cards}</p>
      {/if}
    </div>
  </div>
</div>
