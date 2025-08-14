import { useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface UseVideoStreamParams {
  source: 'esp32' | 'hls';
  url: string;
}

interface StreamMetrics {
  fps: number;
  latency: number;
  bitrate: number;
}

export function useVideoStream({ source, url }: UseVideoStreamParams) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [metrics, setMetrics] = useState<StreamMetrics>({
    fps: 0,
    latency: 0,
    bitrate: 0
  });
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startHlsStream = useCallback((videoElement: HTMLVideoElement) => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(url);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('ready');
        videoElement.play().catch(() => {
          setStatus('error');
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus('error');
          hls.destroy();
        }
      });

      // Coletar métricas
      const metricsInterval = setInterval(() => {
        if (hls.levelController) {
          setMetrics({
            fps: Math.round(hls.levelController.currentLevel?.attrs.FRAME_RATE || 0),
            latency: Math.round(hls.latency || 0),
            bitrate: Math.round(hls.bandwidthEstimate / 1000)
          });
        }
      }, 1000);

      return () => {
        clearInterval(metricsInterval);
        hls.destroy();
      };
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback para Safari
      videoElement.src = url;
      videoElement.addEventListener('loadedmetadata', () => {
        setStatus('ready');
        videoElement.play().catch(() => setStatus('error'));
      });
    }
  }, [url]);

  const startEsp32Stream = useCallback(async () => {
    try {
      const response = await fetch(`/api/cam/stream?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Falha ao conectar com ESP32');
      
      setStatus('ready');
      // Simular métricas para ESP32
      const metricsInterval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          fps: 25, // ESP32 típico
          latency: Math.round(Math.random() * 50 + 100), // 100-150ms
          bitrate: 500 // ~500kbps
        }));
      }, 1000);

      return () => clearInterval(metricsInterval);
    } catch (error) {
      setStatus('error');
      console.error('Erro ESP32:', error);
    }
  }, [url]);

  return {
    stream,
    status,
    metrics,
    startHlsStream,
    startEsp32Stream
  };
}
