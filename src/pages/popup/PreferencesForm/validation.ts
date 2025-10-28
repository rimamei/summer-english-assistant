import * as z from "zod"

export const validation = z.object({
  lang: z
    .string()
    .min(1, "Source language must be filled."),
  theme: z.string().min(1, "Theme must be filled."),
})