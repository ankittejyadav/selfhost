// In: src/routes/api/fetch-spotify-history/+server.js

import { json } from "@sveltejs/kit";
import { kv } from "$lib/server/kv";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";

// This is the Basic Auth header (Client ID + Secret) we made before.
// We need it to prove who we are when we ask for a new token.
const authHeader =
  "Basic " +
  Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
    "base64"
  );

/**
 * This function uses your permanent refresh_token to get a new,
 * 1-hour access_token from Spotify.
 */
async function getNewAccessToken() {
  const refresh_token = await kv.get("spotify_refresh_token");

  if (!refresh_token) {
    throw new Error("Missing refresh token. Please log in again.");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh_token,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    console.error("Error refreshing Spotify token:", await response.json());
    throw new Error("Could not refresh Spotify token.");
  }

  const data = await response.json();

  // Save the new access_token. We don't really need to, but it's good practice.
  await kv.set("spotify_access_token", data.access_token);

  return data.access_token;
}

/**
 * This is the main function that runs when this API is called.
 */
/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    // 1. Get a fresh token
    const token = await getNewAccessToken();

    // 2. Use the fresh token to get your 20 most recently played tracks
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Could not fetch recently played tracks.");
    }

    const data = await response.json();

    // 3. Format the data and save it to our database

    // This loops through the 'items' from Spotify and formats them
    // It also filters to *only* include 'episode' types (podcasts)
    const newPodcasts = data.items
      .filter((item) => item.track.type === "episode")
      .map((item) => ({
        title: item.track.name,
        artist: item.track.show.name,
        url: item.track.external_urls.spotify,
        thumbnail: item.track.images[0]?.url, // Get the first (largest) image
        listenedAt: item.played_at,
      }));

    // 4. Save these new podcasts to our 'podcasts' list in Upstash
    // We'll clear the old list and add the 20 new ones.
    if (newPodcasts.length > 0) {
      await kv.del("podcasts"); // Delete the old list
      await kv.lpush("podcasts", ...newPodcasts); // Push all new podcasts
      await kv.ltrim("podcasts", 0, 49); // Keep it to 50
    }

    // 5. Return the list of podcasts
    return json({ podcasts: newPodcasts });
  } catch (error) {
    console.error("Error in /api/fetch-spotify-history:", error.message);
    return json({ error: error.message }, { status: 500 });
  }
}
