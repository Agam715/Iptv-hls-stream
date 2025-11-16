const express = require("express");
const { spawn } = require("child_process");
const app = express();
const path = require("path");

const streamURL = "http://87.255.35.150:18828";  // your TS source

app.use("/hls", express.static(path.join(__dirname, "hls")));

app.get("/", (req, res) => {
  res.send("HLS Restream running");
});

const ffmpeg = spawn("ffmpeg", [
  "-i", streamURL,
  "-codec: copy",
  "-f", "hls",
  "-hls_time", "2",
  "-hls_list_size", "10",
  "-hls_flags", "delete_segments",
  "hls/playlist.m3u8"
], {
  shell: true
});

ffmpeg.stderr.on("data", data => {
  console.log("FFmpeg:", data.toString());
});

ffmpeg.on("close", () => {
  console.log("FFmpeg stopped");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("HLS server running on port", PORT));
