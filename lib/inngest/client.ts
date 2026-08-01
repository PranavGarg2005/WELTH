// src/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "welth", name: "Welth",
  retryFunction: async (attempt:number) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    maxAttempts: 2,
  })
 });