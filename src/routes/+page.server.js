// In: src/routes/+page.server.js

import { kv } from "$lib/server/kv"; // <-- THE ONLY CHANGE!

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
  try {
    // 1. Call our new API endpoint to refresh Spotify data.
    // We use 'await fetch(...)' to call our own API from the server.
    // This triggers our new /api/fetch-spotify-history route to run.
    await fetch("/api/fetch-spotify-history");
  } catch (error) {
    // If this fails (e.g., user needs to log in), just log it
    // but don't crash the page.
    console.error("Failed to fetch new Spotify history:", error.message);
  }

  // 2. After the fetch is done, we read all data from the database
  // just like before. The 'podcasts' list will now be up to date.
  try {
    const [videos, podcasts, status] = await Promise.all([
      kv.lrange("videos", 0, 49),
      kv.lrange("podcasts", 0, 49), // This will now be fresh
      kv.get("youtube_status"),
    ]);

    return {
      watchedVideos: videos,
      podcasts: podcasts,
      youtubeStatus: status === "active" ? "active" : "offline",
    };
  } catch (error) {
    console.error("Could not read from Upstash:", error);
    return {
      watchedVideos: [],
      podcasts: [],
      youtubeStatus: "offline",
    };
  }
}
