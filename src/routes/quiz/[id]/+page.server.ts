// import { superValidate, message } from "sveltekit-superforms"
// import { zod } from "sveltekit-superforms/adapters"

// import { youtubeLinkSchema } from "$lib/schema"
import type { Actions, PageServerLoad } from "./$types.js"

export const load: PageServerLoad = async ({
  params,
  locals,
  parent,
  fetch,
}) => {
  const sbDeckId = params.id

  // console.log("QUIZ DECK ID !!!!!@@@", sbDeckId)
  let singleDeckData = await fetch(`/account/api/deck/${sbDeckId}`).then(
    (res) => res.json(),
  )
  let cardList: any[] = []
  let cardListResponse = await fetch(
    `/account/api/card?deckId=${sbDeckId}`,
  ).then((res) => res.json())
  console.log("CARD LIST SERVER", cardListResponse)
  if (cardListResponse.success) {
    cardList = [...cardListResponse.data]
    cardList = cardListResponse.data.filter((card) => card.answer)
  }
  // const youtubeLinkForm = await superValidate(zod(youtubeLinkSchema))
  return {
    singleDeckData: singleDeckData.data[0],
    cardList: [...cardList],
    // youtubeLinkForm,
  }
}
