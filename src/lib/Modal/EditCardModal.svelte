<script lang="ts">
  import Spinner from "$lib/Spinner/Spinner.svelte"
  // import { renameDeckState } from "$lib/store/deck.svelte"
  let {
    editingCard,
    handleEditCard,
    newCardQuestion = $bindable(),
    newCardAnswer = $bindable(),
  } = $props()
</script>

<!-- RENAME DECK modal  -->
<dialog id="edit_card_modal" class="modal">
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="font-bold text-lg mb-4">Edit card</h3>
    <div class="flex flex-col gap-4">
      <div>
        <p class="mb-2">Card question</p>
        <input
          name="newCardQuestion"
          type="text"
          placeholder="e.g. Frog Facts"
          class="input input-bordered w-full"
          bind:value={newCardQuestion}
        />
      </div>
      <div>
        <p class="mb-2">Card answer</p>
        <input
          name="newCardAnswer"
          type="text"
          placeholder="e.g. Frog Facts"
          class="input input-bordered w-full"
          bind:value={newCardAnswer}
        />
      </div>
      <div class="modal-action">
        <form method="dialog" class="flex gap-2">
          <button class="btn" disabled={editingCard}>Cancel</button>
          <button
            type="button"
            class="btn btn-primary"
            onclick={handleEditCard}
            disabled={editingCard}
            >{#if editingCard}<Spinner /> Saving...
            {:else}
              Save
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
