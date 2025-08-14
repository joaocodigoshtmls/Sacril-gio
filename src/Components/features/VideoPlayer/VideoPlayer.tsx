'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  source: 'esp32' | 'hls';
  url: string;
  onError?: (error: Error) => void;
  className?: string;
}

interface StreamMetrics {
  fps: number;
  latency: number;
  bitrate: number;
}

export function VideoPlayer({ source, url, onError, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [metrics, setMetrics] = useState<StreamMetrics>({
    fps: 0,
    latency: 0,
    bitrate: 0
  });

  useEffect(() => {
    if (source === 'hls' && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('ready');
          video.play().catch((error) => {
            console.error('Erro ao iniciar playback:', error);
            onError?.(error);
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setStatus('error');
            onError?.(new Error(data.details));
          }
        });

        // Métricas
        setInterval(() => {
          if (hls.levelController) {
            const metrics: StreamMetrics = {
              fps: Math.round(hls.levelController.currentLevel?.attrs.FRAME_RATE || 0),
              latency: Math.round(hls.latency || 0),
              bitrate: Math.round(hls.bandwidthEstimate / 1000) // kbps
            };
            setMetrics(metrics);
          }
        }, 1000);

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback para Safari
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setStatus('ready');
          video.play().catch(onError);
        });
        video.addEventListener('error', () => {
          setStatus('error');
          onError?.(new Error('Erro ao carregar vídeo'));
        });
      }
    }
  }, [source, url, onError]);

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erro! </strong>
        <span className="block sm:inline">Não foi possível conectar à câmera.</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {source === 'hls' ? (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
      ) : (
        <img 
          src={`/api/cam/stream?url=${encodeURIComponent(url)}`}
          alt="ESP32 Stream"
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Overlay com métricas */}
      <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded text-xs space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Latência: {metrics.latency}ms</div>
        <div>Bitrate: {metrics.bitrate}kbps</div>
      </div>
    </div>
  );
}
