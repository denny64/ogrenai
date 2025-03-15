import { z } from "zod"

export const youtubeLinkSchema = z.object({
  youtubeLink: z
    .string()
    .url()
    .regex(
      /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/,
      "Must be a valid YouTube URL (youtube.com, m.youtube.com, or youtu.be)",
    ),
})
