import * as z from "zod"

export const validation = z.object({
  source_lang: z
    .string()
    .min(1, "Source language must be filled."),
  target_lang: z
    .string()
    .min(1, "Target language must be filled."),
  mode: z.enum(["pronunciation", "grammar", "summarizer", "translation"]),
  selector: z.enum(["word", "sentence", "paragraph"]),
  accent: z.enum(["british", "american"]),
  enabled_extension: z.boolean(),
})