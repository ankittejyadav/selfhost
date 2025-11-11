// In: src/routes/api/yt-history/+server.js

import { json } from "@sveltejs/kit";
import { kv } from "$lib/server/kv"; // <-- THE ONLY CHANGE!
import { URL } from "url";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const newVideo = await request.json();

  if (!newVideo.url) {
    return json({ error: "Missing URL" }, { status: 400 });
  }

  // --- 2. ADD THIS NEW LOGIC ---
  try {
    // This line parses the full URL and finds the 'v' parameter
    const videoId = new URL(newVideo.url).searchParams.get("v");

    if (videoId) {
      // This is the standard format for all YouTube thumbnails
      newVideo.thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch (e) {
    console.error("Could not parse URL:", e);
    newVideo.thumbnail = null; // Save 'null' if we fail
  }
  // --- END OF NEW LOGIC ---

  // This logic is identical to before
  const allVideos = await kv.lrange("videos", 0, -1);
  const exists = allVideos.some((video) => video.url === newVideo.url);

  if (!exists) {
    await kv.lpush("videos", newVideo);
    await kv.ltrim("videos", 0, 49);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// The OPTIONS handler stays exactly the same
/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
