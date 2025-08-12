import { useEffect, useRef, useState } from "react";

export default function Esp32CamPlayer({
  baseUrl = "http://localhost:3000", // mock
  fallbackEveryMs = 1500
}) {
  const imgRef = useRef(null);
  const [mode, setMode] = useState("stream");

  useEffect(() => {
    if (mode !== "stream") return;
    const img = imgRef.current;
    if (!img) return;
    img.src = `${baseUrl}/api/cam/stream`;
    const onError = () => setMode("snapshot");
    img.addEventListener("error", onError);
    return () => img.removeEventListener("error", onError);
  }, [mode, baseUrl]);

  useEffect(() => {
    if (mode !== "snapshot") return;
    let alive = true;
    const tick = async () => {
      if (!alive) return;
      try {
        const res = await fetch(`${baseUrl}/api/cam/capture?t=${Date.now()}`);
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const obj = URL.createObjectURL(blob);
        if (imgRef.current) imgRef.current.src = obj;
      } catch {}
      if (alive) setTimeout(tick, fallbackEveryMs);
    };
    tick();
    return () => { alive = false; };
  }, [mode, baseUrl, fallbackEveryMs]);

  return (
    <div style={{maxWidth: 800, margin: "0 auto"}}>
      <img ref={imgRef} alt="Stream" style={{width:"100%", borderRadius:12, display:"block"}} />
      <div style={{marginTop:8, color:"#666"}}>
        {mode === "stream" ? "Modo stream (MJPEG)" : `Modo snapshot (${fallbackEveryMs/1000}s)`}
      </div>
      <div style={{display:"flex", gap:8, marginTop:10}}>
        <button
          onClick={() => fetch(`${baseUrl}/api/cam/access?allow=1`).then(r=>r.text()).then(alert)}
          style={{background:"#16a34a", color:"#fff", padding:"8px 12px", borderRadius:8, border:0}}
        >Liberar</button>
        <button
          onClick={() => fetch(`${baseUrl}/api/cam/access?allow=0`).then(r=>r.text()).then(alert)}
          style={{background:"#dc2626", color:"#fff", padding:"8px 12px", borderRadius:8, border:0}}
        >Negar</button>
      </div>
    </div>
  );
}
