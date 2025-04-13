import { json } from "@sveltejs/kit"

export async function GET({
  request,
  locals: { supabase, safeGetSession },
  url,
}) {
  const { searchParams } = new URL(url)

  console.log("searchParams", searchParams)
  const deckId = searchParams.get("deckId")
  // const deckId = url.searchParams.get('deckId');
  try {
    const { data: cardList, error: cardListError } = await supabase
      .from("card")
      .select("*")
      .eq("deck_id", deckId)
    if (cardListError) {
      console.error("SUPABASE ERROR card SERVER:", cardListError)
    }

    console.log("CARD LIST SERVER API CALL", cardList)
    return json({
      success: true,
      data: cardList,
    })
  } catch (error) {
    console.error("Error fetching cards:", error)
    return json(
      {
        success: false,
        error: "Failed to fetch cards",
      },
      { status: 500 },
    )
  }
}

export async function POST({ request, locals: { supabase } }) {
  const { type, data } = await request.json()

  if (type === "createCard") {
    try {
      const { cards, deckId, dataSource } = data

      if (!cards || !deckId) {
        return json(
          {
            success: false,
            error: "Missing required cards or deckid fields",
          },
          { status: 400 },
        )
      }

      // Prepare cards for batch insert
      const cardsToInsert = cards.map((card) => ({
        deck_id: deckId,
        created_at: new Date(),
        question: card.question,
        answer: card.answer || card.answers,
        data_source: dataSource || "manual",
      }))

      // Batch insert all cards
      const { data: newCards, error: insertError } = await supabase
        .from("card")
        .insert(cardsToInsert)
        .select()

      if (insertError) {
        console.error("Error creating cards:", insertError)
        return json(
          {
            success: false,
            error: "Failed to create cards",
          },
          { status: 500 },
        )
      }

      console.log(`Successfully created ${newCards.length} cards`)

      return json({
        success: true,
        data: newCards,
      })
    } catch (error) {
      console.error("Error processing cards:", error)
      return json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 },
      )
    }
  } else if (type === "editCard") {
    console.log("EDIT CARD", data)
    try {
      const { id, question, answer } = data

      const { data: updatedCard, error: updateError } = await supabase
        .from("card")
        .update({ question, answer })
        .eq("id", id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating card:", updateError)
        return json(
          {
            success: false,
            error: "Failed to update card",
          },
          { status: 500 },
        )
      }

      return json({
        success: true,
        data: updatedCard,
      })
    } catch (error) {
      console.error("Error editing card:", error)
      return json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 },
      )
    }
  } else if (type === "deleteCard") {
    console.log("DELETE CARD", data)
    try {
      const { id } = data
      const { data: deletedCard, error: deleteError } = await supabase
        .from("card")
        .delete()
        .eq("id", id)
        .select()
        .single()

      if (deleteError) {
        console.error("Error SUPBASE deleting card:", deleteError)
        return json(
          {
            success: false,
            error: "Failed SUPABASE to delete card",
          },
          { status: 500 },
        )
      }

      return json({
        success: true,
        data: deletedCard,
      })
    } catch (error) {
      console.error("Error deleting card:", error)
      return json(
        {
          success: false,
          error: "Internal server error",
        },
        { status: 500 },
      )
    }
  }
}
// export async function POST({ request, locals, url }) {
//   const { type, data } = await request.json()

//   const { user } = await locals.safeGetSession()

//   console.log("data", data)
//   // CREATE TABLE
//   if (type === "createTable") {
//     try {
//       let profileId = user?.id

//       let { data: userRestaurant, error: userRestauranterror } =
//         await locals.supabase
//           .from("restaurants")
//           .select("id")
//           .eq("profile_id", profileId)

//       if (userRestauranterror) {
//         console.error(
//           "SUPERBASE FETCH USER RESTAURANT ERROR",
//           userRestauranterror,
//         )
//       }

//       let restaurantId = userRestaurant[0].id

//       const { data: newTable, error: newTableError } = await locals.supabase
//         .from("tables")
//         .insert([
//           {
//             table_number: data.tableNumber,
//             table_name: data.tableName,
//             capacity: data.capacity,
//             restaurant_id: restaurantId,
//             created_at: new Date(),
//           },
//         ])
//         .select()
//         .single()

//       if (newTableError) {
//         console.error("Supabase CREATE TABLE error:", newTableError)
//       }
//       return json({
//         success: true,
//         data: newTable,
//       })
//     } catch (error) {
//       console.error("Error creating tables:", error)
//       return json(
//         {
//           success: false,
//           error: "Failed to fetch tables",
//         },
//         { status: 500 },
//       )
//     }
//     // EDIT TABLE
//   } else if (type === "editTable") {
//     console.log("EDIT TABLE", data)
//     try {
//       const { data: editedTable, error: editTableError } = await locals.supabase
//         .from("tables")
//         .update({
//           table_number: data.tableNumber,
//           table_name: data.tableName,
//           capacity: data.capacity,
//         })
//         .eq("id", data.tableId)
//         .select()
//         .single()

//       if (editTableError) {
//         console.error("Supabase EDIT TABLE ERROR", editTableError)
//       }
//       return json({
//         success: true,
//         data: editedTable,
//       })
//     } catch (error) {
//       console.error("Error editing table:", error)
//       return json(
//         {
//           success: false,
//           error: "Failed to edit table",
//         },
//         { status: 500 },
//       )
//     }
//     // DELETE TABLE
//   } else if (type === "deleteTable") {
//     console.log("DELETE TABLE", data)
//     try {
//       const { data: deletedTable, error: deleteTableError } =
//         await locals.supabase
//           .from("tables")
//           .delete()
//           .eq("id", data.tableId)
//           .select()

//       if (deleteTableError) {
//         console.error("Supabase DELETE TABLE ERROR", deleteTableError)
//       }
//       return json({
//         success: true,
//         data: deletedTable,
//       })
//     } catch (error) {
//       console.error("Error deleting table:", error)
//       return json(
//         {
//           success: false,
//           error: "Failed to delete table",
//         },
//         { status: 500 },
//       )
//     }
//   }
// }
