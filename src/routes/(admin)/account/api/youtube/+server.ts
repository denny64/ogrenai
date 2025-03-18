import { json } from "@sveltejs/kit"
import { YoutubeTranscript } from "youtube-transcript"
import { fetchTranscript } from "youtube-transcript-plus"
import { HttpsProxyAgent } from "https-proxy-agent"
import axios from "axios"

export async function POST({
  request,
  locals: { supabase, safeGetSession },
  fetch,
}) {
  const { type, data } = await request.json()

  // const { user } = await locals.safeGetSession();

  console.log("data youtube server", data)
  let transcriptData = ""

  try {
    // Fetch YouTube page and get title
    const response = await fetch(data.youtubeLink)
    const html = await response.text()
    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    const videoTitle = titleMatch
      ? titleMatch[1].replace("- YouTube", "").trim()
      : "Untitled Video"

    // Get transcript
    let transcriptString = ""
    // let transcript = await YoutubeTranscript.fetchTranscript(
    //   data.youtubeLink,
    // ).then((t) => (transcriptData = t))
    // const proxyAgentUrl =
    //   "http://sprlej49j4:=syyX68xon7M1XMlxt@gate.smartproxy.com:10001"

    function extractYoutubeId(url: string): string | null {
      // Handle various YouTube URL patterns
      const patterns = [
        // Standard watch URLs
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([^&#]*)/i,
        // Shortened youtu.be URLs
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&#]*)/i,
        // Embed URLs
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?&#]*)/i,
        // Mobile app URLs
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?&#]*)/i,
        // YouTube shorts
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?&#]*)/i,
        // YouTube music
        /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/watch\?(?:.*&)?v=([^&#]*)/i,
        // YouTube mobile app deep links
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/attribution_link\?.*u=%2Fwatch%3Fv%3D([^%&#]*)/i,
        // YouTube mobile app share links
        /(?:https?:\/\/)?(?:www\.)?youtube\.app\.goo\.gl\/([^?&#]*)/i,
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }

      return null
    }

    const videoId = extractYoutubeId(data.youtubeLink)
    const proxyUrl =
      "http://023916ffb4314a6fabb4e282b83695e4:@api.zyte.com:8011"
    // "http://sprlej49j4:=syyX68xon7M1XMlxt@tr.smartproxy.com:40004"

    async function getTranscript(videoId) {
      try {
        // const videoId = 'dQw4w9WgXcQ';
        const proxyAgent = new HttpsProxyAgent(proxyUrl)

        const transcript = await fetchTranscript(videoId, {
          videoFetch: async ({ url, lang, userAgent }) => {
            const response = await axios.get(url, {
              headers: {
                ...(lang && { "Accept-Language": lang }),
                "User-Agent": userAgent,
              },
              httpsAgent: proxyAgent,
              proxy: false, // Disable any proxy settings from environment
            })

            // Create a fetch-like response object
            return {
              text: () => Promise.resolve(response.data),
              json: () =>
                Promise.resolve(
                  typeof response.data === "string"
                    ? JSON.parse(response.data)
                    : response.data,
                ),
              ok: response.status >= 200 && response.status < 300,
            }
          },
          transcriptFetch: async ({ url, lang, userAgent }) => {
            const response = await axios.get(url, {
              headers: {
                ...(lang && { "Accept-Language": lang }),
                "User-Agent": userAgent,
              },
              httpsAgent: proxyAgent,
              proxy: false, // Disable any proxy settings from environment
            })

            // Create a fetch-like response object
            return {
              text: () => Promise.resolve(response.data),
              json: () =>
                Promise.resolve(
                  typeof response.data === "string"
                    ? JSON.parse(response.data)
                    : response.data,
                ),
              ok: response.status >= 200 && response.status < 300,
            }
          },
        })

        console.log("Transcript fetched successfully using proxy:")
        console.log(transcript)
        transcriptData = transcript
        return transcript
      } catch (error) {
        console.error("Error fetching transcript:", error.message)
      }
    }

    let transcript = await getTranscript(videoId)
    // console.log("TRANSCRIPT WORK??", transcript)

    if (Array.isArray(transcriptData)) {
      transcriptString = transcriptData.map((t) => t.text).join(" ")
    } else {
      transcriptString = transcript
    }

    console.log("TRANSCRIPT STRING FINAL", transcriptString)

    return json({
      success: true,
      data: {
        ...data,
        transcript: transcriptString,
        title: videoTitle,
      },
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
}
