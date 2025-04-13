import { json } from "@sveltejs/kit"
import { PRIVATE_OPENAI_API_KEY } from "$env/static/private"

export async function POST({ request, fetch }) {
  try {
    const {
      text,
      data: { questionsToGenerate, existingQuestions, flashcardLang },
    } = await request.json()

    if (!text) {
      return json(
        {
          success: false,
          error: "No text provided",
        },
        { status: 400 },
      )
    }

    let messages = [
      {
        role: "user",
        content: `
        You are an expert flashcard creator. Your task is to extract every single informative point from the following text provided — no matter how minor, detailed, or seemingly irrelevant—and turn each point into an individual multiple-choice Q&A flashcard from the provided text. 
        
        A “point” can include:
        • Definitions
        • Factual statements
        • Concepts and explanations
        • Lists, bullet points, or steps
        • Examples or analogies
        • Names, dates, places, terminology

        🔁 If a sentence contains multiple facts, break them into multiple simple flashcards.

        ❌ Do not repeat the same question.
        ❌ Do not skip or summarize anything.
        ❌ Do not group information into paragraphs or answer blocks.

        ✅ Return the response in JSON format as shown in the example below:

        makefileCopyEditQ: [Clear and concise question]  
        A: [Precise and factual answer]  

        🔎 Example (complex sentence broken down):
        Input: "Isaac Newton formulated the laws of motion and universal gravitation in the 17th century."
        Output:

        Example JSON format:
        {
          "flashcards": [
            {
              "question": "In which century did Isaac Newton formulate his laws?",
              "answer": [
                {
                  "option": "The 17th century",
                  "correct": true
                },
                {
                  "option": "The 3rd century",
                  "correct": false
                },
                {
                  "option": "The 21st century",
                  "correct": false
                },
                {
                  "option": "The 16th century",
                  "correct": false
                }
              ]
            }
          ]
        }

        Now process the following text: "${text}". To summarise, return in JSON format with keys 'question' and 'answer'. There should be 4 multiple choice answers with 1 being correct, please label the correct answer as a boolean 'true' and the incorrect answers as boolean 'false'. The keys for the multiple choice answers should be 'option' and 'correct'. Create ${questionsToGenerate} flashcards in ${flashcardLang === "tr" ? "Turkish" : "English"} from the following text, making sure they are different from these existing questions: ${JSON.stringify(existingQuestions)}.
        `,
      },
    ]

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
