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

// Ensure HLS folder exists
if (!fs.existsSync("hls")) fs.mkdirSync("hls");

// CHANNELS
const CHANNELS = {
  ss2: {
    url: "http://87.255.35.150:18828",
    folder: "hls/ss2"
  },
  ten3: {
    url: "http://87.255.35.150:18848",
    folder: "hls/ten3"
  },
  ss1_4k: {
    url: "http://sports-rkdyiptv.wasmer.app/play.php?id=71242",
    folder: "hls/ss1_4k"
  }
};

// Create folder if not exist
function ensureFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
    console.log("Created folder:", path);
  }
}

function startChannel(key, data) {
  ensureFolder(data.folder);

  console.log("Starting channel:", key);

  const ffmpeg = spawn("ffmpeg", [
    "-i", data.url,
    "-c:v", "copy",
    "-c:a", "copy",
    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "10",
    "-hls_flags", "delete_segments",
    `${data.folder}/playlist.m3u8`
  ]);

  ffmpeg.stderr.on("data", d => console.log(`[${key}]`, d.toString()));
  ffmpeg.on("close", () => console.log(`Channel stopped: ${key}`));
}

// Start all channels
Object.entries(CHANNELS).forEach(([key, data]) => startChannel(key, data));

// Serve HLS
app.use("/hls", express.static("hls"));

// Status page
app.get("/", (req, res) => {
  res.send(`
    <h1>Channels Running</h1>
    <ul>
      <li><a href="/hls/ss2/playlist.m3u8">Star Sports 2</a></li>
      <li><a href="/hls/ten3/playlist.m3u8">Sony TEN 3 Hindi</a></li>
      <li><a href="/hls/ss1_4k/playlist.m3u8">Star Sports 1 4K Hindi</a></li>
    </ul>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
