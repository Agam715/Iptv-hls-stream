const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const app = express();

// Create folders
if (!fs.existsSync("hls")) fs.mkdirSync("hls");
if (!fs.existsSync("hls/ss2")) fs.mkdirSync("hls/ss2");

// CHANNEL source
const STREAM = "http://87.255.35.150:18828";  // Star Sports 2 TS stream

// Start FFmpeg
console.log("Starting Star Sports 2...");
const ffmpeg = spawn("ffmpeg", [
  "-i", STREAM,
  "-c:v", "copy",
  "-c:a", "copy",
  "-f", "hls",
  "-hls_time", "2",
  "-hls_list_size", "10",
  "-hls_flags", "delete_segments",
  "hls/ss2/playlist.m3u8"
]);

ffmpeg.stderr.on("data", d => console.log("[ss2]", d.toString()));
ffmpeg.on("close", () => console.log("Channel stopped"));

// Serve HLS
app.use("/hls", express.static("hls"));

app.get("/", (req, res) => {
  res.send(`
    <h1>Channel Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
