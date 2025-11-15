// In: src/routes/+page.server.js

import { kv } from "$lib/server/kv";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";

// This 'prerender' flag is the fix for your Vercel build
export const prerender = false;

// --- This is the helper function from your API,
// --- moved directly into your page loader.
async function getSpotifyData() {
  const authHeader =
    "Basic " +
    Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
      "base64"
    );

  const refresh_token = await kv.get("spotify_refresh_token");
  if (!refresh_token) {
    throw new Error(
      "Missing refresh token. Please log in again via /api/auth/login."
    );
  }

  // 1. Get a new access token
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  });

  if (!tokenResponse.ok) {
    console.error(
      "Error refreshing Spotify token:",
      await tokenResponse.json()
    );
    throw new Error("Could not refresh Spotify token.");
  }
  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;

  // 2. Use the new token to get played tracks
  const tracksResponse = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!tracksResponse.ok) {
    throw new Error("Could not fetch recently played tracks.");
  }

  const data = await tracksResponse.json();

  // 3. Format and save the data
  const newPodcasts = data.items
    .filter((item) => item.track.type === "episode") // Make sure this is 'episode' for podcasts
    .map((item) => ({
      title: item.track.name,
      artist: item.track.show.name,
      url: item.track.external_urls.spotify,
      thumbnail: item.track.images[0]?.url,
      listenedAt: item.played_at,
    }));

  if (newPodcasts.length > 0) {
    await kv.del("podcasts");
    await kv.lpush("podcasts", ...newPodcasts);
    await kv.ltrim("podcasts", 0, 49);
  }
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  // We no longer call 'fetch()'. We just run our logic.
  try {
    await getSpotifyData();
  } catch (error) {
    // If Spotify fails, we still want the page to load
    console.error("Error fetching Spotify data:", error.message);
  }

  // Now we read all data from the DB just like before
  try {
    const [videos, podcasts, status] = await Promise.all([
      kv.lrange("videos", 0, 49),
      kv.lrange("podcasts", 0, 49),
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
