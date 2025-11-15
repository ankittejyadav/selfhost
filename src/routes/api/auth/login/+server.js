// In: src/routes/api/auth/login/+server.js

import { redirect } from "@sveltejs/kit";

// 1. We import our secret keys from $env.
// This safely reads from your Vercel settings or your .env file.
import { SPOTIFY_CLIENT_ID, APP_URL } from "$env/static/private";

// This is the *exact* URL you put in your Spotify dashboard.
const redirect_uri = `${APP_URL}/api/auth/callback`;

// 2. These are the permissions we're asking for.
// We just want to read your "recently played" history.
const scope = "user-read-recently-played";

// This GET function runs when anyone visits this page.
/** @type {import('./$types').RequestHandler} */
export function GET() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: redirect_uri,
    show_dialog: "true",
  });

  // --- THIS IS THE FIX ---
  const loginUrl = `https://accounts.spotify.com/authorize?$...{params.toString()}`;
  // --- END OF FIX ---

  throw redirect(307, loginUrl);
}
