import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";

//path to the json db file
const dataPath = path.resolve("src/lib/data/videos.json");

//helper function to read the db
function getDB() {
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data); //turn the files text into live js array
  } catch (error) {
    return []; //if the file is empty or doesnt exist start with an empty array
  }
}

//helper function to write to db
function saveDB(data) {
  try {
    //turn the js array back into pretty formatted text
    const stringData = JSON.stringify(data, null, 2);
    fs.writeFileSync(dataPath, stringData, "utf-8");
  } catch (error) {
    console.error("Failed to write to DB:", error);
  }
}

//runs the function only whena post request hits this url
export async function POST({ request }) {
  //get the data sent from tampermonkey
  const newVideo = await request.json();

  //read the current video list from json file
  const db = getDB();

  //check if video already exists in db
  const exists = db.some((video) => video.url === newVideo.url);

  //for new videos
  if (!exists) {
    //add the new video to db at start
    db.unshift(newVideo);

    //keep the list at 10 videos
    const updateDb = db.slice(0, 10);

    saveDB(updateDb);
  }

  //send a success message to tampermonkey
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", //allow request from any origin important
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
