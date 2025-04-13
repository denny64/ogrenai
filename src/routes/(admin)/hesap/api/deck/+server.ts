import { json } from "@sveltejs/kit"
import { credits } from "$lib/stores/credits"

export async function GET({ request, locals, url }) {
  const { searchParams } = new URL(url)

  console.log("searchParams DECK SERVER", searchParams)
  const profileId = searchParams.get("profileId")
  // const profileId = url.searchParams.get('profileId');

  try {
    const { data: deckList, error: deckListError } = await locals.supabase
      .from("deck")
      .select(`*, card(*)`)
      .eq("profile_id", profileId)
    if (deckListError) {
      console.error("SUPABASE ERROR TABLES SERVER:", deckListError)
    }
    return json({
      success: true,
      data: deckList,
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

export async function POST({
  request,
  locals: { supabase, safeGetSession },
  url,
  fetch,
}) {
  const { session } = await safeGetSession()

  console.log("session", session.user)

  const { type, data } = await request.json()

  // const { user } = await locals.safeGetSession();

  console.log("data", data)

  if (type === "createDeck") {
    try {
      const { data: newDeck, error: newDeckError } = await supabase
        .from("deck")
        .insert([
          {
            title: data.title,
            profile_id: session.user.id,
            deck_color: data.deckColor,
            created_at: new Date(),
          },
        ])
        .select(`*, card(*)`)
        .single()

      if (newDeckError) {
        console.error("SUPABASE CREATE DECK ERROR:", newDeckError)
        throw newDeckError
      }

      return json({
        success: true,
        data: newDeck,
      })
    } catch (error) {
      console.error("Error creating DECK:", error)
      return json(
        {
          success: false,
          error: "Failed to create deck",
        },
        { status: 500 },
      )
    }
  } else if (type === "renameDeck") {
    try {
      const { data: renameDeckData, error: renameDeckError } = await supabase
        .from("deck")
        .update({ title: data.title })
        .eq("id", data.id)
        .select()
        .single()

      if (renameDeckError) {
        console.error("SUPABASE RENAME DECK ERROR:", renameDeckError)
        throw renameDeckError
      }

      return json({
        success: true,
        data: renameDeckData,
      })
    } catch (error) {
      console.error("Error renaming DECK:", error)
      return json(
        {
          success: false,
          error: "Failed to rename deck",
        },
        { status: 500 },
      )
    }
  } else if (type === "deleteDeck") {
    try {
      const { data: deleteDeckData, error: deleteDeckError } = await supabase
        .from("deck")
        .delete()
        .eq("id", data.id)
        .select()
        .single()

      if (deleteDeckError) {
        console.error("SUPABASE DELETE DECK ERROR:", deleteDeckError)
        throw deleteDeckError
      }

      return json({
        success: true,
        data: deleteDeckData,
      })
    } catch (error) {
      console.error("Error deleting DECK:", error)
      return json(
        {
          success: false,
          error: "Failed to delete deck",
        },
        { status: 500 },
      )
    }
  } else if (type === "completeDeck") {
    try {
      const { data: completeDeckData, error: completeDeckDataError } =
        await supabase
          .from("deck_completed")
          .insert({
            profile_id: session.user.id,
            completed_at: new Date(),
          })
          .select()
          .single()

      if (completeDeckDataError) {
        console.error("SUPABASE COMPLETE DECK ERROR:", completeDeckDataError)
        throw completeDeckDataError
      }

      console.log("COMPLETE DECK DATA", completeDeckData)

      // Fetch completed decks
      const { data: completedDecks, error: completedDecksError } =
        await supabase
          .from("deck_completed")
          .select("*")
          .eq("profile_id", session.user.id)

      if (completedDecksError) {
        console.error("error fetching completed decks", completedDecksError)
        throw completedDecksError
      }

      console.log("query completed decks after inserting", completedDecks)
      console.log("data.subscriptionStats", data.subscriptionStats)

      // Calculate credits to deduct based on completed decks within subscription period
      let creditsToDeduct = 0
      const startDate = new Date(data.subscriptionStats.startDate)
      const endDate = new Date(data.subscriptionStats.endDate)

      console.log("startDate", startDate)
      console.log("endDate", endDate)

      completedDecks.forEach((deck: { completed_at: string }) => {
        const completedAt = new Date(deck.completed_at)
        if (completedAt >= startDate && completedAt <= endDate) {
          creditsToDeduct++
        }
      })

      // Update credits in the store
      // credits.update((currentCredits) => currentCredits - creditsToDeduct)

      return json({
        success: true,
        data: completeDeckData,
        creditsToDeduct,
      })
    } catch (error) {
      console.error("Error completing DECK:", error)
      return json(
        {
          success: false,
          error: "Failed to complete deck",
        },
        { status: 500 },
      )
    }
  }
}
