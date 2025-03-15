// export function deckListStore(deckList) {
//   let decks = $state([...deckList])

//   return {
//     get decks() {
//       return decks
//     },
//     set decks(value) {
//       decks = value
//     },
//     createDeck: (deck) => {
//       decks = [...decks, deck]
//     },
//     // removedeck does not work yet properly yet. fking svelte5
//     removeDeck: (deckId) => {
//       console.log("REMOVE deck STATE ID@@@@", deckId)
//       decks = [...decks.filter((deck) => deck.id !== deckId)]
//     },
//   }
// }

export const deckState = $state({
  name: null,
  updatedName: null,
  id: null,
  deckColor: null,
  renaming: false,
  cards: [],
})
