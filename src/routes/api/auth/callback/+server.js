// In: src/routes/api/auth/callback/+server.js

import { redirect } from "@sveltejs/kit";
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  APP_URL,
} from "$env/static/private";
import { kv } from "$lib/server/kv"; // We need our database connection

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  // 1. Spotify sends back a 'code' in the URL.
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    // Handle the case where the user clicks "Cancel"
    return new Response(`Error from Spotify: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("Error: No code provided from Spotify", {
      status: 400,
    });
  }

  // 2. We now exchange that 'code' for a permanent 'refresh_token'.
  // This is a secure, server-to-server request.

  // We must prove who we are using our ID and Secret.
  // The 'Basic' auth header is your ID and Secret combined and
  // encoded in Base64, a standard way to send credentials.
  const authHeader =
    "Basic " +
    Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
      "base64"
    );

  // This is the form data Spotify's API requires.
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: `${APP_URL}/api/auth/callback`, // Must match exactly
  });

  // 3. Make the request to Spotify's 'token' endpoint
  const response = await fetch("http://googleusercontent.com/spotify.com/6", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Error from Spotify token endpoint:", data);
    return new Response("Error getting tokens from Spotify", { status: 500 });
  }

  // 4. Success! We got the tokens.
  const { access_token, refresh_token } = data;

  // 5. Save the tokens SECURELY in our database.
  // The 'refresh_token' is permanent (or long-lived) and is the
  // most important one.
  await kv.set("spotify_access_token", access_token);
  await kv.set("spotify_refresh_token", refresh_token);

  // 6. Send the user back to the homepage.
  throw redirect(307, "/");
}
