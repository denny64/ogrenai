import { json } from "@sveltejs/kit"

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
          Authorization: `Bearer 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`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          response_format: { type: "json_object" },
        }),
      },
    )

    const openaiData = await openaiResponse.json()

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
