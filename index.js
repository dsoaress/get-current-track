import "dotenv/config";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { readFileSync } from "node:fs";
import { runAppleScript } from "run-applescript";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);
dayjs.extend(duration);

async function getCurrentTrack() {
  const script = readFileSync("./get-current-track.scpt", "utf8");
  const data = await runAppleScript(script);

  if (!data) return null;

  const [title, artist, album, rawDuration] = data.split(";;");
  const unformattedDuration = parseInt(rawDuration) * 1000;
  const duration = dayjs
    .duration(unformattedDuration, "milliseconds")
    .format("mm:ss")
    .toString();

  return JSON.stringify({ title, artist, album, duration });
}

async function setCurrentTrack() {
  console.log("Starting");
  let previousData = await redisClient.get("current-track");

  setInterval(async () => {
    const track = await getCurrentTrack();

    if (track && track !== previousData) {
      console.log("New track:", track);
      redisClient.set("current-track", track);
      previousData = track;
    } else if (!track && !!previousData) {
      console.log("Stopped");
      redisClient.del("current-track");
      previousData = null;
    }
  }, 1000 * 10); // 10 seconds
}

setCurrentTrack().catch((e) => {
  console.error(e);
  process.exit(1);
});
