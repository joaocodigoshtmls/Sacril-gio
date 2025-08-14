export interface VideoStreamConfig {
  id: string;
  type: 'esp32' | 'hls' | 'rtsp';
  url: string;
  credentials?: {
    username: string;
    password: string;
  };
}

export interface StreamStatus {
  isConnected: boolean;
  error?: string;
  lastUpdated: Date;
}

export interface StreamMetrics {
  fps: number;
  bitrate: number;
  resolution: {
    width: number;
    height: number;
  };
}
