import fs from "fs";
import path from "path";

/**@type {import('./$types').PageServerLoad} */
export function load() {
  const dataPath = path.resolve("src/lib/data/videos.json");

  try {
    const data = fs.readFileSync(dataPath, "utf-8"); //read the file
    const videos = JSON.parse(data);
    return {
      watchedVideos: videos, //returns thsis data to the page
    };
  } catch (error) {
    console.error("Couldnt read videos.json file", error);
    return { watchedVideos: [] }; //empty array so the page doesnt crash
  }
}
