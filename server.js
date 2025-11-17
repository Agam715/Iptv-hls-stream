const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// ⭐ Enable CORS for GitHub Pages
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  next();
});

// Create folders
function ensureDir(path) { if (!fs.existsSync(path)) fs.mkdirSync(path); }
ensureDir("hls");
ensureDir("hls/ss2");
ensureDir("hls/ten3");
ensureDir("hls/ss1_4k");

// ⭐ CHANNEL LIST
const CHANNELS = {
  ss2:      "http://87.255.35.150:18828",               // Star Sports 2
  ten3:     "http://87.255.35.150:18848",               // Sony Ten 3 Hindi
  ss1_4k:   "http://sports-rkdyiptv.wasmer.app/play.php?id=71242" // Your OWN link
};

// ⭐ Start each channel with FFmpeg + header bypass
function startFFmpeg(name, url) {
  console.log(`Starting channel: ${name}`);

  const ffmpeg = spawn("ffmpeg", [
    "-headers", "User-Agent: Mozilla/5.0\r\nReferer: https://sports-rkdyiptv.wasmer.app/\r\n",
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

// Start all channels
Object.entries(CHANNELS).forEach(([name, url]) => startFFmpeg(name, url));

// Serve HLS
app.use("/hls", express.static("hls"));

// Root
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
