// mock-cam/server.js
import 'dotenv/config';
import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const app = express();
const pipe = promisify(pipeline);

const PORT = process.env.PORT || 3000;
const ESP32_BASE = process.env.ESP32_BASE?.replace(/\/+$/,'');
const ESP32_STREAM = process.env.ESP32_STREAM || ":81/stream";
const ESP32_SNAPSHOT = process.env.ESP32_SNAPSHOT || "/capture";

app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan("dev"));

/* ===== Utils ===== */
function abs(base, rel) {
  try { return new URL(rel, base).href; } catch { return rel; }
}
async function fetchWithTimeout(url, { timeout = 20000, ...opts } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

/* ===== Health ===== */
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

/* ===== ESP32 info ===== */
app.get("/api/cam/info", async (req, res) => {
  if (!ESP32_BASE) return res.json({ active: false, reason: "no-env" });
  try {
    // testa snapshot (rápido)
    const r = await fetchWithTimeout(`${ESP32_BASE}${ESP32_SNAPSHOT}`, { timeout: 4000 });
    const ct = r.headers.get("content-type") || "";
    const ok = r.ok && (ct.includes("jpeg") || ct.includes("jpg"));
    return res.json({ active: ok, base: ESP32_BASE, ct });
  } catch {
    return res.json({ active: false, base: ESP32_BASE, reason: "unreachable" });
  }
});

/* ===== Snapshot (ESP32 ou mock) ===== */
const mockDir = path.resolve("./mock"); // coloque jpg/png aqui se quiser
app.get("/api/cam/capture", async (req, res) => {
  if (ESP32_BASE) {
    try {
      const r = await fetchWithTimeout(`${ESP32_BASE}${ESP32_SNAPSHOT}?t=${Date.now()}`, { timeout: 15000 });
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", r.headers.get("content-type") || "image/jpeg");
      return pipe(r.body, res);
    } catch {}
  }
  // mock
  const files = fs.existsSync(mockDir) ? fs.readdirSync(mockDir).filter(f => /\.(jpe?g|png)$/i.test(f)) : [];
  if (files.length) {
    res.setHeader("Cache-Control", "no-store");
    return res.sendFile(path.join(mockDir, files[Math.floor(Math.random()*files.length)]));
  }
  res.status(404).send("no snapshot");
});

/* ===== Stream MJPEG (ESP32 ou mock com frames) ===== */
app.get("/api/cam/stream", async (req, res) => {
  if (ESP32_BASE) {
    try {
      const r = await fetchWithTimeout(`${ESP32_BASE}${ESP32_STREAM}`, { timeout: 25000 });
      res.setHeader("Content-Type", r.headers.get("content-type") || "multipart/x-mixed-replace;boundary=frame");
      res.setHeader("Cache-Control", "no-store");
      return pipe(r.body, res);
    } catch (e) {
      console.error("esp32 stream error:", e.message);
    }
  }
  // mock mjpeg a partir de /frames/*.jpg (loop)
  const framesDir = path.resolve("./frames");
  const files = fs.existsSync(framesDir) ? fs.readdirSync(framesDir).filter(f => /\.(jpe?g|png)$/i.test(f)).sort() : [];
  if (!files.length) return res.status(404).send("no frames for mock");
  res.writeHead(200, { "Content-Type": "multipart/x-mixed-replace; boundary=frame" });
  let i = 0;
  const timer = setInterval(() => {
    try {
      const buf = fs.readFileSync(path.join(framesDir, files[i % files.length]));
      res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${buf.length}\r\n\r\n`);
      res.write(buf);
      res.write("\r\n");
      i++;
    } catch {
      clearInterval(timer);
      res.end();
    }
  }, 100); // ~10 fps
  req.on("close", () => clearInterval(timer));
});

/* ===== Proxy HLS (playlist + segmentos) ===== */
function rewriteMaster(txt, src) {
  return txt.split("\n").map(line => {
    if (!line || line.startsWith("#")) return line;
    const a = abs(src, line.trim());
    return `/proxy/hls?src=${encodeURIComponent(a)}`;
  }).join("\n");
}
function rewriteMedia(txt, src) {
  return txt.split("\n").map(line => {
    if (line.startsWith("#EXT-X-KEY") || line.startsWith("#EXT-X-MAP")) {
      const m = line.match(/URI="([^"]+)"/);
      if (m) {
        const a = abs(src, m[1]);
        const p = `/proxy/hls/seg?src=${encodeURIComponent(src)}&seg=${encodeURIComponent(a)}`;
        return line.replace(m[1], p);
      }
      return line;
    }
    if (line.startsWith("#")) return line;
    const a = abs(src, line.trim());
    return `/proxy/hls/seg?src=${encodeURIComponent(src)}&seg=${encodeURIComponent(a)}`;
  }).join("\n");
}
app.get("/proxy/hls", async (req, res) => {
  const src = req.query.src;
  if (!src) return res.status(400).send("missing src");
  try {
    const r = await fetchWithTimeout(src, { timeout: 25000 });
    const text = await r.text();
    const isMaster = text.includes("#EXT-X-STREAM-INF");
    const body = isMaster ? rewriteMaster(text, src) : rewriteMedia(text, src);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");
    res.send(body);
  } catch (e) {
    console.error("proxy hls error:", e.message);
    res.status(502).send("Bad gateway");
  }
});
app.get("/proxy/hls/seg", async (req, res) => {
  const { src, seg } = req.query;
  if (!src || !seg) return res.status(400).send("missing src/seg");
  try {
    const target = abs(src, seg);
    const r = await fetchWithTimeout(target, { timeout: 25000 });
    res.setHeader("Content-Type", r.headers.get("content-type") || "video/mp2t");
    res.setHeader("Cache-Control", "no-store");
    return pipe(r.body, res);
  } catch (e) {
    console.error("proxy seg error:", e.message);
    res.status(502).end();
  }
});

app.listen(PORT, () => {
  console.log(`mock-cam on http://localhost:${PORT}`);
  console.log(`• ESP32 snapshot: ${ESP32_BASE ? ESP32_BASE+ESP32_SNAPSHOT : "(mock)"}`);
  console.log(`• ESP32 stream:   ${ESP32_BASE ? ESP32_BASE+ESP32_STREAM : "(mock frames)"}`);
});
