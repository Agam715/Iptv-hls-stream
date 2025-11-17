const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// ----------------------------
// ENABLE CORS FOR GITHUB PAGES
// ----------------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
});

// ----------------------------
// CHANNEL LIST (YOU OWN THESE)
// ----------------------------
const CHANNELS = {
  ss2:      "http://87.255.35.150:18828",                 // Star Sports 2
  ten3:     "http://87.255.35.150:18848",                 // Sony Ten 3 Hindi
  ss1_4k:   "http://sports-rkdyiptv.wasmer.app/play.php?id=71242"  // Star Sports 1 4K (YOU OWN)
};

// ----------------------------
// MAKE HLS DIRECTORIES
// ----------------------------
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
for (let ch in CHANNELS) {
  if (!fs.existsSync(`hls/${ch}`)) fs.mkdirSync(`hls/${ch}`);
}

// ----------------------------
// START FFMPEG FOR EACH CHANNEL
// ----------------------------
function startChannel(name, url) {
  console.log(`Starting channel: ${name}`);

  const ffmpeg = spawn("ffmpeg", [
    "-i", url,
    "-c:v", "copy",
    "-c:a", "copy",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "10",
    "-hls_flags", "delete_segments",
    `hls/${name}/playlist.m3u8`
  ]);

  ffmpeg.stderr.on("data", data => {
    console.log(`[${name}] ${data}`);
  });

  ffmpeg.on("close", () => {
    console.log(`FFmpeg stopped for: ${name}`);
  });
}

Object.entries(CHANNELS).forEach(([name, url]) => startChannel(name, url));

// ----------------------------
// STATIC FILE SERVING
// ----------------------------
app.use("/hls", express.static("hls"));

app.get("/", (req, res) => {
  res.send(`
    <h1>Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ten3/playlist.m3u8">Sony Ten 3 Hindi</a></li>
      <li><a href="/hls/ss1_4k/playlist.m3u8">Star Sports 1 4K Hindi</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
