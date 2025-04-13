import { writable } from "svelte/store"

function createCreditsStore() {
  const { subscribe, set: originalSet, update } = writable<number>(0)

  return {
    subscribe,
    set: (value: number) => originalSet(Math.max(0, value)),
    update,
    subtract: (amount: number) => update((n) => Math.max(0, n - amount)),
    reset: () => originalSet(0),
  }
}

export const credits = createCreditsStore()
