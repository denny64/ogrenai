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
          model: "gpt-4o-mini",
          messages,
          response_format: { type: "json_object" },
        }),
      },
    )

    const openaiData = await openaiResponse.json()

    console.log("openaiData RAW ====", openaiData)

    console.log("openaiData", openaiData.choices[0].message)
    const parsedResponse = JSON.parse(openaiData.choices[0].message.content)

    // console.log("parsedResponse ######", parsedResponse)

    const checkCorrectStructure = (arr) => {
      if (!Array.isArray(arr)) return { flashcards: [] }

      const validFlashcards = arr.filter((item) => {
        // Check if item has question property
        if (!item.question || typeof item.question !== "string") return false

        // Check if answer property exists and is an array
        if (!item.answer || !Array.isArray(item.answer)) return false

        // Check if there are exactly 4 answers
        if (item.answer.length !== 4) return false

        // Check if each answer has the correct structure
        return item.answer.every(
          (answer) =>
            typeof answer === "object" &&
            "option" in answer &&
            "correct" in answer &&
            typeof answer.option === "string" &&
            typeof answer.correct === "boolean",
        )
      })

      return { flashcards: validFlashcards }
    }

    let correctParsedResponse = checkCorrectStructure(parsedResponse.flashcards)

    console.log("correctParsedResponse ######", correctParsedResponse)

    return json({
      success: true,
      data: correctParsedResponse,
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
