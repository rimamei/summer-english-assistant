import * as z from "zod"

export const validation = z.object({
  lang: z
    .string()
    .min(1, "Source language must be filled."),
  theme: z.z.enum(["light", "dark"]),
  agent: z.string().min(1, "Agent must be filled"),
  model: z.string().optional(),
  apiKey: z.string().optional(),
}).refine(
  (data) => data.agent === "chrome" || !!data.model,
  {
    message: "Model is required",
    path: ["model"],
  }
).refine(
  (data) => data.agent === "chrome" || !!data.apiKey,
  {
    message: "API Key is required",
    path: ["apiKey"],
  }
)