const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// ⭐ ENABLE CORS FOR GITHUB PAGES ⭐
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
});

// Make HLS folders
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
["ss2", "ten3", "ss1_4k"].forEach(dir => {
  if (!fs.existsSync(`hls/${dir}`)) fs.mkdirSync(`hls/${dir}`);
});

// CHANNEL LIST (YOUR STREAMS)
const CHANNELS = {
  ss2:    "http://87.255.35.150:18828", // Star Sports 2
  ten3:   "http://87.255.35.150:18848", // Sony TEN 3 Hindi
  ss1_4k: "http://sports-rkdyiptv.wasmer.app/play.php?id=71242" // STAR SPORTS 1 4K HINDI
};

// Start FFmpeg for each channel
function startFF(name, url) {
  console.log("Starting:", name);

  const ff = spawn("ffmpeg", [
    "-i", url,
    "-c:v", "copy",
    "-c:a", "copy",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "10",
    "-hls_flags", "delete_segments",
    `hls/${name}/playlist.m3u8`
  ]);

  ff.stderr.on("data", d => console.log(`[${name}]`, d.toString()));
  ff.on("close", () => console.log(`Stopped: ${name}`));
}

Object.entries(CHANNELS).forEach(([name, url]) => startFF(name, url));

// Serve HLS
app.use("/hls", express.static("hls"));

app.get("/", (req, res) => {
  res.send(`
    <h1>Live Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ten3/playlist.m3u8">Sony TEN 3 - Hindi</a></li>
      <li><a href="/hls/ss1_4k/playlist.m3u8">Star Sports 1 4K - Hindi</a></li>
    </ul>
  `);
});

app.listen(3000, () =>
  console.log("HLS Server running on port 3000")
);
