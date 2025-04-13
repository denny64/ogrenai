import { json } from "@sveltejs/kit"
import { PdfReader } from "pdfreader"

export async function POST({
  request,
  fetch,
  locals: { supabaseServiceRole },
}) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const deckId = formData.get("deckId")

    if (!file) {
      return json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 },
      )
    }

    // Convert File to Buffer for pdfreader
    const buffer = Buffer.from(await file.arrayBuffer())

    // Extract text from PDF
    const extractedText: string[] = []

    // Wrap PdfReader in a Promise to handle async reading
    await new Promise((resolve, reject) => {
      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) {
          console.error("PDF parsing error:", err)
          reject(err)
        } else if (!item) {
          // End of file, resolve promise
          resolve(null)
        } else if (item.text) {
          extractedText.push(item.text)
        }
      })
    })

    const extractedString = extractedText.join(" ")
    console.log("Extracted PDF text:", extractedString)

    // Generate a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabaseServiceRole.storage
      .from("pdfs")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Supabase storage error:", error)
      return json(
        {
          success: false,
          error: "Failed to upload file",
        },
        { status: 500 },
      )
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabaseServiceRole.storage.from("pdfs").getPublicUrl(fileName)

    return json({
      success: true,
      data: {
        fileName,
        publicUrl,
        text: extractedString,
      },
    })
  } catch (error) {
    console.error("PDF upload error:", error)
    return json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
