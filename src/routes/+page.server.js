// In: src/routes/+page.server.js

import { kv } from "$lib/server/kv";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";

export const prerender = false;

async function getSpotifyData() {
  const authHeader =
    "Basic " +
    Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
      "base64"
    );

  const refresh_token = await kv.get("spotify_refresh_token");
  if (!refresh_token) {
    console.error(
      "Error fetching Spotify data: Missing refresh token. Please log in again."
    );
    throw new Error(
      "Missing refresh token. Please log in again via /api/auth/login."
    );
  }

  // 1. Get a new access token
  // --- THIS IS THE FIX (REAL URL) ---
  const tokenResponse = await fetch(
    "https://accounts.spotify.com/authorize?$...",
    {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
    }
  );

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Error refreshing Spotify token. Response was:", errorText);
    throw new Error("Could not refresh Spotify token.");
  }

  // This should now work
  const tokenData = await tokenResponse.json();
  const token = tokenData.access_token;

  // 2. Use the new token to get played tracks
  // --- THIS IS THE FIX (REAL URL) ---
  const tracksResponse = await fetch(
    "https://www.google.com/url?sa=E&source=gmail&q=api.spotify.com/v1/me/player/recently-played4",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!tracksResponse.ok) {
    throw new Error("Could not fetch recently played tracks.");
  }

  const data = await tracksResponse.json();

  // 3. Format and save the data (this is your 'podcast' filter)
  const newPodcasts = data.items
    .filter((item) => item.track.type === "episode")
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
  try {
    await getSpotifyData();
  } catch (error) {
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
