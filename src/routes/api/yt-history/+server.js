import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";

//read the database path
const dataPath = path.resolve("src/lib/data/videos.json");

//read the file
function getDb() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8"); //read file
    return JSON.parse(data); //convert the text to javascript array
  } catch (error) {
    return []; //if file doesnt exist or empty return empty array
  }
}

function saveDb(data) {
  try {
    const stringData = JSON.stringify(data, null, 2); //convert array back to text (null,2) is for formatting
    fs.writeFileSync(dataPath, stringData, "utf-8"); //write to file
  } catch (error) {
    console.error("Error cant write to file", error);
  }
}

//Receiver POST function
export async function POST({ request }) {
  //get data from Tampermonkey sent
  const newVideo = await request.json();

  //if not a url
  if (!newVideo.url) {
    return json({ error: "Missing url" }, { status: 400 });
  }

  //read current database
  const db = getDb();

  //check if we already logged this video
  const exists = db.some((video) => video.url === newVideo.url);

  //if its a new video
  if (!exists) {
    db.unshift(newVideo); //adds video to beginning of array
    const updateDb = db.slice(0, 50); //keeps only 50 recent videos
    saveDb(updateDb); //save trimmed list to file
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      //security handshakes to tell browser its ok for yt to send data to site
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

//before sending POST request OPTIONS is sent to ceck permissions
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
