import { json } from "@sveltejs/kit";
import { createClient } from "@vercel/kv";
import { env } from "$env/dynamic/private"; // Import private environment variables

// Initialize KV client using environment variables provided by Vercel
const kv = createClient({
  url: env.KV_REST_API_URL || process.env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN,
});

// Use GET for simplicity with iOS Shortcuts URL parameters
export async function GET({ url }) {
  // Retrieve the secret and location from query parameters
  const providedSecret = url.searchParams.get("secret");
  const location = url.searchParams.get("location");

  // --- Security Check ---
  // Get the secret from environment variables (set in Vercel)
  const expectedSecret =
    env.LOCATION_API_SECRET || process.env.LOCATION_API_SECRET;

  if (!expectedSecret) {
    console.error("API Secret is not configured in environment variables.");
    return json(
      { status: "error", message: "Server configuration error." },
      { status: 500 }
    );
  }

  if (providedSecret !== expectedSecret) {
    console.warn("Invalid secret provided.");
    return json({ status: "error", message: "Unauthorized." }, { status: 401 });
  }

  // --- Input Validation ---
  if (!location) {
    return json(
      { status: "error", message: "Location parameter is missing." },
      { status: 400 }
    );
  }

  // --- Update Database ---
  try {
    // Store the location string under the key 'current_location'
    await kv.set("current_location", location);
    console.log(`Successfully updated location to: ${location}`);

    // --- Send Success Response ---
    return json({ status: "success", location: location });
  } catch (error) {
    console.error("KV Error:", error);
    return json(
      { status: "error", message: "Failed to update location in database." },
      { status: 500 }
    );
  }
}

// Optional: Handle POST requests if you prefer
// export async function POST({ request }) {
//   try {
//     const body = await request.json(); // Assuming JSON body { secret: "...", location: "..." }
//     const { secret: providedSecret, location } = body;

//     const expectedSecret = env.LOCATION_API_SECRET || process.env.LOCATION_API_SECRET;

//     if (!expectedSecret) { /* ... error handling ... */ }
//     if (providedSecret !== expectedSecret) { /* ... error handling ... */ }
//     if (!location) { /* ... error handling ... */ }

//     await kv.set('current_location', location);
//     return json({ status: 'success', location: location });

//   } catch (error) {
//     console.error('API POST Error:', error);
//     // Handle JSON parsing errors or other issues
//     return json({ status: 'error', message: 'Invalid request or server error.' }, { status: 500 });
//   }
// }
