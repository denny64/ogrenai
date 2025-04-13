import { json } from "@sveltejs/kit"

export async function GET({ request, locals, url, params }) {
  const sbDeckId = params.id

  try {
    const { data: singleDeck, error: singleDeckError } = await locals.supabase
      .from("deck")
      .select(`*, card(*)`)
      .eq("id", sbDeckId)
    if (singleDeckError) {
      console.error("SUPABASE ERROR TABLES SERVER:", singleDeckError)
    }
    return json({
      success: true,
      data: singleDeck,
    })
  } catch (error) {
    console.error("Error fetching decks:", error)
    return json(
      {
        success: false,
        error: "Failed to fetch decks",
      },
      { status: 500 },
    )
  }
}
