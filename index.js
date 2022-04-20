import Prisma from "@prisma/client"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration.js"
import { readFileSync } from "node:fs"
import { runAppleScript } from "run-applescript"

const prisma = new Prisma.PrismaClient()

async function getCurrentTrack() {
  const script = readFileSync("./get-current-track.scpt", "utf8")
  const data = await runAppleScript(script)

  dayjs.extend(duration)

  if (data) {
    const [title, artist, album, rawDuration] = data.split(";;")
    const unformattedDuration = parseInt(rawDuration) * 1000
    const duration = dayjs.duration(unformattedDuration, "milliseconds").format("mm:ss").toString()

    return { title, artist, album, duration, unformattedDuration }
  }
}

async function setCurrentTrack() {
  setInterval(async () => {
    const data = await getCurrentTrack()

    if (data) {
      const lastTrack = await prisma.track.findMany({
        orderBy: { createdAt: "desc" },
        take: 1
      })

      const isSameTrack =
        lastTrack?.[0].title === data.title &&
        dayjs(lastTrack?.[0].createdAt)
          .add(data.unformattedDuration, "milliseconds")
          .isAfter(dayjs(), "milliseconds")

      if (!isSameTrack) {
        await prisma.track.create({ data })
        console.log(`${data.title} - ${data.artist} - ${data.album} - ${data.duration}`)
      } else console.log("Same track")
    } else console.log("No track playing")
  }, 1000 * 30) // 30 seconds
}

setCurrentTrack()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
