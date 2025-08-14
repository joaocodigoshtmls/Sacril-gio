'use client'
import { useRef } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVideoStream } from '@/hooks/useVideoStream'

interface VideoPlayerProps {
  source: 'esp32' | 'hls'
  url: string
  onError?: (error: Error) => void
  className?: string
}
export function VideoPlayer({ source, url, onError, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { status, metrics } = useVideoStream({ source, url })
  if (status === 'error') {
    return <Alert variant="destructive"><AlertDescription>Erro ao conectar com a câmera.</AlertDescription></Alert>
  }
  const cls = (className ?? '')
  return (
    <div className={'relative ' + cls}>
      {source === 'hls'
        ? <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        : <img src={'/api/cam/stream?url=' + encodeURIComponent(url)} alt="ESP32 Stream" className="w-full h-full object-cover" />}
      <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded">
        <div className="text-xs">FPS: {metrics?.fps ?? 0}</div>
        <div className="text-xs">Latência: {metrics?.latency ?? 0}ms</div>
      </div>
    </div>
  )
}
