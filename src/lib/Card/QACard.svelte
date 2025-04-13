<script lang="ts">
  import EditCardModal from "$lib/Modal/EditCardModal.svelte"
  import Spinner from "$lib/Spinner/Spinner.svelte"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      deleteCard: "Delete card",
      editCard: "Edit card",
      areYouSureDelete: "Are you sure you want to delete this card?",
      cannotBeUndone: "This action cannot be undone.",
      delete: "Delete",
      deleting: "Deleting...",
      cardQuestion: "Card question",
      cardAnswer: "Card answer",
      save: "Save",
      saving: "Saving...",
      cancel: "Cancel",
      viewSource: "View Source",
    },
    tr: {
      deleteCard: "Kartı Sil",
      editCard: "Kartı Düzenle",
      areYouSureDelete: "Bu kartı silmek istediğinize emin misiniz?",
      cannotBeUndone: "Bu işlem geri alınamaz.",
      delete: "Sil",
      deleting: "Siliniyor...",
      cardQuestion: "Kart sorusu",
      cardAnswer: "Kart cevabı",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      cancel: "İptal",
      viewSource: "Kaynak",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { card, removeCard } = $props()

  let cardSource = card.data_source[0]

  let correctAnswer = card?.answer?.find((answer) => answer.correct)
  let cardQuestion = card.question

  console.log("CARD", card)
  console.log("CORRECT ANSWER", correctAnswer)

  const handleOptionsClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const openEditCardModal = (event, card) => {
    event.stopPropagation()
    console.log("OPENING EDIT CARD MODAL id ==", card)
    // console.log("OPENING RENAME DECK MODAL id ==", deck)
    // // deckState.name = deck.title
    // // deckState.id = deck.id
    // console.log("RENAME DECK STATE", deckState)
    edit_card_modal.showModal()
  }

  let editingCard = $state(false)
  let newCardQuestion = $state(cardQuestion)
  let newCardAnswer = $state({ ...correctAnswer })

  let cardData = $derived.by(() => {
    return {
      id: card.id,
      question: card.question,
      answer: [...card.answer],
    }
  })

  const handleEditCard = async () => {
    console.log("new card question", newCardQuestion)
    console.log("new card answer", newCardAnswer)
    editingCard = true

    let newCardAnswerObject = card.answer.map((answer) => {
      if (answer.correct) {
        return { ...newCardAnswer }
      }
      return { ...answer }
    })

    console.log("new card answer object", newCardAnswerObject)

    const response = await fetch("/hesap/api/card", {
      method: "POST",
      body: JSON.stringify({
        type: "editCard",
        data: {
          id: card.id,
          question: newCardQuestion,
          answer: newCardAnswerObject,
        },
      }),
    }).then((res) => res.json())
    console.log("EDITEDCARD", response)

    // deckState.updatedName = response.data.title
    // deckState.renaming = false
    if (response.success) {
      card.question = response.data.question
      card.answer = response.data.answer
    }

    console.log("UPDATED CARD DATA", cardData)
    editingCard = false
    edit_card_modal.close()
  }

  // Add this line to initialize the modal reference
  let edit_card_modal: HTMLDialogElement

  // Add these near the top with other state variables
  let delete_card_modal: HTMLDialogElement
  let deletingCard = $state(false)

  // Add this new handler
  const handleDeleteCard = async () => {
    deletingCard = true
    const response = await fetch("/hesap/api/card", {
      method: "POST",
      body: JSON.stringify({
        type: "deleteCard",
        data: {
          id: card.id,
        },
      }),
    }).then((res) => res.json())

    if (response.success) {
      removeCard(card.id)
    }

    deletingCard = false
    delete_card_modal.close()
  }

  // Update the delete button's click handler
  const openDeleteCardModal = (event) => {
    event.stopPropagation()
    delete_card_modal.showModal()
  }
</script>

{#if card && card.answer && card.question}
  <div class="bg-base-200 p-1 rounded-xl">
    <div class="bg-base-100 rounded-lg p-6">
      <!-- Card Header with Question and Menu -->
      <div class="flex justify-between items-start">
        <h3 class="text-xl font-medium">{cardData.question}</h3>
        <div class="dropdown dropdown-end">
          <button
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Card options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="1" /><circle
                cx="12"
                cy="5"
                r="1"
              /><circle cx="12" cy="19" r="1" /></svg
            >
          </button>
          <ul
            class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button
                class="flex items-center gap-2"
                onclick={() => openEditCardModal(event, card)}
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
                {t.editCard}
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
            </li> -->
            <li>
              <button
                class="flex items-center gap-2"
                onclick={openDeleteCardModal}
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
                {t.deleteCard}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="divider divider-default"></div>

      <!-- Answer Section -->
      <div class="mt-4">
        {#each cardData.answer as answer}
          {#if answer.correct || answer.isCorrect}
            <div class="bg-success/5 text-success-content rounded-lg p-4">
              {answer.option}
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Card Footer - Moved outside inner div -->
    <div class="flex gap-2 mt-4 px-6">
      <!-- <button class="btn btn-sm btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M12 20h9" /><path
            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
          /></svg
        >
        Questions (1)
      </button> -->
      <button
        class="btn btn-sm btn-ghost"
        onclick={() => {
          window.open(cardSource.source, "_blank")
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
          /><path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
          /></svg
        >
        {t.viewSource}
      </button>
      <button
        class="btn btn-sm btn-ghost btn-circle ml-auto"
        aria-label="Add new question"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg
        >
      </button>
    </div>
  </div>
{/if}

<!-- <EditCardModal
  editingCard={true}
  {handleEditCard}
  bind:newCardQuestion={card.question}
  bind:newCardAnswer={card.answer}
/> -->

<!-- EDIT CARD modal  -->
<dialog bind:this={edit_card_modal} id="edit_card_modal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="font-bold text-lg mb-4">{t.editCard}</h3>
    <div class="flex flex-col gap-4">
      <div>
        <p class="mb-2">{t.cardQuestion}</p>
        <input
          name="newCardQuestion"
          type="text"
          placeholder="e.g. Frog Facts"
          class="input input-bordered w-full"
          bind:value={newCardQuestion}
        />
      </div>
      <div>
        <p class="mb-2">{t.cardAnswer}</p>
        <input
          name="newCardAnswer"
          type="text"
          placeholder="e.g. Frog Facts"
          class="input input-bordered w-full"
          bind:value={newCardAnswer.option}
        />
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button class="btn" disabled={editingCard}>{t.cancel}</button>
          <button
            type="button"
            class="btn btn-primary"
            onclick={handleEditCard}
            disabled={editingCard}
            >{#if editingCard}<Spinner /> {t.saving}
            {:else}
              {t.save}
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

<!-- DELETE CARD modal -->
<dialog bind:this={delete_card_modal} id="delete_card_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">{t.deleteCard}</h3>
    <p class="text-error">{t.areYouSureDelete}</p>
    <p class="text-base-content/70">{t.cannotBeUndone}</p>

    <div class="modal-action">
      <form method="dialog" class="flex gap-2">
        <button class="btn" disabled={deletingCard}>{t.cancel}</button>
        <button
          type="button"
          class="btn btn-error"
          onclick={handleDeleteCard}
          disabled={deletingCard}
        >
          {#if deletingCard}
            <Spinner /> {t.deleting}
          {:else}
            {t.delete}
          {/if}
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
