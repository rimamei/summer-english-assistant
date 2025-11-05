import * as z from "zod"

export const validation = z.object({
  lang: z
    .string()
    .min(1, "Source language must be filled."),
  theme: z.string().min(1, "Theme must be filled."),
  agent: z.string().min(1, "Agent must be filled"),
  model: z.string().optional(),
  apiKey: z.string().optional(),
})