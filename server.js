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

// Create required folders
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
if (!fs.existsSync("hls/ss2")) fs.mkdirSync("hls/ss2");
if (!fs.existsSync("hls/ten3")) fs.mkdirSync("hls/ten3");

// CHANNEL LIST
const CHANNELS = {
  ss2: "http://87.255.35.150:18828",    // Star Sports 2
  ten3: "http://87.255.35.150:18848"    // Sony TEN 3 - HINDI
};

function startFFmpeg(name, url) {
  console.log("Starting channel:", name);

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

  ffmpeg.stderr.on("data", d => console.log(`[${name}]`, d.toString()));
  ffmpeg.on("close", () => console.log(`Channel stopped: ${name}`));
}

// Start all channels
Object.entries(CHANNELS).forEach(([name, url]) => startFFmpeg(name, url));

// Serve HLS files
app.use("/hls", express.static("hls"));

// Root page
app.get("/", (req, res) => {
  res.send(`
    <h1>Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ten3/playlist.m3u8">Sony TEN 3 - HINDI</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
