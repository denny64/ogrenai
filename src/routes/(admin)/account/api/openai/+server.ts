import { json } from "@sveltejs/kit"
import { PRIVATE_OPENAI_API_KEY } from "$env/static/private"

export async function POST({ request, fetch }) {
  try {
    const { text, messages } = await request.json()

    if (!text) {
      return json(
        {
          success: false,
          error: "No text provided",
        },
        { status: 400 },
      )
    }

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PRIVATE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          response_format: { type: "json_object" },
        }),
      },
    )

    const openaiData = await openaiResponse.json()

    console.log("openaiData RAW ====", openaiData)

    console.log("openaiData", openaiData.choices[0].message)
    const parsedResponse = JSON.parse(openaiData.choices[0].message.content)

    return json({
      success: true,
      data: parsedResponse,
    })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return json(
      {
        success: false,
        error: "Failed to generate flashcards",
      },
      { status: 500 },
    )
  }
}
