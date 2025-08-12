import Esp32CamPlayer from "../Components/Esp32CamPlayer.jsx";

export default function Camera() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Câmera (simulada)</h1>
      <Esp32CamPlayer baseUrl="http://localhost:3000" fallbackEveryMs={1500} />
    </div>
  );
}
