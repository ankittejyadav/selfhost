// In: src/routes/+page.server.js

import { kv } from "$lib/server/kv"; // <-- THE ONLY CHANGE!

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // This logic is identical
    const videos = await kv.lrange("videos", 0, 49);

    return {
      watchedVideos: videos,
    };
  } catch (error) {
    console.error("Could not read videos from Upstash:", error);
    return {
      watchedVideos: [],
    };
  }
}
