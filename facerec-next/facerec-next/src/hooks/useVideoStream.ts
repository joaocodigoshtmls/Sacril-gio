import { useEffect, useState } from 'react'
import Hls from 'hls.js'
interface UseVideoStreamParams { source: 'esp32' | 'hls'; url: string }
interface StreamMetrics { fps: number; latency: number; bitrate: number }
export function useVideoStream({ source, url }: UseVideoStreamParams) {
  const [status, setStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle')
  const [metrics, setMetrics] = useState<StreamMetrics>()
  useEffect(() => {
    setStatus('loading'); let canceled = false
    if (source === 'hls') {
      if (Hls.isSupported()) {
        const video = document.querySelector('video') as HTMLVideoElement | null
        if (video) {
          const hls = new Hls()
          hls.loadSource(url); hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => !canceled && setStatus('ready'))
          return () => { canceled = true; hls.destroy() }
        }
      } else { setStatus('error') }
    } else { setStatus('ready') } // ESP32 via <img>
    return () => { canceled = true }
  }, [source, url])
  return { status, metrics, stream: null as any }
}
