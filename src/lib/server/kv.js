// In: src/lib/server/kv.js

import { Redis } from "@upstash/redis";
// This securely imports your secret keys from your environment
import { KV_REST_API_URL, KV_REST_API_TOKEN } from "$env/static/private";

// This creates your one, single database client
// We use 'export const' so other files can import it
export const kv = new Redis({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});
