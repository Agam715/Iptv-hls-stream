const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// Create folders
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
if (!fs.existsSync("hls/ss2")) fs.mkdirSync("hls/ss2");
if (!fs.existsSync("hls/ch2")) fs.mkdirSync("hls/ch2");

// CHANNEL LIST
const CHANNELS = {
  ss2: "http://87.255.35.150:18828",
  ch2: "http://rkdyiptv-yupp24.wasmer.app/play.php?id=2756"
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

// Serve HLS
app.use("/hls", express.static("hls"));

app.get("/", (req, res) => {
  res.send(`
    <h1>Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ch2/playlist.m3u8">Channel 2756</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
