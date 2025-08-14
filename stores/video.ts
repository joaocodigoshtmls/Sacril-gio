import { create } from 'zustand';
import type { VideoStreamConfig, StreamStatus } from '@/types/video';

interface VideoStore {
  streams: Map<string, VideoStreamConfig>;
  status: Map<string, StreamStatus>;
  addStream: (config: VideoStreamConfig) => void;
  removeStream: (id: string) => void;
  updateStatus: (id: string, status: StreamStatus) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  streams: new Map(),
  status: new Map(),
  addStream: (config) =>
    set((state) => ({
      streams: new Map(state.streams).set(config.id, config),
    })),
  removeStream: (id) =>
    set((state) => {
      const newStreams = new Map(state.streams);
      newStreams.delete(id);
      return { streams: newStreams };
    }),
  updateStatus: (id, status) =>
    set((state) => ({
      status: new Map(state.status).set(id, status),
    })),
}));
