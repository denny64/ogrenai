import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
// import pdf from "pdf-parse"

export const POST: RequestHandler = async ({
  request,
  locals: { supabase, safeGetSession },
}) => {
  const { data } = await request.json()

  console.log("data", data)

  return json({
    success: true,
    message: "PDF converted successfully",
    data: data,
  })

  // if (type === "pdfConvert") {
  //   try {
  //     // const formData = await request.formData()
  //     const file = formData.get("file") as File

  //     if (!file) {
  //       return json({ error: "No file provided" }, { status: 400 })
  //     }

  //     // Convert File to ArrayBuffer
  //     const arrayBuffer = await file.arrayBuffer()
  //     // Convert ArrayBuffer to Buffer (required by pdf-parse)
  //     const buffer = Buffer.from(arrayBuffer)

  //     // Extract text from PDF
  //     const data = await pdf(buffer)
  //     const text = data.text

  //     console.log("Extracted text:", text)

  //     // TODO: Send text to ChatGPT API

  //     return json({
  //       success: true,
  //       text: text,
  //       // numberOfPages: data.numpages,
  //       // info: data.info
  //     })
  //   } catch (error) {
  //     console.error("Error processing PDF:", error)
  //     return json({ error: "Failed to process PDF" }, { status: 500 })
  //   }
  // }
}

// export async function POST({
//   request,
//   locals: { supabase, safeGetSession },
//   url,
//   fetch,
// }) {
//   const { session } = await safeGetSession()

//   console.log("session", session.user)

//   const { type, data } = await request.json()

//   // const { user } = await locals.safeGetSession();

//   console.log("data", data)

//   if (type === "createDeck") {
//     try {
//       const { data: newDeck, error: newDeckError } = await supabase
//         .from("deck")
//         .insert([
//           {
//             title: data.title,
//             profile_id: session.user.id,
//             created_at: new Date(),
//           },
//         ])
//         .select()
//         .single()

//       if (newDeckError) {
//         console.error("SUPABASE CREATE DECK ERROR:", newDeckError)
//         throw newDeckError
//       }

//       return json({
//         success: true,
//         data: newDeck,
//       })
//     } catch (error) {
//       console.error("Error creating DECK:", error)
//       return json(
//         {
//           success: false,
//           error: "Failed to create deck",
//         },
//         { status: 500 },
//       )
//     }
//   }
// }
