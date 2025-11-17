const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// ⭐ ENABLE CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
});

// Create folders
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
if (!fs.existsSync("hls/ss2")) fs.mkdirSync("hls/ss2");
if (!fs.existsSync("hls/ten3")) fs.mkdirSync("hls/ten3");
if (!fs.existsSync("hls/ss1_4k")) fs.mkdirSync("hls/ss1_4k"); // ⭐ NEW

// CHANNEL LIST (your working links)
const CHANNELS = {
  ss2: "http://87.255.35.150:18828",
  ten3: "http://87.255.35.150:18848",
  ss1_4k: "http://sports-rkdyiptv.wasmer.app/play.php?id=71242" // ⭐ NEW CHANNEL
};

// FUNCTION TO START FFmpeg
function startFFmpeg(name, url) {
  console.log("Starting channel:", name);

  const ffmpeg = spawn("ffmpeg", [
    "-user_agent", "Mozilla/5.0",    // ⭐ FIX: act like browser
    "-headers", "Referer: https://example.com\r\n",
    "-i", url,
    "-c:v", "copy",
    "-c:a", "copy",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "10",
    "-hls_flags", "delete_segments",
    `hls/${name}/playlist.m3u8`
  ]);

  ffmpeg.stderr.on("data", d => console.log(`[${name}]`, d.toString()));
  ffmpeg.on("close", () => console.log(`Channel stopped: ${name}`));
}

// START ALL CHANNELS
Object.entries(CHANNELS).forEach(([name, url]) => startFFmpeg(name, url));

// Serve HLS
app.use("/hls", express.static("hls"));

app.get("/", (req, res) => {
  res.send(`
    <h1>Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ten3/playlist.m3u8">Sony TEN 3 - HINDI</a></li>
      <li><a href="/hls/ss1_4k/playlist.m3u8">STAR SPORTS 1 4K HINDI</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
