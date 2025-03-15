import { json } from "@sveltejs/kit"

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
  }

  // if (type === "createBooking") {
  //   try {

  //     const { data: sbCustomer, error: sbCustomerError } = await locals.supabase
  //       .from('customers')
  //       .upsert(
  //         { first_name: data.firstName, last_name: data.lastName, email: data.email, mobile_number: data.mobileNumber, landline_number: data.landlineNumber, restaurant_id: data.restaurantId, created_at: new Date() },
  //         { onConflict: 'email' }
  //       )
  //       .select()
  //       .single();

  //     if (sbCustomerError) {
  //       console.error("SUPERBASE CREATE CUSTOMER ERROR", sbCustomerError);
  //     }

  //     let customerId = sbCustomer.id;

  //     const { data: newBooking, error: newBookingError } = await locals.supabase
  //       .from('bookings')
  //       .insert([
  //         { customer_id: customerId, restaurant_id: data.restaurantId, table_id: data.tableId, booking_date: data.date, booking_time: data.time, out_by: data.outBy, taken_by: data.takenBy, comments: data.comments, email_confirmation_sent: data.sendEmail, status: 'confirmed', created_at: new Date() },
  //       ])
  //       .select()
  //       .single();

  //     if (newBookingError) {
  //       console.error("SUPERBASE CREATE BOOKING ERROR", newBookingError);
  //     }

  //     if(newBooking.email_confirmation_sent) {
  //       const emailData = {
  //         name: 'OceanGum Bookings',
  //         emails: [sbCustomer.email],
  //         subject: 'Booking confirmation for <restaurant name>',
  //         text: "YOU'VE BEEN BOOKED MOTHERFUCKER",
  //         // emailHtml: installerEmailHtml
  //       };

  //       // Send email
  //       await fetch('/api/resend', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(emailData)
  //       });
  //     }

  //     return json({
  //       success: true,
  //       data: data
  //     });
  //   } catch (error) {
  //     console.error("Error creating tables:", error);
  //     return json({
  //       success: false,
  //       error: "Failed to customer and make booking"
  //     }, { status: 500 });
  //   }
  // }
}
